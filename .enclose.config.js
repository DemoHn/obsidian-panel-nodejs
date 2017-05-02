module.exports = {
    scripts: [
        "./app/**/*.js",
        "./tools/**/*.js",
        "./node_modules/shelljs/src/*.js",
        "start-panel.js"
    ],
    assets: [
        "./static/**/*",
        "config.yml.sample",
        "package.json",
    ],
    dirs: [
        "./app/model",
        "./tools"
    ]
}
