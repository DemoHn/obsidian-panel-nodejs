const utils = require("../../utils");
const model = require("../model");

const cp = require("child_process");

module.exports = {
    // No.1 After receiving bundle, the first step is to extract meta file (which is .UPDATES.yml) to verify whether
    // it can be installed or not.
    verify_upgrade_bundle: (req, res, next) => {
        
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