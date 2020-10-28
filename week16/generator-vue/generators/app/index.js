var Generator = require('yeoman-generator');

// yeoman里的构造函数的方法会顺次执行
module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this.option('babel');
    }

    async initPackage() {
        // 接受用户输入项目名
        const answers = await this.prompt([
            {
                type: "input",
                name: "name",
                message: "Your project name",
                default: this.appname
            }
        ])

        // 默认package.json文件
        const pkgJson = {
            "name": answers.name,
            "version": "1.0.0",
            "description": "",
            "main": "generators/app/index.js",
            "scripts": {
                "test": "echo \"Error: no test specified\" && exit 1"
            },
            "author": "",
            "license": "ISC",
            devDependencies: {
            },
            dependencies: {
            }
        };

        // 生成或拷贝属性到package.json
        this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);

        // 安装项目依赖
        this.yarnInstall(["vue"], { 'save-dev': false });
        this.yarnInstall(["webpack", "webpack-cli", "copy-webpack-plugin",
            "vue-template-compiler", "style-loader", "css-loader", "vue-loader"], { 'save-dev': true });

        // 复制模板
        this.fs.copyTpl(
            this.templatePath('main.js'),
            this.destinationPath('src/main.js')
        )
        this.fs.copyTpl(
            this.templatePath('HelloWorld.vue'),
            this.destinationPath('src/HelloWorld.vue')
        )
        this.fs.copyTpl(
            this.templatePath('webpack.config.js'),
            this.destinationPath('webpack.config.js')
        )
        this.fs.copyTpl(
            this.templatePath('index.html'),
            this.destinationPath('src/index.html'),
            { title: answers.name }
        )
    }
}