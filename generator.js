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
var ignorePackageJSONKeys = ['name', 'version', 'readme', 'optionalDependencies', 'maintainers', 'gitHead', 'dist', 'directories', 'description', 'author'];
var packageJSONFileName = 'package.json';
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
    console.log('initByNPM...templateName = ', templateName)
    console.log('initByNPM...projectName = ', projectName)
    createDirectory().then(function () {
        return installTemplatePackage()
    }).then(function () {
        return copy(templatePath);
    }).then(function () {
        rewritePackageJSON();
    }).then(function () {
        return installDependencies();
    }).then(function () {
        console.log('init success!');
        // @todo show init success message lines
    }).catch(function (error) {
        console.log(error);
    });
}

function initByGit(name, repositoryUrl, verbose) {
    projectName = name;
    isVerbose = verbose;
    console.log('initByGit...projectName = ', projectName)
    console.log('initByGit...repositoryUrl =', repositoryUrl)
    createDirectory().then(function () {
        return gitCloneRepository(repositoryUrl);
    }).then(function () {
        clearRepositoryGitFiles();
    }).then(function () {
        return copy(repoPath);
    }).then(function () {
        rewritePackageJSON();
    }).then(function () {
        return installDependencies();
    }).then(function () {
        console.log('init success!');
        // @todo show init success message lines
    }).catch(function (error) {
        console.log(error);
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
            `Could not create a project called ${chalk.red(`"${appName}"`)} because of npm naming restrictions:`
        );
        printValidationResults(validationResult.errors);
        printValidationResults(validationResult.warnings);
        process.exit(1);
    }
}

function createDirectory() {
    return new Promise(function (resolve, reject) {
        console.log('dirPath = ', dirPath)
        console.log('projectName = ', projectName)

        var dirPath = process.cwd();
        projectPath = path.join(dirPath, projectName);
        if (fs.existsSync(projectPath)) {
            console.log('directory already exist');
            reject('directory already exist');
        } else {
            console.log('fs.mkdirSync...');
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
        var packagePath = path.join(__dirname, modulePath, packageName);
        process.chdir(__dirname);
        checkNpmVersion();
        checkAppName(projectName);
        command = 'npm';

        console.log('packagePath = ', packagePath)
        console.log('fs.existsSync(packagePath) = ', fs.existsSync(packagePath))

        args = [fs.existsSync(packagePath) ? 'upgrade' : 'install'].concat(packageName);
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
        console.log('copy templatePath = ', templatePath)
        console.log('copy projectPath = ', projectPath)
        fs.copy(templatePath, projectPath).then(function () {
            console.log('copy success');
            resolve();
        }).catch(function (error) {
            reject(error);
        });
    });
    // fs.createReadStream(packagePath).pipe(fs.createWriteStream(projectPath));
}

function rewritePackageJSON() {
    console.log('projectPath ;;;; ', projectPath)
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

module.exports = {
    initByNPM,
    initByGit,
}
