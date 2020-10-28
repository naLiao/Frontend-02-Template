var Generator = require('yeoman-generator');

// yeoman里的构造函数的方法会顺次执行
module.exports = class extends Generator {
    constructor(args, opts) {
        super(args, opts);
        this.option('babel');
    }

    initPackage() {
        const pkgJson = {
            devDependencies: {
                eslint: '^3.15.0'
            },
            dependencies: {
                react: '^16.2.0'
            }
        };

        // Extend or create package.json file in destination path
        this.fs.extendJSON(this.destinationPath('package.json'), pkgJson);
    }

    install() {
        this.npmInstall();
    }

    async step() {
        const answers = await this.prompt([
            {
                type: "input",
                name: "name",
                message: "Your project name",
                default: this.appname
            },
            // {
            //     type: "confirm",
            //     name: "cool",
            //     message: "Would you like to enable the Cool feature?"
            // }
        ])

        this.log("app name", answers.name);

        this.fs.copyTpl(
            this.templatePath('index.html'),
            this.destinationPath('public/index.html'),
            { title: answers.name }
        )
    }
}