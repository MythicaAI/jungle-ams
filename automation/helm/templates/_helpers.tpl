{{/*
Provide a safe way to lookup image version by name
*/}}
{{- define "api.imageVersion" -}}
{{- $root := index . 0 -}}
{{- $imageName := index . 1 -}}
{{- $lookup := $root.Values.images -}}
{{- if hasKey $lookup $imageName -}}
{{- printf "%s" (get $lookup $imageName) -}}
{{- else -}}
{{- fail (printf "Image %s not found in images" $imageName) -}}
{{- end -}}
{{- end -}}


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

