import React from "react";
import { Box, FormControl, FormLabel, Option, Select } from "@mui/joy";
import { Link } from "react-router-dom";
import Textarea from "@mui/joy/Textarea";
import { useGlobalStore } from "@store/globalStore";
import { useAssetVersionStore } from "@store/assetVersionStore";
import { AssetEditVersionDropdown } from "./AssetEditVersionDropdown.tsx";
import { useTranslation } from "react-i18next";

export const AssetEditDetailControls = () => {
  const { orgRoles } = useGlobalStore();
  const { org_id, description, updateVersion } = useAssetVersionStore();
  const { t } = useTranslation();

  const onUpdateOrg = (
    _event: React.SyntheticEvent | null,
    value: string | null,
  ) => {
    if (!value) {
      return;
    }
    updateVersion({ org_id: value });
    console.log(`org updated ${value}`);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <FormControl>
        <FormLabel>
          {t("packageEdit.org/namespace")}
          {!org_id && orgRoles.length == 0 && (
            <Box ml="10px">
              <Link to={"/orgs"}>{t("packageEdit.createNewOrg")}</Link>
            </Box>
          )}
        </FormLabel>

        {orgRoles.length > 0 ? (
          <Select
            variant="soft"
            name="org_id"
            placeholder={t("packageEdit.chooseExistingOrg")}
            value={org_id}
            multiple={false}
            onChange={onUpdateOrg}
          >
            {orgRoles.map((role) => (
              <Option key={role.org_id} value={role.org_id}>
                {role.org_name}
              </Option>
            ))}
            {org_id! in orgRoles ? (
              <Option key={org_id} value={org_id}>
                {org_id} (not a member)
              </Option>
            ) : (
              ""
            )}
          </Select>
        ) : (
          ""
        )}
      </FormControl>

      <AssetEditVersionDropdown />

      <FormControl>
        <FormLabel>{t("common.description")}</FormLabel>
        <Textarea
          name="description"
          placeholder={t("packageEdit.filloutDesc")}
          variant="outlined"
          size="md"
          minRows={4}
          value={description}
          onChange={(e) => updateVersion({ description: e.target.value })}
        />
      </FormControl>
    </Box>
  );
};
