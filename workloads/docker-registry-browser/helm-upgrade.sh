#!/usr/bin/env bash
helm upgrade registry-browser -f values.yaml -n container-registry klausmeyer/docker-registry-browser
