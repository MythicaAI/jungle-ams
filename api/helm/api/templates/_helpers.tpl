{{/*
Expand the name of the chart.
*/}}
{{- define "api.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
We truncate at 63 chars because some Kubernetes name fields are limited to this (by the DNS naming spec).
If release name contains chart name it will be used as a full name.
*/}}
{{- define "api.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Create chart name and version as used by the chart label.
*/}}
{{- define "api.chart" -}}
{{- printf "%s-%s" .Chart.Name .Chart.Version | replace "+" "_" | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "api.labels" -}}
helm.sh/chart: {{ include "api.chart" . }}
{{ include "api.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{ include "api.commonLabels" . }}
{{- end }}

{{/*
Node selector
*/}}
{{- define "api.nodeSelector" -}}
nodeSelector:
  {{- if eq .nodeSelector "spot" }}
  cloud.google.com/gke-spot: "true"
  {{- else if eq .nodeSelector "scale-out" }}
  cloud.google.com/compute-class: "Scale-Out"
  {{- end }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "api.selectorLabels" -}}
app.kubernetes.io/name: {{ include "api.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "api.commonLabels" -}}
myth.tier: {{ .Values.tier }}
myth.release: {{ .Values.release }}
{{- end }}

{{/*
Component labels
*/}}
{{- define "api.componentLabels" -}}
app: {{ .name }}
{{- end }}

{{/*
Create the name of the service account to use
*/}}
{{- define "api.serviceAccountName" -}}
{{- if .Values.serviceAccount.create }}
{{- default (include "api.fullname" .) .Values.serviceAccount.name }}
{{- else }}
{{- default "default" .Values.serviceAccount.name }}
{{- end }}
{{- end }}

{{/*
Rollout strategy
*/}}
{{- define "api.rolloutStrategy" -}}
type: RollingUpdate
rollingUpdate:
  maxUnavailable: {{ .maxUnavailable | default 1 }}
  maxSurge: {{ .maxSurge | default 2 }}
{{- end }}

{{/*
Provide a safe way to lookup info by image name
*/}}
{{- define "api.image" -}}
{{- $root := index . 0 -}}
{{- $imageName := index . 1 -}}
{{- $lookup := $root.Values.images -}}
{{- if hasKey $lookup $imageName -}}
{{- printf "%s/%s:%s" $root.Values.imageRepository $imageName (get $lookup $imageName) -}}
{{- else -}}
{{- fail (printf "Image %s not found in images" $imageName) -}}
{{- end -}}
{{- end -}}