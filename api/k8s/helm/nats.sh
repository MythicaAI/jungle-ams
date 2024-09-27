HELM_VERSION=${HELM_VERSION:-v3.16.0}
wget https://get.helm.sh/helm-$HELM_VERSION-linux-amd64.tar.gz
tar -xvzf helm-$HELM_VERSION-linux-amd64.tar.gz 
linux-amd64/helm ~/.local/bin/
rm -rf linux-amd64
rm helm-$HELM_VERSION-linux-amd64.tar.gz 