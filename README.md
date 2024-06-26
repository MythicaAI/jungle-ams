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
  ```

- From repo root install tools:

  ``` shell
  asdf install
  ```

For further setup information for terraform or k8s check the README
files in those subfolders.

### Install with pipenv

`pipenv` is used to install package requirements from an automatically locked
and hashed set of dependencies. It is a combination of pip and venv so it can
simplify working with these technologies while ensuring deterministic builds.

From Linux, macOS or Windows:

```bash
api/app> pipenv install
```

## Working on Sites

* Edit site data in sites/<sitename>/content
* Publish changes with sites/publish.sh <sitename>


### Node based Sites

Installing node dependencies in a sites/ project

```bash
asdf shell nodejs 22.2.0
cd ../sites/jungle2
corepack enable pnpm
asdf reshim nodejs
pnpm install
```
