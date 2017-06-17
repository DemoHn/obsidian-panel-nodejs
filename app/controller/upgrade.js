const utils = require("../../utils");
const model = require("../model");

const os = require("os"),
      fs = require("fs"),
      yaml = require("js-yaml"),
      cp = require("child_process");

const _verify_version_requirement = (min_requirement, new_version) => {
    // return value [<min_requirement?>, <version is higher than current?>]
    if(min_requirement == null|| new_version == null){
        return [false, false];
    }

    const current_version = utils.get_version();
    let curr_ver_arr = current_version.split(".");
    let min_requirement_arr = min_requirement.split(".");
    let new_version_arr = new_version.split(".");

    // version accmulation value
    // i.e. 0.5.8 -> 508
    //      1.23.5 -> 12305
    //      2.7.6.4 -> 20706.04 
    let curr_ver_val = 0, min_requirement_val = 0, new_version_val = 0;
    let _mult = 10000;
    for(let i=0;i<curr_ver_arr.length;i++){
        curr_ver_val += _mult * parseInt(curr_ver_arr[i]);
        _mult = _mult * 0.01;
    }

    _mult = 10000;
    for(let j=0;j<min_requirement_arr.length;j++){
        min_requirement_val += _mult * parseInt(min_requirement_arr[j]);
        _mult = _mult * 0.01;
    }

    // new version calc
    _mult = 10000;
    for(let k=0;k<new_version_arr.length;k++){
        new_version_val += _mult * parseInt(new_version_arr[k]);
        _mult = _mult * 0.01;
    }

    let _min_requirement = false,
        _up_grade = false;

    _min_requirement = curr_ver_val > min_requirement_val;
    _up_grade = new_version_val > curr_ver_val;    
    return [_min_requirement, _up_grade];
};

module.exports = {
    // No.1 After receiving bundle, the first step is to extract meta file (which is .UPDATES.yml) to verify whether
    // it can be installed or not.
    verify_upgrade_bundle: (req, res, next) => {
        const filename = req.file.filename;

        const data_dir = utils.get_config()["global"]["data_dir"];
        const file_dir = utils.resolve(data_dir, "files");

        const __meta_file_name = ".UPDATES.yml";
        const __dest_tmp_dir = os.tmpdir();
        const __target = utils.resolve(file_dir, filename);
        const cmd_args = `--method=extract_file --target=${__target} --type=zip --file=${__meta_file_name} --dest=${__dest_tmp_dir}`;

        // No.1 remove old META file (whether it exist or not)
        try {
            fs.unlinkSync(utils.resolve(__dest_tmp_dir, __meta_file_name));    
        } catch (error) {
            
        }
        // No.2 extract META file from bundle

        // launch downloader process!
        const unzip_module = utils.resolve(
            __dirname,
            "../../tools/unzip"
        );
        let proc = cp.fork(unzip_module, cmd_args.split(" "), {silent: true});

        // get result from stdout
        proc.on('exit', () => {
            const META_file = utils.resolve(__dest_tmp_dir, __meta_file_name);
            // if META file exists
            if(fs.existsSync(META_file)){
                try {
                    let doc = yaml.safeLoad(utils.read(META_file));

                    // verify 
                    let rtn_model = {
                        version: doc["version"],
                        release_date: doc["release_date"]
                    }

                    let _verify_result = _verify_version_requirement(doc["min_requirement"], doc["version"]);
                    if(!_verify_result[0]){
                        res.error(702)
                    }else if(!_verify_result[1]){
                        res.error(703);
                    }else{
                        res.success(rtn_model);
                    }
                    
                } catch (error) {
                    console.log(error);
                    res.error(701);
                }
            }else{
                res.error(700);
            }
        });
    },
    
    // No.2 Extract the new bundle to current directory
    // we will firstly remove obsidian-panel-new-version/ directory and then create a brand new one in which the extract files will be extracted. 
    extract_bundle: (req, res, next) => {

    },

    // No.3 Execute upgrade script to upgrade all files
    // Notice the script will shutdown the process to finish this operation,
    // thus there won't be any response!
    execute_upgrade_script: (req, res) => {

    }
};