audience=http://localhost:5555/v1

curl -X 'POST' \
 --url "https://dev-dtvqj0iuc5rnb6x2.us.auth0.com/oauth/token" \
 --header "content-type: application/x-www-form-urlencoded" \
 --data "grant_type=client_credentials" \
 --data "client_id=KQvjUmmeyYHLB0F7nOwBFMqVM2OrnspZ" \
 --data "client_secret=4dGFphavEF_VFem7LlAmODrceWrchqn3_hFBbDxXo50WgzgNjPY8I07CcDs_Gq_4" \
 --data "audience=${audience}"
