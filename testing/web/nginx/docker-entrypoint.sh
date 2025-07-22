#!/bin/sh
# vim:sw=4:ts=4:et

set -e

entrypoint_log() {
    if [ -z "${NGINX_ENTRYPOINT_QUIET_LOGS:-}" ]; then
        echo "$@"
    fi
}

# Log the command being executed
echo "cmd: $1"

if [ "$1" = "nginx" ] || [ "$1" = "nginx-debug" ]; then
    # Dynamically set nginx config based on MYTHICA_ENVIRONMENT
    NGINX_CONFIG="/etc/nginx/${CONF_FILE}"
    echo "Using NGINX config: ${NGINX_CONFIG}"

    # Validate if the configuration file exists
    if [ ! -f "${NGINX_CONFIG}" ]; then
        echo "Error: Config file ${NGINX_CONFIG} does not exist!" >&2
        exit 1
    fi

    # Append the dynamically constructed config file to the command
    set -- "$@" -c "${NGINX_CONFIG}"

    # Check for scripts in /docker-entrypoint.d/
    if /usr/bin/find "/docker-entrypoint.d/" -mindepth 1 -maxdepth 1 -type f -print -quit 2>/dev/null | read v; then
        entrypoint_log "$0: /docker-entrypoint.d/ is not empty, will attempt to perform configuration"

        entrypoint_log "$0: Looking for shell scripts in /docker-entrypoint.d/"
        find "/docker-entrypoint.d/" -follow -type f -print | sort -V | while read -r f; do
            case "$f" in
                *.envsh)
                    if [ -x "$f" ]; then
                        entrypoint_log "$0: Sourcing $f";
                        . "$f"
                    else
                        # warn on shell scripts without exec bit
                        entrypoint_log "$0: Ignoring $f, not executable";
                    fi
                    ;;
                *.sh)
                    if [ -x "$f" ]; then
                        entrypoint_log "$0: Launching $f";
                        "$f"
                    else
                        # warn on shell scripts without exec bit
                        entrypoint_log "$0: Ignoring $f, not executable";
                    fi
                    ;;
                *) entrypoint_log "$0: Ignoring $f";;
            esac
        done

        entrypoint_log "$0: Configuration complete; ready for start up"
    else
        entrypoint_log "$0: No files found in /docker-entrypoint.d/, skipping configuration"
    fi
fi

# Execute the command
if ! exec "$@"; then
    echo "Failed to execute command: $@" >&2
    exit 1
fi
