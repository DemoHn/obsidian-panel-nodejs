const fs = require("fs-extra");
const path = require("path");
const os = require("os");
const mkdirp = require("mkdirp");
const cp = require("child_process");
const argv = process.argv;

// 1. build frontend
cp.execSync("npm run build", {cwd: path.resolve(__dirname, "..", "frontend"), stdio:[0,1,2]});

// 2. rm -r static/js/*.map & rm -r static/css/*.map
const root_static = path.resolve(__dirname, "..", "static");
let js_dirs = fs.readdirSync(path.resolve(root_static, "js"));
for(let i=0;i<js_dirs.length;i++){
    if(/map$/.test(js_dirs[i]) === true){
        fs.unlinkSync(path.resolve(root_static, "js", js_dirs[i]));
    }
}

let css_dirs = fs.readdirSync(path.resolve(root_static, "css"));
for(let i=0;i<css_dirs.length;i++){
    if(/map$/.test(css_dirs[i]) === true){
        fs.unlinkSync(path.resolve(root_static, "css", css_dirs[i]));
    }
}

// 3. mkdir -p
mkdirp.sync(path.resolve(__dirname, "dist", "bin"));

// 4. enclose
let export_exe = "obsidian";
if(/^win/.test(os.platform()) === true){
    export_exe = "obsidian.exe";
}
cp.execSync(`enclose -v 6.3.1 -c .enclose.config.js -o ${export_exe} start-panel.js`, 
    {cwd: path.resolve(__dirname, ".."), stdio:[0,1,2]});

// 5. copy node_sqlite3.node to binary dir
// 5.1 find the location of node_sqlite3.node

const binding_root = path.resolve(__dirname, "../node_modules/sqlite3/lib/binding");
let binding_dir = fs.readdirSync(binding_root);
let sqlite3_node_dir = fs.readdirSync(path.resolve(binding_root, binding_dir[0]));
let sqlite3_node = path.resolve(binding_root, binding_dir[0], sqlite3_node_dir[0]);

// 5.2 cp node_modules/sqlite3/lib/binding/*/node_sqlite3.node dist/bin
fs.copySync(sqlite3_node, path.resolve(__dirname, `../dist/bin/${sqlite3_node_dir[0]}`));

// 5.3 move obsidian(.exe) to dist/bin
fs.renameSync(path.resolve(__dirname, `../${export_exe}`), path.resolve(__dirname, "../dist/bin/"+export_exe));

// 6. copy config.yml
fs.renameSync(path.resolve(__dirname, `../config.yml.sample`), path.resolve(__dirname, "../dist/bin/config.yml"));

// 7. touch .startup.lck
fs.writeFileSync(path.resolve(__dirname, "../dist/bin/.startup.lck"),"", {flag:"w+"});
