Overview
========

DAROL - 

A Houdini Automation Framework


Prerequisites
-------------
 - Docker
 - git submodules
 
You must run this locally when cloning the main repository

```bash
git submodule update --init
```

If running on windows, you must clone this repository using unix line endings. You can disable conversion to windows line endings with this setting:

```bash
git config --global core.autocrlf false
```


Project Structure
-----------------

* houdini-config
* uploader


Run the uploader:

```bash
# Full command
docker run --rm -v path/to/input:/input -it mythica-uploader python uploader.py

# Alias script
./uploader.sh <path-to-input>
```
