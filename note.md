参考, react-native, create-app

使用第三方库

安装vanadis时，
会安装vanadis-app-generator包
vanadis-cli包（依赖包）
vanadis-git-upgrade（依赖包，修改git变量，并不需要设置仓库地址）


init
1. 验证包名是否符合规则

2. 安装指定的script脚本package包(以方便更新版本，该script包命名可以为vanadis-scripts，单独发布及更新npm包)

3. 安装指定的templates(分别包括react-components, react-redux, react-router, 后期会加入react-native-components，react-native, 这些templates建议单独发布及更新npm包)

4. 执行copy逻辑。

upgrade
1. 


依赖包
1. chalk 定制控制台日志的输入样式，可以非常的个性化
2. validate-npm-package-name 验证是否是合法的npm包名
3. readline 获取行输入

步骤：
1. package.json文件中增加
    ```js
    "bin": {
      "vanadis-app": "index.js"
    },
    ```
    vanadis-app为安装完包后可使用的命令
    
2. 入口文件顶部加上`#!/usr/bin/env node`

3. 检查当前的node版本，通过process全局对象

4. 创建命令及参数

4.1 命令 init 参数 <project-directory>
    
    创建目录, 并创建模板，如果没有-tpl参数，则默认tpl

4.2 init 子命令 --tpl 参数 <template-name>   
    
    基于npm包创建模板
    如果没有参数，则显示出列表，并提示选择一个记忆的template-name进行选择
    如果没有任何记忆过的template，则提示需要template-name
    
4.3 init 子命令 --repo 参数 <repository-url>    

    基于git仓库地址创建模板
    如果没有参数，则显示出列表，并提示选择一个记忆的repository-name进行选择
    如果没有任何记忆过的repository，则提示需要repository-name
        
4.3 命令 add 参数 <template-name> | <repository-url> 

    增加记忆的模板名称，默认带--tpl参数

4.4 add 子命令 --tpl

    增加基于npm包的模板名称记录

4.5 add 子命令 --repo

    增加基于git仓库地址的模板名称记录（根据仓库地址自动组装repository-name）
    
4.6 命令list 
    
    显示出模板名称列表，默认带--tpl参数
    
4.7 list 子命令 --tpl
   
    显示出基于npm包的模板列表

4.8 list 子命令 --repo

    显示出基于git仓库地址的模板列表
    
4.9 命令 remove <template-name> | <repository-name>   

    删除记忆的模板名称，默认带--tpl参数
    
5.0 remove 子命令 --tpl
 
    删除基于npm包的模板名称记录
    
5.1 remove 子命令 --repo

    删除基于git仓库地址的模板名称记录
           
        



