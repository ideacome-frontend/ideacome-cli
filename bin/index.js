#!/usr/bin/env node

const fs = require('fs')
const program = require('commander')
const loadCommand = require('../lib/util/loadCommand')
const { chalk, semver } = require('@vue/cli-shared-utils')
const minimist = require('minimist')

program
  .version(`ideacome cli ${require('../package').version}`)
  .usage('<command> [options]')


program
  .command('create <project-name>')
  .description('create a new project powered by ideacome-cli')
  .option('-g, --git [message]', 'Force git initialization with initial commit message')
  .option('--no-git', 'Skip git initialization')
  .option('--merge', 'Merge target directory if it exists')
  .action((name, cmd) => {
    const options = cleanArgs(cmd)
    if (minimist(process.argv.slice(3))._.length > 1) {
      console.log(chalk.yellow('\n Info: You provided more than one argument. The first one will be used as the app\'s name, the rest are ignored.'))
    }
    // --git makes commander to default git to true
    if (process.argv.includes('-g') || process.argv.includes('--git')) {
      options.forceGit = true
    }
    options.preset = "ideacome-frontend/vue-admin-template"
    require('../lib/create')(name, options)
  })

program.parse(process.argv)


if (!process.argv.slice(2).length) {
  program.outputHelp()
}


function camelize(str) {
  return str.replace(/-(\w)/g, (_, c) => c ? c.toUpperCase() : '')
}

// commander passes the Command object itself as options,
// extract only actual options into a fresh object.
function cleanArgs(cmd) {
  const args = {}
  cmd.options.forEach(o => {
    const key = camelize(o.long.replace(/^--/, ''))
    // if an option is not present and Command has a method with the same name
    // it should not be copied
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key]
    }
  })
  return args
}
