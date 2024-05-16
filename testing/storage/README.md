Shared local infra information

networks:

    * storage - storage tier service network, available to docker with ports exposed to host for local testing
    * web - web tier service network, available to docker with port 8080 exposed to host for local testing

volumes:

    * static        - testing/infra/mnt/static      - static content serving, mounted by nginx for local web testing
    * pgdata        - testing/infra/mnt/pgdata      - database data, mounted by postgres for database storage and migration/snapshot testing
    * blockstore    - testing/infra/mnt/blockstore  - block store backing volume for uploads, mldata, data pipeline

