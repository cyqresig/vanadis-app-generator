/**
 * @since 2017-04-23 19:54
 * @author chenyiqin
 */

import program from 'commander'
import * as actions from './actions'
import appInfo from './package.json'

const {
    version,
} = appInfo

program
    .version(version)
    .usage('usage content')

program
    .command('initialize [cmd]')
    .alias('init')
    .description('Create app with no build configuration.'.x29)
    .option("-i, --info [type]", "日志")
    .action((cmd, options) => {
        const {
            _name,
        } = options
        console.lo
        console.log(`cmd = `,cmd)
        console.log(`options,`,options)
        actions[_name]()
    }).on('--help', () => {
        // 图片文字 http://ascii.mastervb.net/text_to_ascii.php
        console.log('help content')
    });

program.parse(process.argv)

if (!process.argv[2]) {
    program.help()
    console.log()
}
