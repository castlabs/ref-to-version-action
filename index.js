const core = require('@actions/core');
const github = require('@actions/github');

try {
    const ref = github.context.ref;
    core.info(`Extract version from ${ref}`);
    const segments = ref.split("/");
    let version = segments[2]
    if (version.startsWith("v")) {
        version = version.substring(1);
    }
    if (ref.startsWith("refs/pull/")) {
        version = "PR-" + version;
    }
    core.info(`Extracted version: '${version}'`)
    core.setOutput("version", version);
    core.exportVariable("REF_VERSION", version);
}catch (error) {
    core.setFailed(error)
}

