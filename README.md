# Infra for Mythica.ai

In this repo expect to find definitions for infrastructure. Currently we
have subdirectories for:

- terraform
- k8s

## Setup

We are using `asdf` to manage tool versions. Observe the
`.tool-versions` file.

To install all tools:

- Install `asdf` <https://asdf-vm.com/guide/getting-started.html>

- Install plugins:

  ``` shell
  asdf plugin-add terraform https://github.com/asdf-community/asdf-hashicorp.git
  asdf plugin add gcloud https://github.com/jthegedus/asdf-gcloud
  asdf plugin-add kubectl https://github.com/asdf-community/asdf-kubectl.git
  ```

- From repo root install tools:

  ``` shell
  asdf install
  ```

For further setup information for terraform or k8s check the README
files in those subfolders.
