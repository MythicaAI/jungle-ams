Get the command line AWS client

Configure SSO

Parameters:

```ini
[sso-session mythica-session]
sso_start_url = https://d-9067f554cf.awsapps.com/start
sso_region = us-east-1
sso_registration_scopes = sso:account:access
```

Commands:

```bash
aws configure sso
aws sso login --profile mythica-admin
```

Setup kube config context:

```bash
aws eks update-kubeconfig --name mythica_aws --region us-east-1 --profile mythica-admin
kubectl get nodes
```
