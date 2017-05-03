/**
 * @since 2017-04-27 22:53
 * @author chenyiqin
 */
'use strict';

var path = require('path');
var fs = require('fs-extra');
var validateProjectName = require('validate-npm-package-name');
var execSync = require('child_process').execSync;
var spawn = require('cross-spawn');
var semver = require('semver');
var chalk = require('chalk');

var templatePackageSuffix = '-template';
var modulePath = 'node_modules';
var ignorePackageJSONKeys = ['name', 'version', 'readme', 'optionalDependencies', 'maintainers', 'gitHead', 'dist', 'directories', 'description', 'author', 'publish_time'];
var packageJSONFileName = 'package.json';
var npmignoreFileName = '.npmignore';
var gitignoreFileName = '.gitignore';
var npmrcFakeFileName = 'npmrc';
var npmrcFileName = '.npmrc';
var repoDirectory = 'repository';
var repoPath = path.join(__dirname, repoDirectory);
var isVerbose;
var projectName;
var templateName;
var templatePath;
var packageName;
var projectPath;

function initByNPM(name, tplName, verbose) {
    projectName = name;
    templateName = tplName;
    packageName = templateName + templatePackageSuffix;
    templatePath = path.join(modulePath, packageName);
    isVerbose = verbose;
    createDirectory().then(function () {
        return installTemplatePackage()
    }).then(function () {
        return copy(templatePath);
    }).then(function () {
        restoreIgnoreFiles();
    }).then(function () {
        removeTemplate(templatePath)
    }).then(function () {
        rewritePackageJSON();
    }).then(function () {
        return installDependencies();
    }).then(function () {
        showSuccessMessage();
    }).catch(function (error) {
        console.error(error);
    });
}

function initByGit(name, repositoryUrl, verbose) {
    projectName = name;
    isVerbose = verbose;
    createDirectory().then(function () {
        return gitCloneRepository(repositoryUrl);
    }).then(function () {
        clearRepositoryGitFiles();
    }).then(function () {
        return copy(repoPath);
    }).then(function () {
        removeFakeFiles();
    }).then(function () {
        removeTemplate(repoPath);
    }).then(function () {
        rewritePackageJSON();
    }).then(function () {
        return installDependencies();
    }).then(function () {
        showSuccessMessage();
    }).catch(function (error) {
        console.error(error);
    });
}

function shouldUseYarn() {
    try {
        execSync('yarnpkg --version', { stdio: 'ignore' });
        return true;
    } catch (e) {
        return false;
    }
}

function checkNpmVersion() {
    let isNpm2 = false;
    try {
        var npmVersion = execSync('npm --version').toString();
        isNpm2 = semver.lt(npmVersion, '3.0.0');
    } catch (err) {
        return;
    }
    if (!isNpm2) {
        return;
    }
    console.log(chalk.yellow('It looks like you are using npm 2.'));
    console.log(
        chalk.yellow(
            'We suggest using npm 3 or Yarn for faster install times ' +
            'and less disk space usage.'
        )
    );
    console.log();
}

function checkAppName(appName) {
    const validationResult = validateProjectName(appName);
    if (!validationResult.validForNewPackages) {
        console.error(
            'Could not create a project called ' + chalk.red('"' + appName + '"') + ' because of npm naming restrictions:'
        );
        printValidationResults(validationResult.errors);
        printValidationResults(validationResult.warnings);
        process.exit(1);
    }
}

function createDirectory() {
    return new Promise(function (resolve, reject) {

        var dirPath = process.cwd();
        projectPath = path.join(dirPath, projectName);
        if (fs.existsSync(projectPath)) {
            reject('directory already exist');
        } else {
            fs.mkdirSync(projectPath);
            resolve();
        }
    });
}

function installTemplatePackage() {
    return new Promise(function (resolve, reject) {
        var command;
        var args;
        var child;
        process.chdir(__dirname);
        checkNpmVersion();
        checkAppName(projectName);
        command = 'npm';
        args = ['install'].concat(packageName);
        if (isVerbose) {
            args.push('--verbose');
        }

        child = spawn(command, args, { stdio: 'inherit' });
        child.on('close', code => {
            if (code !== 0) {
                reject({
                    command: `${command} ${args.join(' ')}`,
                });
                return;
            }
            resolve();
        });
    });
}

function gitCloneRepository(repositoryUrl) {
    return new Promise(function (resolve, reject) {
        var command;
        var args;
        var child;
        command = 'git';
        args = ['clone', repositoryUrl, repoPath];

        if (isVerbose) {
            args.push('--verbose');
        }

        if (fs.existsSync(repoPath)) {
            fs.removeSync(repoPath);
        }

        child = spawn(command, args, { stdio: 'inherit' });
        child.on('close', code => {
            if (code !== 0) {
                reject({
                    command: `${command} ${args.join(' ')}`,
                });
                return;
            }
            resolve();
        });
    });
}

function copy(templatePath) {
    return new Promise(function (resolve, reject) {
        fs.copy(templatePath, projectPath).then(function () {
            resolve();
        }).catch(function (error) {
            reject(error);
        });
    });
}

function rewritePackageJSON() {
    var packageJSONFilePath = path.join(projectPath, packageJSONFileName);
    var packageJSON = fs.readJsonSync(packageJSONFilePath);
    var newPackageJSON = {
        name: projectName,
        version: '1.0.0'
    };
    Object.keys(packageJSON).forEach(function (key) {
        if (key.indexOf('_') !== 0 && ignorePackageJSONKeys.indexOf(key) === -1) {
            newPackageJSON[key] = packageJSON[key];
        }
    });
    fs.writeJsonSync(packageJSONFilePath, newPackageJSON, { spaces: 4 });
}

function installDependencies() {
    return new Promise(function (resolve, reject) {
        var command;
        var args;
        var child;
        var useYarn = shouldUseYarn();
        process.chdir(projectPath);
        if (useYarn) {
            command = 'yarnpkg';
        } else {
            command = 'npm';
        }
        args = ['install'];

        if (isVerbose) {
            args.push('--verbose');
        }

        child = spawn(command, args, { stdio: 'inherit' });
        child.on('close', code => {
            if (code !== 0) {
                reject({
                    command: `${command} ${args.join(' ')}`,
                });
                return;
            }
            resolve();
        });
    });
}

function clearRepositoryGitFiles() {
    process.chdir(repoPath);
    execSync('find . -name ".git" | xargs rm -Rf');
}

function removeTemplate(templatePath) {
    fs.removeSync(templatePath);
}

function restoreIgnoreFiles() {
    var npmignoreFilePath = path.join(projectPath, npmignoreFileName);
    var gitignoreFilePath = path.join(projectPath, gitignoreFileName);
    var npmrcFakeFilePath = path.join(projectPath, npmrcFakeFileName);
    var npmrcFilePath = path.join(projectPath, npmrcFileName);
    if (fs.existsSync(npmignoreFilePath)) {
        fs.renameSync(npmignoreFilePath, gitignoreFilePath);
    }
    if (fs.existsSync(npmrcFakeFilePath)) {
        fs.renameSync(npmrcFakeFilePath, npmrcFilePath);
    }
}

function removeFakeFiles() {
    var npmrcFakeFilePath = path.join(projectPath, npmrcFakeFileName);
    if (fs.existsSync(npmrcFakeFilePath)) {
        fs.removeSync(npmrcFakeFilePath);
    }
}

function showSuccessMessage() {
    console.log();
    console.log(`Success! Created ${projectName} at ${projectPath}`);
    console.log();
    console.log('Happy hacking!');
}

module.exports = {
    initByNPM,
    initByGit,
}
