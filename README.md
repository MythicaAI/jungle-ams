# Infra for Mythica.ai

In this repo, expect to find definitions, helpers, and code for back-end
infrastructure. Currently, this repository is not intended to be shared externally.

DO NOT STORE SECRETS HERE

Do not, under any circumstances, store secret data in this repository.

Talk to @jacob or @pedro for secret management patterns.

Currently, secrets will be stored in 1Password and can be made available
via their [command line tools](https://developer.1password.com/docs/cli/get-started/#install).

## Running

Ensure you have [Python3](https://python.org) installed 
Install poetry for Python globally:
`pip install poetry`

Setup python `virtual environment` and `invoke`

NB: `/.env.local` supports setting required `env` vars for the infrastructure that are loaded by the next step. The required vars are defined in `/.env`

```bash
. ./env.sh
```

```cmd
env.bat
```


Services are split into tiers:

* `storage` (Database, cache, and files)
* `auto`mation (Packaging, Houdini automation)
* `web` serving (API, nginx)
* `auth` (TBD)

For local testing, each tier is implemented in a separate `docker-compose.yaml`.

For example, see `testing/storage`

Each tier has task invoke commands defined in the root `tasks.py` file.

For example to start the storage tier locally:

```bash
invoke storage-start
```

This start task will automatically stop the docker compose instance.

You can see what services are running

```bash
# check running services
docker ps

# see all services that have run
docker ps -a

# see the logs for a terminated container:
docker logs <container-id>
```

## Setup - Linux and Mac

Canonically, we use `asdf` to manage local tool versions. Observe the
`.tool-versions` file. It is possible to manage your tool versions, but YMMV.

To install all tools:

- [Install `asdf`](https://asdf-vm.com/guinpde/getting-started.html)

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

For further setup information for Terraform or k8s check the README
files in those subfolders.

## Setup - Windows

node.js must be installed manually from https://nodejs.org/en/download

### Install with poetry

`poetry` installs package requirements from an automatically locked
and hashed set of dependencies. It is a combination of pip and venv so it can
simplify working with these technologies while ensuring deterministic builds.

From Linux, macOS or Windows:

```bash
api/app> poetry install
```

You can run a command using the poetry virtual environment

```bash
api/app> poetry run pytest .
```

## Working on Sites

Sites are combinations of static content that can be served directly from a web server such
as NGINX.

* Edit site data in sites/<sitename>
* Publish changes with sites/publish.sh <sitename>
* Build vite-based sites with sites/build.sh <sitename>


### React / Node Sites

Installing node dependencies in a sites/ project

```bash
asdf shell nodejs 22.2.0
cd ../sites/jungle2
corepack enable pnpm
asdf reshim nodejs
pnpm install
```

Builds can be automated through a container. See sites/jungle3/Dockerfile for an example.

The build script uses standard docker commands to build the content and copy it into the local
filesystem.

## Code Generation

The API and Sites use some code-generated types. These types are committed and only need to be generated
if changes are made to definitions in the codegen/ project.

Schema types can be generated with the `codegen` project

```bash
python -m codegen.codegen
```


## CI Tests

The Git workflow file `.github/workflows/api-app-ci.yaml` is set up to run tests on every push event within a PR.

Once changes are pushed, the job will execute pytest tests, and the coverage results will be published as a comment in the PR. This comment will include a table for every `.py` file located in the `api/app` directory.

The table is generated from the pytest step in subsequent steps using a shell script that formats the results for display in the PR. Based on the environment variable defined in the workflow file (`jobs: > api-app-ci: > env: > TEST_FAIL_RATE: `), the workflow will determine if the test results have decreased beyond the specified rate. If the threshold is exceeded, the subsequent step, `Coverage total fail - exit`, will cause the tests to fail.

Additionally, there is an option to see the code coverage for each file individually.

To create a `.coverage` file and generate an HTML report for viewing in a browser, run the following commands inside the `api/app` folder:

```bash
pytest --cov --cov-report=html:coverage
coverage html
```

## Deployment and build
### Staging
The staging deployment runs automatically after a pull request (PR) is merged into the main branch.
* `.github/workflows/sites-jungle3-publish-staging.yaml` - Frontend Workflow:
* `.github/workflows/api-app-publish-staging.yaml` - Backend Workflow:
These workflows build the latest versions of the application, as well as the versions specified in `VERSION_APP_PATH` and `VERSION_FRONT_PATH`. The deployment only utilizes the latest versions.

### PROD
To deploy on prod cd to:
```bash
cd api/helm/
```
To ensure that stable versions of both the frontend and backend are used, the following scripts are provided:
  * `api/helm/add_tag_for_stable_versions.sh` - This script publishes a unified version of the desired stable frontend and backend versions that you select while following the prompts. It guarantees the use of stable tags by creating a general tag in the format: 
  ``` bash
  NEW_TAG="f.${FRONT_VERSION/v./}.b.${APP_VERSION/v./}"
  ```

  * `api/helm/helm-upgrade-prod.sh` - uses `api/helm/add_tag_for_stable_versions.sh` and deploys with "NEW_TAG" 
  ``` bash
    --set image.tag="$NEW_TAG"
  ```

### ROLLBACK
To rollback to the previous version of Helm on staging, we can use the script:
```bash
api/helm/helm_rollback_staging.sh
```
It shows the Helm history with revision and description. In the description, there should be text in the format:
```bash
"Versions: back: $APP_VERSION, web-front: $FRONT_VERSION"
```
This can help you decide which version of the frontend and backend should be rolled back to. After you choose, just type the revision number (following the script's prompts).

At the top of `helm_rollback_staging.sh`, you can see the namespace variable, which can be changed to rollback production:

```bash
# Namespace and release name
NAMESPACE="api-staging"
RELEASE_NAME="api-staging"
```

# K8s

## OTEL (Open-Telemetry) with SigNoz

OpenTelemetry (OTEL) has been integrated to log application logs, with services configured to forward logs to SigNoz.

It requires the SIGNOZ_API_KEY secret, which is accessible throughout the cluster and is stored in the default namespace. The OTEL collector endpoint is reachable at:
http://otel-collector.default:4317.

Updating OTEL
To update OpenTelemetry in the cluster, use the following command:
```bash
helm upgrade otel-release-k8s-infra ./api/helm/otel -f ./api/helm/otel/values.yaml --namespace default
```
Alternatively, you can run the script:
```bash
./api/helm/helm-upgrade-telemetry.sh
```

