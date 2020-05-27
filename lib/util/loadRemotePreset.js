const fs = require('fs-extra')

module.exports = async function loadRemotePreset(repository, dir) {
  const os = require('os')
  const path = require('path')
  const download = require('download-git-repo')

  const presetName = repository
    .replace(/((?:.git)?#.*)/, '')
    .split('/')
    .slice(-1)[0]
    // for direct urls, it's hard to get the correct project name,
    // but we need to at least make sure no special characters remaining
    .replace(/[:#]/g, '')

  await new Promise((resolve, reject) => {
    download(repository, dir, err => {
      if (err) return reject(err)
      resolve()
    })
  })
}
