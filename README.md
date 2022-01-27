# Ref to Version Action

This action takes a takes the `github_ref` and extracts an opinionated
version string. By default the third segment of the ref is returned.
This refers to the branch name. The special cases that are handled are
**pull requests** and **tags**. For tags, the tag is returned as a version
and a "v" prefix is removed, i.e. the tag `v1.0` will return version `1.0`.
Pull Requests refs are converted to `PR-<number>` versions.

The action exposes the version as an output and as an environment variable 
`REF_VERSION` that can be used by later steps.

## Outputs

## `version`

The opinionated version string

## Example usage

```
- uses: castlabs/ref-to-version-action@v1.0
  id: refver
- uses: actions/delete-package-versions@v2
  if: ${{ steps.versions.outputs.ids != '' }}
  with:
    package-version-ids: "${{ steps.versions.outputs.ids }}"

