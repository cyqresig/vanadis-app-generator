#!/usr/bin/env node

/**
 * @since 2017-04-23 18:55
 * @author chenyiqin
 */

'use strict';

var chalk = require('chalk');

var currentNodeVersion = process.versions.node;
var majorVersion = currentNodeVersion.split('.')[0];

if (majorVersion < 4) {
    console.error(
        chalk.red(
            'You are running Node ' +
            currentNodeVersion +
            '.\n' +
            'Vanadis App Generator requires Node 4 or higher. \n' +
            'Please update your version of Node.'
        )
    );
}

require('./generator');
