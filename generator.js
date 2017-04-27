/**
 * @since 2017-04-26 20:19
 * @author chenyiqin
 */
var chalk = require('chalk');
var commander = require('commander');
var inquirer = require('inquirer');
var fs = require('fs');
var install = require('./install');
var packageJson = require('./package.json');
var packageName = packageJson.name;
var packageVersion = packageJson.version;

var templatePackagePrefix = 'react-template-';
var generateCommand = 'init';
var addCommand = 'add';
var listCommand = 'list';
var removeCommand = 'remove';

var projectName;
var templateName;
var repositoryUrl;
var tplOption = 'tpl';
var repoOption = 'repo';
var optionName = tplOption;
var currentCommand;

var program = new commander.Command(packageName);
program
    .version(packageVersion)
    // .arguments('[project-directory]')
    .usage(`${chalk.green(generateCommand + ' [project-directory]')} [options]`)
    // .allowUnknownOption()
    .on('--help', function () {
        // 图片文字 http://ascii.mastervb.net/text_to_ascii.php
        console.log('help content')
    });

program
    .command(generateCommand + ' [project-directory]')
    .option('--verbose', 'print additional logs')
    .option(
        '--tpl [template-package]',
        'specify a npm package of template'
    )
    .option(
        '--repo [repository-url]',
        'specify url of a git repository'
    )
    .allowUnknownOption()
    .action(function (name, options) {
        currentCommand = generateCommand;
        projectName = name;
        if (options[tplOption] && options[tplOption] !== true) {
            templateName = options[tplOption];
        } else if (options[repoOption] && options[repoOption] !== true) {
            repositoryUrl = options[repoOption];
            optionName = repoOption;
        }
    });

// program
//     .command('upgrade')
//     .option('--verbose', 'print additional logs')
//     // .allowUnknownOption()
//     .on('--help', function() {
//         // 图片文字 http://ascii.mastervb.net/text_to_ascii.php
//         console.log('help content')
//     });

program
    .command(addCommand + ' <template-name | repository-url>')
    .option('--verbose', 'print additional logs')
    .option(
        '--tpl',
        'add a npm package of template'
    )
    .option(
        '--repo',
        'add url of a git repository'
    )
    .allowUnknownOption()
    .action(function (name, options) {
        currentCommand = addCommand;
        if (options[tplOption]) {
            templateName = name;
        } else if (options[repoOption]) {
            repositoryUrl = name;
            optionName = repoOption;
        } else {
            templateName = name;
        }
    });

program.parse(process.argv);

console.log('projectName = ', projectName);
console.log('templateName = ', templateName);
console.log('repositoryUrl = ', repositoryUrl);
console.log('optionName = ', optionName);

// if (typeof projectName === 'undefined') {
//     console.error('Please specify the project directory:');
//     console.log(
//         ' ' + chalk.cyan(program.name()) + ' ' + generateCommand + ' ' + chalk.green('[project-directory]')
//     );
//     console.log();
//     console.log('For example:');
//     console.log(
//         ' ' + chalk.cyan(program.name()) + ' ' + generateCommand + ' ' + chalk.green('my-app')
//     );
//     console.log();
//     console.log(
//         'Run ' + chalk.cyan(program.name() + ' --help') + ' to see all options.'
//     );
//     process.exit(1);
// }

var generator = {
    initTpl: function () {
        console.log('initTpl -> ', templateName)
        if (templateName) {
            install.initByNPM(templateName);
        } else {
            inquirer.prompt({
                type: 'list',
                pageSize: 8,
                name: 'templateName',
                message: 'Please specify a template',
                choices: require('./templates.json')
            }).then(function (answers) {
                console.log(`answers = `, answers)
                install.initByNPM(answers['templateName']);
            });
        }
    },
    initRepo: function (repositoryUrl) {
        console.log('initRepo -> ', repositoryUrl)
    },
    addTpl: function () {
        console.log('addTpl -> ', templateName)
        addTplOrRepo(templateName, './templates.json');
    },
    addRepo: function () {
        console.log('addRepo -> ', repositoryUrl)
        addTplOrRepo(repositoryUrl, './repositories.json');
    }
};

generator[currentCommand + upperCaseFisrtLetter(optionName)]();

function upperCaseFisrtLetter(str) {
    return str.replace(/\b(\w)|\s(\w)/g, function (m) {
        return m.toUpperCase();
    });
}

function addTplOrRepo(name, fileName) {
    var list = require(fileName);
    console.log(name + ' -> ', list)
    if (list.indexOf(name) === -1) {
        list.unshift(name);
        console.log(name + ' 2 -> ', list)
        fs.writeFileSync(fileName, JSON.stringify(list, null, 4));
    }
}
