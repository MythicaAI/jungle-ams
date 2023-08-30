# Terraform setup

To get terraform working:

- navigate to a subfolder with a `*.tf` file

- run

  ``` shell
  terraform init
  ```

To make sure terraform can auth with gcloud:

- run

  ``` shell
  gcloud config set project mythica-389914
  gcloud auth application-default login
  ```

- test that it can auth

  ``` shell
  terraform plan
  ```
