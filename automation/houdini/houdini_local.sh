if [[ -e .env.local ]]; then
    set -o allexport
    source .env.local
    set +o allexport
fi

cd $HOUDINI_INSTALL && . houdini_setup && cd -

hython workers.py