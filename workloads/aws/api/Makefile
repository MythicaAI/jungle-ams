# Copyright (c) Tailscale Inc & AUTHORS
# SPDX-License-Identifier: BSD-3-Clause

TS_ROUTES ?= ""
SA_NAME ?= tailscale
TS_KUBE_SECRET ?= tailscale

rbac:
	@echo "---"
	@sed -e "s;{{SA_NAME}};$(SA_NAME);g" sa.yaml
	@echo "---"
	@sed -e "s;{{TS_KUBE_SECRET}};$(TS_KUBE_SECRET);g" role.yaml
	@echo "---"
	@sed -e "s;{{SA_NAME}};$(SA_NAME);g" rolebinding.yaml
