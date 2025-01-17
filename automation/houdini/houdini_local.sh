if [[ -e .env.local ]]; then
    export $(grep -v '^#' .env.local | xargs)
fi

cd $HOUDINI_INSTALL && . houdini_setup && cd -

hython workers.py