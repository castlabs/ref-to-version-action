const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');

try {
  let ref = github.context.ref
  let fromTag = core.getInput("from-tag")
  if (fromTag) {
    ref = `refs/tags/${fromTag}`
  }
  core.info(`Extracting version from ${ref}`)

  const segments = ref.split("/")
  const isTag = ref.startsWith("refs/tags/")
  const isPullRequest = ref.startsWith("refs/pull/")
  const isBranch = !isTag && !isPullRequest

  let version = segments[2]

  if (isTag) {
    let tagPrefix = core.getInput("tagPrefix")
    if (tagPrefix && version.startsWith(tagPrefix)) {
      version = version.substring(tagPrefix.length)
    }
  }

  if (isPullRequest) {
    version = "PR-" + version
  }

  core.info(`Extracted ref version: '${version}'`)
  const versionFile = core.getInput('versionFile');
  const versionFileSeparator = core.getInput('versionFileSeparator') || '-';
  const versionFileUsageRaw = core.getInput('useVersionFile') || 'branch,pr';
  const useVersionFileCases = versionFileUsageRaw.split(',').map(s => s.trim())
  const useVersionFile = (isBranch && useVersionFileCases.includes('branch'))
    || (isTag && useVersionFileCases.includes('tag'))
    || (isPullRequest && useVersionFileCases.includes('pr'))

  if (versionFile && useVersionFile) {
    const data = fs.readFileSync(versionFile)
    const parsedVersionFile = JSON.parse(data)
    let versionInFile = parsedVersionFile['version'];
    if (versionInFile) {
      version = `${versionInFile}${versionFileSeparator}${version}`
      core.info(`Extracted version-file version: '${versionInFile}' and created final version '${version}'`)
    } else {
      core.setFailed(`Parsed version file ${versionInFile} but could not find a 'version' property`);
      return
    }
  }

  const createRunVersionRaw = core.getInput('createRunVersion') || 'branch,pr';
  const createRunVersionCases = createRunVersionRaw.split(',').map(s => s.trim())
  const createRunVersion = (isBranch && createRunVersionCases.includes('branch'))
    || (isTag && createRunVersionCases.includes('tag'))
    || (isPullRequest && createRunVersionCases.includes('pr'))
  if(createRunVersion) {
    version = `${version}${versionFileSeparator}${github.context.runNumber}`
    core.info(`Added run number and attempt to the version '${version}'`)
  }


  core.setOutput("version", version);
  core.setOutput("isTag", isTag);
  core.setOutput("isPullRequest", isPullRequest);
  core.setOutput("isBranch", isBranch);
  core.exportVariable("REF_VERSION", version);
} catch (error) {
  core.setFailed(error)
}

