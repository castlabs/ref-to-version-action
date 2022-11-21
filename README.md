# Ref to Version Action

This action takes a takes the `github_ref` and extracts an opinionated
version string. By default, the third segment of the ref is returned,
which refers to the branch name.

The special cases that are handled are **pull requests** and **tags**. 
For tags, the tag is returned as a version and a "v" prefix is removed, 
i.e. the tag `v1.0` will return version `1.0`. Pull Requests refs are 
converted to `PR-<number>` versions.

The action exposes the version as an output and as an environment variable 
`REF_VERSION` that can be used by later steps.

## Inputs

| Name                   | Description                                                                                                                                                       |
|------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `versionFile`          | Specify a path to a json file that has a top level 'version' property, i.e. package.json. The value of that version will be used as a prefix for the output.      |
| `useVersionFile`       | Comma separated list of branch,tag, or pr that indicates in which cases the version file should be considered. Defaults to 'branch,pr'                            |
| `createRunVersion`     | Comma separated list of branch,tag, or pr that indicates in which cases a unique run version should be created using `github.run_number` and `github.run_attempt` | 
| `versionFileSeparator` | Separator used when concatenating the ref and version file versions                                                                                               | 
| `from-tag`             | A tag name that will set the output version using the same logic as if it would have been a ref tag                                                               | 
| `tagPrefix`            | A prefix that will be removed from the beginning of the tag name to compute the version name                                                                      | 


## Outputs

| Name            | Description                                             |
|-----------------|---------------------------------------------------------|
| `version`       | The opinionated version string                          |
| `isTag`         | Boolean that is true a tag version was created          |
| `isPullRequest` | Boolean that is true a Pull Request version was created |
| `isBranch`      | Boolean that is true a branch version was created       |

## Example usage

```
- uses: castlabs/ref-to-version-action@v1.0
  id: refver
  with:
    versionFile: 'package.json'
    useVersionFile: branch,pr
    
- name: Ref version variable
  run: echo "${REF_VERSION}"
  
- name: Ref version output
  run: echo "${{ steps.refver.outputs.version }}"
