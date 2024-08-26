# Darol Houdini automation scripts

## Dockerfile

A wrapper to `aaronsmithtv/hbuild:${VERSION}` where version can be passed as `--build-arg VERSION=latest`
(or a numeric version as needed). The resulting build has  a houdini environment with `darol` installed 
at `/darol` and with a configurable python env (`--build-arg PYTHON_VERSION=3.10`) based on conda. 
A SideFX APIKey must be passed as a `--build-arg SFX_APIKEY="{client_id} {client_secret}"`

## Houdini Runner - run.py
```
usage: run.py [-h] [--output-path OUTPUT_PATH] [--license-server LICENSE_SERVER] [--docker] [--docker-version DOCKER_VERSION]
              [--sfx-client-id SFX_CLIENT_ID] [--sfx-client-secret SFX_CLIENT_SECRET]
              {helloworld,inspect,remote}
```
Houdini automation entry point for Darol. This script will execute one of the `actions` in the `hython` subdirectory. Actions are houdini hython scripts inteded to run inside the context of Houdini and have access to the Darol plugin. 

The execution environment for `actions` is a hython interpreter hosted inside a docker container. Any resulting networks or other output files are saved to `--output-path` specified (this path must be accessible inside the Docker container).

`action` will be one of the automation files in `./hython`. Note the naming pattern for actions is structured as python modules anchored at the root ./hython (eg: `hython/foo/action.py` is the action `foo.action`) 

FOR DEVELOPMENT: If `--docker` is specified a docker container will be provided. Otherwise one is assumed. A `--docker-version` may be specified for the provided container. If `--docker` is specified and this is the first time the image is being built then `--sfx-client-id` and `--sfx-client-secret` must be specified or the image will fail to authenticate. Alternatively clients can edit the file: `/root/houdini20.0/hserver.ini` and store credentials there

```
positional arguments:
  {helloworld,inspect,remote}
                        Houdini Automation Action to execute. Must be one of: [helloworld|inspect|remote]

options:
  -h, --help            show this help message and exit
  --output-path OUTPUT_PATH
                        Output directory in the container to save the HIP and other output files to. Default: '/output'
  --license-server LICENSE_SERVER
                        Output directory to save the HIP file and Unreal project directory. Default: 'https://www.sidefx.com/license/sesinetd'
  --docker              If specified, a Docker Container is provided, otherwise it is assumed. Default: false
  --docker-version DOCKER_VERSION
                        If --docker, the version of houdini to use to execute for the hython interpreter.Note: this affects the built in python
                        version used Default: './latest'
  --sfx-client-id SFX_CLIENT_ID
                        If --docker, the side FX API key to be used for authorized calls from the image. Only used on first image build
  --sfx-client-secret SFX_CLIENT_SECRET
                        If --docker, the side FX API Client Secret to be used for authorized calls from the image. Only used on first image
                        build
```

### inspect

```
usage: inspect --hdapath HDAPATH [--output-path OUTPUT]
```
Node inspector for HDAs. Given an HDA this script will output information about the HDA and assets it contains. 
```
options:
  --hda-path HDAPATH     Path of the hda file to inspect. (this path must be accessible inside the Docker container)
  --output-path OUTPUT  Output directory for writing out file metadata. (this path must be accessible inside the Docker container)
```


#### Examples

These are intended to be run standalone. If a container is being provided, do not include the --docker argument.
```
`python run.py inspect --hdapath /path/to/your.hda --docker`
```
