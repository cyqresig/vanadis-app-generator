/**
 * @since 2017-04-23 20:11
 * @author chenyiqin
 */

import execa from 'execa'

export const initialize = async () => {
    console.log('initialize...')
    try {
        await execa.shell('mkdir test-generator')
        await execa.shell('git clone https://github.com/cyqresig/vanadis-app-generator "./test-generator"')
        const result = await execa.shell('find ./test-generator -name ".git" | xargs rm -Rf')
    } catch(err) {
        console.log(`err.msg = `, err.message)
        console.log(`err.stack = `, err.stack)
    }

    console.log('initialize end...')
}
