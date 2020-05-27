const path = require('path')
const debug = require('debug')
const inquirer = require('inquirer')
const EventEmitter = require('events')
const cloneDeep = require('lodash.clonedeep')
const loadRemotePreset = require('./util/loadRemotePreset')

const {
  chalk,
  execa,

  log,
  warn,
  error,

  hasGit,
  hasProjectGit,
  hasYarn,
  hasPnpm3OrLater,
  hasPnpmVersionOrLater,

  exit,
  loadModule
} = require('@vue/cli-shared-utils')


module.exports = class Creator extends EventEmitter {
  constructor(name, context) {
    super()
    this.name = name
    this.context = context
    this.injectedPrompts = []
    this.promptCompleteCbs = []
    this.afterInvokeCbs = []
    this.afterAnyInvokeCbs = []

    this.run = this.run.bind(this)

  }

  async create(cliOptions = {}) {
    const { run, name, context } = this
    if (cliOptions.preset) {
      await this.resolvePreset(cliOptions.preset, context)
    }

    log(`✨`, `Creating project in ${chalk.yellow(context)}.`)

    // intilaize git repository before installing deps
    // so that vue-cli-service can setup git hooks.
    const shouldInitGit = this.shouldInitGit(cliOptions)
    if (shouldInitGit) {
      log(`🗃`, `Initializing git repository...`)
      await run('git init')
    }

    // commit initial state
    if (shouldInitGit) {
      await run('git add -A')
      const msg = typeof cliOptions.git === 'string' ? cliOptions.git : 'init'
      try {
        await run('git', ['commit', '-m', msg])
      } catch (e) {
        log(`commit initial fail ${e}`)
      }
    }

    // log instructions
    log()
    log(`🎉  Successfully created project ${chalk.yellow(name)}.`)
    if (!cliOptions.skipGetStarted) {
      log(
        `👉  Get started with the following commands:\n\n` +
        (this.context === process.cwd() ? `` : chalk.cyan(` ${chalk.gray('$')} cd ${name}\n`)) +
        chalk.cyan(` ${chalk.gray('$')} npm install\n`) +
        chalk.cyan(` ${chalk.gray('$')} npm run dev`)
      )
    }
    log()
  }

  run(command, args) {
    if (!args) { [command, ...args] = command.split(/\s+/) }
    return execa(command, args, { cwd: this.context })
  }

  async resolvePreset(name, context) {
    const savedPresets = {}
    log(`Fetching remote preset ${chalk.cyan(name)}...`)
    try {
      await loadRemotePreset(name, context)
    } catch (e) {
      error(`Failed fetching remote preset ${chalk.cyan(name)}:`)
      throw e
    }
  }

  shouldInitGit(cliOptions) {
    if (!hasGit()) {
      return false
    }
    // --git
    if (cliOptions.forceGit) {
      return true
    }
    // --no-git
    if (cliOptions.git === false || cliOptions.git === 'false') {
      return false
    }
    // default: true unless already in a git repo
    return !hasProjectGit(this.context)
  }
}