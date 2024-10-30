import React from "react";
import { Box, FormControl, FormLabel, Input, Option, Select } from "@mui/joy";
import { Link } from "react-router-dom";
import Textarea from "@mui/joy/Textarea";
import { useGlobalStore } from "@store/globalStore";
import { useAssetVersionStore } from "@store/assetVersionStore";
import { AssetEditVersionDropdown } from "./AssetEditVersionDropdown.tsx";
import { useTranslation } from "react-i18next";
import { Tag } from "@queries/tags/types";

type Props = {
  tags?: Tag[];
};

const TAGS_ROLE = "mythica-tags";

export const AssetEditDetailControls: React.FC<Props> = ({ tags }) => {
  const { orgRoles } = useGlobalStore();
  const {
    org_id,
    description,
    updateVersion,
    tag,
    customTag,
    setCustomTag,
    setTag,
  } = useAssetVersionStore();
  const { t } = useTranslation();

  const hasTagsRole =
    orgRoles && orgRoles.some((entry) => entry.role === TAGS_ROLE);

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

      {tags && (
        <FormControl>
          <FormLabel>Assign an existing tag</FormLabel>
          <Select
            disabled={!!customTag}
            name="tag"
            value={tag}
            onChange={(_, newValue) => {
              setTag(newValue as string);
            }}
            placeholder="Select..."
          >
            {tags.map((tag) => (
              <Option value={tag.tag_id}>{tag.name}</Option>
            ))}
          </Select>
        </FormControl>
      )}

      {hasTagsRole && (
        <FormControl sx={{ mb: "5px" }}>
          <FormLabel>Create a new tag</FormLabel>
          <Input
            name="name"
            variant="outlined"
            placeholder="Custom tag..."
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
          />
        </FormControl>
      )}

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
