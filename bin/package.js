const fs = require("fs-extra");
const path = require("path");
// this file is designed to export final bundles for its platform.
// we suppose the binary has been compiled and exported. (i.e. : `npm run build` has been executed!)

// 1. verify if dist/ exists
try {
    fs.statSync(path.resolve(__dirname, "..", "dist"));
} catch (error) {
    console.log(error);
    return -1;
}
// 2. copy dist/ -> obsidian-panel/

// 3. add .UPDATES.yml

// 4. zip them

// 5. remove obsidian-panel/
