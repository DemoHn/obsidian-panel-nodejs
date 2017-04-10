module.exports = {
    scripts: [
        "./app/**/*.js",
        "./tools/**/*.js",
        "./ftp_manager/**/*.js",
        "start-panel.js"
    ],
    assets: [
        "./static/**/*",
        "config.yml.sample",
        "package.json",
    ],
    dirs: [
        "./app/model"
    ]
}
