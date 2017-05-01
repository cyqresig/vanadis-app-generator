/**
 * @since 2017-04-26 20:19
 * @author chenyiqin
 */
'use strict';

var chalk = require('chalk');
var commander = require('commander');
var inquirer = require('inquirer');
var fs = require('fs');
var install = require('./generator');
var packageJson = require('./package.json');
var packageName = packageJson.name;
var packageVersion = packageJson.version;

var generateCommand = 'init';
var addCommand = 'add';
var listCommand = 'list';
var removeCommand = 'remove';
var tplPath = './templates.json';
var repoPath = './repositories.json';
var tplOption = 'tpl';
var repoOption = 'repo';

var projectName;
var templateName;
var repositoryUrl;
var optionName = tplOption;
var currentCommand;

var generatorMethodName;

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
        console.log(options)
        if (options[tplOption]) {
            templateName = options[tplOption];
            optionName = tplOption;
        } else if (options[repoOption]) {
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
    .command(addCommand + ' <template-name|repository-url>')
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
            optionName = tplOption;
        } else if (options[repoOption]) {
            repositoryUrl = name;
            optionName = repoOption;
        } else {
            templateName = name;
        }
    });

program
    .command(listCommand)
    .option('--verbose', 'print additional logs')
    .option(
        '--tpl',
        'show template list'
    )
    .option(
        '--repo',
        'show repository list'
    )
    .allowUnknownOption()
    .action(function (options) {
        currentCommand = listCommand;
       if (options[repoOption]) {
           optionName = repoOption;
       }
    });

program.parse(process.argv);

console.log('projectName = ', projectName);
console.log('templateName = ', templateName);
console.log('repositoryUrl = ', repositoryUrl);
console.log('optionName = ', optionName);
console.log('currentCommand = ', currentCommand);

if (typeof currentCommand === 'undefined') {
    // @todo show help lines
    console.log('typeof currentCommand === undefined')
    process.exit(1);
}

if (typeof projectName === 'undefined') {
    console.error('Please specify the project directory:');
    console.log(
        ' ' + chalk.cyan(program.name()) + ' ' + generateCommand + ' ' + chalk.green('[project-directory]')
    );
    console.log();
    console.log('For example:');
    console.log(
        ' ' + chalk.cyan(program.name()) + ' ' + generateCommand + ' ' + chalk.green('my-app')
    );
    console.log();
    console.log(
        'Run ' + chalk.cyan(program.name() + ' --help') + ' to see all options.'
    );
    process.exit(1);
}

var generator = {
    initTpl: function () {
        console.log('initTpl -> ', templateName)
        if (templateName) {
            install.initByNPM(projectName, templateName);
        } else {
            inquirer.prompt({
                type: 'list',
                pageSize: 8,
                name: 'templateName',
                message: 'Please specify a template',
                choices: require(tplPath)
            }).then(function (answers) {
                console.log(`answers = `, answers)
                install.initByNPM(projectName, answers['templateName']);
            });
        }
    },
    initRepo: function (repositoryUrl) {
        console.log('initRepo -> ', repositoryUrl)
        if (repositoryUrl) {
            install.initByGit(projectName, repositoryUrl);
        } else {
            inquirer.prompt({
                type: 'list',
                pageSize: 8,
                name: 'repositoryUrl',
                message: 'Please specify a repository',
                choices: require(repoPath)
            }).then(function (answers) {
                console.log(`answers = `, answers)
                install.initByGit(projectName, answers['repositoryUrl']);
            });
        }
    },
    addTpl: function () {
        console.log('addTpl -> ', templateName)
        addTplOrRepo(templateName, tplPath);
    },
    addRepo: function () {
        console.log('addRepo -> ', repositoryUrl)
        addTplOrRepo(repositoryUrl, repoPath);
    },
    listTpl: function () {
        console.log('listTpl -> ', templateName)
        listTplOrRepo(tplPath);
    },
    listRepo: function () {
        console.log('listRepo -> ', repositoryUrl)
        listTplOrRepo(repoPath);
    }
};

generatorMethodName = currentCommand + upperCaseFisrtLetter(optionName);

if (!generator[generatorMethodName]) {
    // @todo show help lines
    return;
}

generator[generatorMethodName]();

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
    } else {
        // @todo show already have this template
    }
}

function listTplOrRepo(fileName) {
    var list = require(fileName);
    list.forEach(function(item) {
         console.log(item);
    });
}
