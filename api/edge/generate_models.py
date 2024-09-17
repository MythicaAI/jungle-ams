#!/usr/bin/env python3

from fileassetkit.schema.to_typescript import sqlmodel_to_typescript
from fileassetkit.schema.profiles import SQLModel as ProfilesModel
from fileassetkit.schema.assets import SQLModel as AssetsModel


with open("src/models.ts", "w+") as f:
    f.write(sqlmodel_to_typescript(AssetsModel.metadata))
    f.write(sqlmodel_to_typescript(ProfilesModel.metadata))
