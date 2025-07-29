# Shared storage layer

This docker compose implements a persistent storage tier
that can remain in place while testing other tiers.

networks:

    * storage - storage tier service network, with ports exposed to host for local testing
    * web - web tier service network, with port 8080 exposed to host for local testing

volumes:

    * static        
        * testing/mnt/static      
        * static content serving, mounted by nginx for local web testing
    * pgdata        
        * testing/mnt/pgdata      
        * database data, mounted by postgres for database storage
    * objstore
        * testing/mnt/objstore
        * object storage for minio
    * _cache
        * testing/mnt/pip_cache etc
        * docker buildx cache locations to speed up build access to cache data
    * tailscale
        * testing/mnt/tailscale
        * mount data for tailscale testing modes


