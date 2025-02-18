Bulk import
===

This script runs bulk import for a set of known HDA packages

For running locally. You will also need to give your user account a verified email. 
This can be done by editing the database directly, or, goto `/v1/docs` and on the 
swagger page use the email verification API to generate a token and then submit it
for validation.


```
export P4PASSWD=[INSERT PASSWORD]
export P4USER=mythica
export P4PORT=ssl:p4.garden.mythica.ai:1666
export P4_WORKSPACE=[LOCAL PATH TO P4 WORKSPACE]
export P4CLIENT=[P4 WORKSPACE NAME]

export GITHUB_API_KEY=[ACCESS KEY WITH REPO READ PRIVS]
export MYTYHICA_API_KEY=[API KEY]
export TMP_PATH=./output/tmp

poetry run python upload_packages.py \
    --repo-base ${TMP_PATH} \
    --package-list ${P4_WORKSPACE}/Houdini/Automation/package_list.py \
    --license ${P4_WORKSPACE}/Houdini/Automation/LICENSE \
    --endpoint http://localhost:8080 \
    --mythica-api-key  ${MYTYHICA_API_KEY} \
    --tag "Mythica"

poetry run python upload_packages.py \
    --repo-base ${TMP_PATH} \
    --package-list package_list.py \
    --license MPLv2.txt \
    --endpoint http://localhost:8080 \
    --mythica-api-key  ${MYTYHICA_API_KEY} \
    --github-api-token ${GITHUB_API_KEY} \
    --tag "Open Source" 

poetry run python upload_packages.py \
    --repo-base ${TMP_PATH} \
    --package-list test_package_list.py \
    --license MPLv2.txt \
    --endpoint http://127.0.0.1:15555 \
    --mythica-api-key  ${MYTYHICA_API_KEY} \
    --github-api-token ${GITHUB_API_KEY} \
    --tags "Open Source,Mythica,Bohdan" 
```
