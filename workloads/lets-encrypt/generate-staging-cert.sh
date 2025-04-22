
NAMESPACE="api-staging"
SECRET_NAME="letsencrypt-tls"

openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout tls.key -out tls.crt -subj "/CN=api-staging.mythica.ai/O=Mythica"

kubectl create secret tls $SECRET_NAME \
  --cert=tls.crt --key=tls.key \
  --namespace $NAMESPACE \
  --dry-run=client -o yaml | kubectl apply -f -