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
    // .arguments('<project-directory>')
    .usage(`${chalk.green(generateCommand + ' <project-directory>')} [options]`)
    // .allowUnknownOption()
    .on('--help', function () {
        showHelps();
    });

program
    .command(generateCommand + ' <project-directory>')
    .option('--verbose', 'print additional logs')
    .option(
        '--tpl [template-package]',
        'specify a npm package of template'
    )
    .option(
        '--repo [repository]',
        'specify url of a git repository'
    )
    .allowUnknownOption()
    .action(function (name, options) {
        currentCommand = generateCommand;
        projectName = name;
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
    .command(addCommand + ' <npm-package|repository>')
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

program.parse(process.argv);

if (typeof currentCommand === 'undefined') {
    showHelps();
    process.exit(1);
}

if (typeof projectName === 'undefined') {
    console.error('Please specify the project directory:');
    console.log(
        ' ' + chalk.cyan(program.name()) + ' ' + generateCommand + ' ' + chalk.green('<project-directory>')
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
                install.initByNPM(projectName, answers['templateName']);
            });
        }
    },
    initRepo: function (repositoryUrl) {
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
                install.initByGit(projectName, answers['repositoryUrl']);
            });
        }
    },
    addTpl: function () {
        addTplOrRepo(templateName, tplPath);
    },
    addRepo: function () {
        addTplOrRepo(repositoryUrl, repoPath);
    }
};

generatorMethodName = currentCommand + upperCaseFisrtLetter(optionName);

if (!generator[generatorMethodName]) {
    showHelps();
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
    if (list.indexOf(name) === -1) {
        list.unshift(name);
        fs.writeFileSync(fileName, JSON.stringify(list, null, 4));
    }
}

function showHelps () {
    console.log(`  command ${chalk.green('init <project-directory>')} to initialize project.`);
    console.log(
        `    ${chalk.cyan('--tpl [npm-package]')} to fetch template from npm `
    );
    console.log();
    console.log(
        `    ${chalk.cyan('--tpl [npm-package]')} to fetch template from npm `
    );
    console.log(
        `    ${chalk.cyan('--repo [repository]')} to fetch template from git `
    );
    console.log();
    console.log(`  command ${chalk.green('add')} to cache a npm package name or a git repository url.`);
    console.log(
        `    ${chalk.cyan('--tpl [npm-package]')} to cache a npm package name `
    );
    console.log(
        `    ${chalk.cyan('--repo [repository]')} to cache a git repository url `
    );
    console.log();
    console.log(`  command ${chalk.green('list')} to show all cached npm package names or git repository urls.`);
    console.log(
        `    ${chalk.cyan('--tpl')} to show all cached npm package names `
    );
    console.log(
        `    ${chalk.cyan('--repo')} to show all git repository urls `
    );
    console.log();
    console.log(
        `    If you have any problems, do not hesitate to file an issue:`
    );
    console.log(
        `      ${chalk.cyan('https://github.com/cyqresig/vanadis-app-generator/issues/new')}`
    );
    console.log();
}
