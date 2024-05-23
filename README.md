# Infra for Mythica.ai

In this repo expect to find definitions, helpers and code for back end
infrastructure. Currently this repository is not intended to be shared externally.

DO NOT STORE SECRETS HERE

Do not under any cicumstances store secret data in this repository.

Talk to @jacob or @pedro for secret management patterns.

Currently secrets will be stored in 1password and can be made available
via their [command line tools](https://developer.1password.com/docs/cli/get-started/#install).

## Running

Ensure you have [Python3](https://python.org) installed 

Setup virtual environment and invoke
```bash
. ./env.sh
```

```bash
invoke storage-start
inv storage-stop
```

## Setup

We are using `asdf` to manage local tool versions. Observe the
`.tool-versions` file.

To install all tools:

- [Install `asdf`](https://asdf-vm.com/guide/getting-started.html)

- Install plugins:

  ``` shell
  asdf plugin-add terraform https://github.com/asdf-community/asdf-hashicorp.git
  asdf plugin add gcloud https://github.com/jthegedus/asdf-gcloud
  asdf plugin-add kubectl https://github.com/asdf-community/asdf-kubectl.git
  asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git
  asdf plugin add yarn https://github.com/twuni/asdf-yarn.git
  ```

- From repo root install tools:

  ``` shell
  asdf install
  ```

For further setup information for terraform or k8s check the README
files in those subfolders.

## Working on Sites

* Edit site data in sites/<sitename>/content
* Publish changes with sites/publish.sh <sitename>

Installing node dependencies

```bash
asdf shell nodejs 22.2.0
corepack enable
asdf reshim nodejs
yarn
```
