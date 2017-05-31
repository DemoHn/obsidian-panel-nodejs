const utils = require("../../utils");
const fs = require("fs");
/*
Notes:
  1) version stamp model:

  time: 0000000000
  inst_id: 0 <for global K-V storage>
  key: current_version
  value: <version value>

  2) migration SQL file naming template:

  <No.>_v<6-digit-Version>.sql
  e.g.:
  00_v000601.sql (v0.6.1)
  01_v010203.sql (v1.2.3)
*/
const _write_version_stamp = (model, is_insert, version) => {
    return new Promise((resolve, reject) => {
        if(is_insert){
            model.create({
                time: "0000000000",
                inst_id: 0,
                key: "current_version",
                value: version
            }).then(resolve, reject);
        }else{
            model.update({value: version}, {where: {key:"current_version"}})
            .then(resolve, reject);
        }
    });      
};

const _generate_migrate_sql = (all_files, version, target_version) => {
    function version_6digit(version) {
        let version_arr = version.split(".");

        let digit_str = "";
        if(version_arr.length == 1){
            version_arr[1] = 0;
            version_arr[2] = 0;
        }else if(version_arr.length == 2){
            version_arr[2] = 0;
        }

        for(let i=0;i<3;i++){
            digit_str += (Array(Math.max(3 - String(version_arr[i]).length, 0)).join(0) + version_arr[i]);
        }
        return digit_str;
    }

    const _migrate_dir = utils.resolve(__dirname , "../../static/_migrate");
    _migrate_files = fs.readdirSync(_migrate_dir);

    let version_6d = parseInt(version_6digit(version));
    let target_version_6d = parseInt(version_6digit(target_version));
    let _migrate_arr = [];

    for(let i in _migrate_files){
        let _migrate_filename = _migrate_files[i];

        let re = /(\d\d)_v([0-9]{6})\.sql/;
        if(re.test(_migrate_filename)){
            let version_stamp = parseInt(re.exec(_migrate_filename)[2]);

            if(all_files === true || 
                version_stamp > version_6d && version_stamp <= target_version_6d){
                _migrate_arr.push(utils.read(utils.resolve(_migrate_dir, _migrate_filename)));
            }
        }
    }

    return _migrate_arr.join("");
};

const _execute_sql = (sql, sequelize) => {
    return new Promise((resolve, reject) => {
        if(sql == null || sql == ""){
            resolve();
        }else{
            try{
                console.log("[DB] upgrading original database...");
                
                sequelize.query(sql).spread((results, metadata) => {            
                    resolve();
                })
            }catch(err) {
                reject(err);
            }            
        }
    })
}

module.exports = (sequelize, history_data_model) => {
  
    return new Promise((resolve, reject) => {
        // first the version stamp inside the db
        // to determine where to start migration 
        history_data_model.findOne({where: {key: "current_version"}}).then((data)=>{
            // find data
            if(data == null){
                //
                // migrate all sqls and don't forget creating 'current_version' key!
                //
                let sql = _generate_migrate_sql(true, "0.0.0", utils.get_version());
                _execute_sql(sql, sequelize).then((data) => {
                    _write_version_stamp(history_data_model, true, utils.get_version()).then((data)=>{
                        resolve();
                    },(err)=>{
                        console.log(err);
                        reject();
                    });                    
                }, (err) => {
                    reject(err);
                });
            }else{
                let version = data.value;
                let sql = _generate_migrate_sql(false, version, utils.get_version());
                _execute_sql(sql, sequelize).then((data)=>{
                    _write_version_stamp(history_data_model, false, utils.get_version()).then((data)=>{
                        resolve();
                    },(err)=>{
                        console.log(err);
                        reject();
                    });        
                },(err)=>{
                    reject(err);
                });
            }
            
            resolve();
        },(err)=>{
            reject(err);
        });
    });
};