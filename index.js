const core = require('@actions/core');
const github = require('@actions/github');
const fs = require('fs');
try {
  let ref = github.context.ref
  let fromTag = core.getInput("from-tag")
  if (fromTag) {
    ref = `refs/tags/${fromTag}`
  }

  // There are cases, especially when triggering actions on a closed
  // event on a pull request, but there might be others, where the
  // ref just points to a branch name.
  // Since we rely on the fact that we find a refs/... there,
  // we handle the case here and make sure that we are logging the
  // context for debugging other cases.
  // The cases we know, i.e. pull_request even types, are handled here
  // directly.
  if (!ref.startsWith("refs/")) {
    core.info(
      `GitHub ref does not start with refs/ but is '${ref}'. ` +
      `The event is: '${github.context.eventName}'`)

    if (github.context.eventName === 'pull_request') {
      ref = "refs/pull/" + github.context.payload.number
    } else {
      core.warning("github.ref does not start with 'refs/': " + ref)
      core.warning("The context we found is: " +
        JSON.stringify(github.context, null, 2))
    }

  }
  core.info(`Extracting version from ${ref}`)

  const segments = ref.split("/")
  const isTag = ref.startsWith("refs/tags/")
  const isPullRequest = ref.startsWith("refs/pull/")
  const isBranch = !isTag && !isPullRequest

  let version = segments[2]
  // version tags and branches might also contain / so we need
  // to join the rest of the segments
  if (segments.length > 3 && !isPullRequest) {
    for (let i=3; i< segments.length; i++) {
      version += `/${segments[i]}`
    }
  }

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

