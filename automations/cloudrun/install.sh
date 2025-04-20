gcloud functions deploy automation \
 --region=us-central1 \
 --gen2 \
 --runtime=python312 \
 --entry-point=automation_request \
 --trigger-http \
 --egress-settings=private-ranges-only \
 --timeout=600 \
 --vpc-connector=cloudrun \
 --allow-unauthenticated
