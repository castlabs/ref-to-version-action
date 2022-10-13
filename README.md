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

| Name             | Description                                                                                                                                                                                               |
|------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `versionFile`    | Specify a path to a json file that has a top level 'version' property, i.e. package.json. The value of that version will be used as a prefix for the output, using `versionFileSeparator` as a separator. |
| `useVersionFile` | Comma separated list of branch,tag, or pr that indicates in which cases the version file should be considered. Defaults to 'branch,pr'                                                                    |


## Outputs

| Name      | Description                    |
|-----------|--------------------------------|
| `version` | The opinionated version string |

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
