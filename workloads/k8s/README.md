# k8s

To get kubectl working:

- install `gke-gcloud-auth-plugin`
  [DOCS](https://cloud.google.com/kubernetes-engine/docs/how-to/cluster-access-for-kubectl#install_plugin)

  - because I (kaya) installed gcloud via asdf this was my process

    ``` shell
    gcloud components install gke-gcloud-auth-plugin
    echo 'source "~/.asdf/installs/gcloud/444.0.0/path.zsh.inc"' >>~/.zshrc
    ```

- create kubeconfig

  ``` shell
  gcloud container clusters get-credentials simple-autopilot-public-cluster --region=us-central1
  ```

- test

  ``` shell
  kubectl get namespaces
  ```
