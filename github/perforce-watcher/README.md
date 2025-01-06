P4->infra integration
===

The p4_invoke_infra_webhook is invoked from perforce to notify
a github action of a new commit. The github action keeps a cached
copy of the repo so that it can run automation against it. 

For example see `api/bulk-import` and `.github/workflows/p4-commit-hook.yaml`
