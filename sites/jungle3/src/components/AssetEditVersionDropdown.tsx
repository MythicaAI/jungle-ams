import React, { useEffect, useState } from "react";
import {
  Input,
  IconButton,
  FormLabel,
  FormHelperText,
  FormControl,
  List,
  Card,
  ListItemButton,
  ListItem,
  ListItemDecorator,
  Switch,
  Typography,
  Stack,
} from "@mui/joy";
import {
  convertUserVersion,
  isVersionZero,
  sanitizeVersion,
} from "../types/assetEditTypes.ts";
import { LucideChevronDown, LucideInfo, LucideLink } from "lucide-react";
import { useAssetVersionStore } from "../stores/assetVersionStore.ts";
import { useNavigate, useParams } from "react-router-dom";
import { Popper } from "@mui/base";
import {
  extractValidationErrors,
  translateError,
} from "../services/backendCommon.ts";
import { AssetVersionResponse } from "../types/apiTypes.ts";
import { ClickAwayListener } from "@mui/base/ClickAwayListener";
import { AxiosError } from "axios";
import { useStatusStore } from "../stores/statusStore.ts";
import { api } from "../services/api";

export type VersionTuple = [number, number, number];

export const AssetEditVersionDropdown = () => {
  const { version: paramVersion } = useParams();
  const navigate = useNavigate();
  const { asset_id, version, published, updateVersion } =
    useAssetVersionStore();
  const { addError, addWarning } = useStatusStore();
  const [availableVersions, setAvailableVersions] = useState<
    AssetVersionResponse[]
  >([]);

  // version sanitizing state, should only be populated by the sanitizeVersion() function
  const [sanitizedVersion, setSanitizedVersion] = useState<number[]>([0, 0, 0]);

  // separately manage the user's input version
  const [userVersion, setUserVersion] = useState<string>("0.0.0");

  // initialize version sanitation
  const initialVersion = () => {
    // override parameter version with asset version if set
    if (version && !isVersionZero(version)) {
      return sanitizeVersion(version);
    } else if (paramVersion) {
      return sanitizeVersion(convertUserVersion(paramVersion));
    }
    return [0, 0, 0];
  };

  const handleError = (err: AxiosError) => {
    addError(translateError(err));
    extractValidationErrors(err).map((msg) => addWarning(msg));
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  useEffect(() => {
    if (asset_id) {
      api
        .get<AssetVersionResponse[]>({ path: `/assets/${asset_id}` })
        .then((r) => {
          setAvailableVersions(r);
        })
        .catch((err) => handleError(err));
    }
  }, [asset_id]);

  useEffect(() => {
    const v = initialVersion();
    setUserVersion(v.join("."));
    setSanitizedVersion(v);
  }, [paramVersion, version]);

  // When leaving the version field, split and parse the values and pass it through the version update
  // to sanitize it
  const onVersionBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    event.preventDefault();
    if (!event.target) {
      return;
    }
    const parts = convertUserVersion(event.target.value);
    const sanitized = sanitizeVersion(parts);
    setSanitizedVersion(sanitized);
    updateVersion({ version: sanitized });
    // setUserVersion(sanitized.join('.'))
  };

  let allowClickAway = false;
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    allowClickAway = false;
    setAnchorEl(anchorEl ? null : event.currentTarget);
  };
  const open = Boolean(anchorEl);
  const id = open ? "simple-popper" : undefined;

  return (
    <Stack direction={"row"} alignItems={"center"}>
      <FormControl error={isVersionZero(sanitizedVersion)}>
        <FormLabel>Version</FormLabel>

        <Input
          name="version"
          variant="outlined"
          placeholder={sanitizedVersion.join(".")}
          value={userVersion}
          onChange={(e) => {
            setUserVersion(e.target.value);
            setSanitizedVersion(
              sanitizeVersion(convertUserVersion(e.target.value)),
            );
          }}
          onBlur={onVersionBlur}
          sx={{
            "&::before": {
              display: "none",
            },
            "&:focus-within": {
              outline: "2px solid var(--Input-focusedHighlight)",
              outlineOffset: "2px",
            },
          }}
          endDecorator={
            <IconButton
              variant="plain"
              color="neutral"
              aria-describedby={id}
              onMouseDown={handleClick}
              onMouseUp={() => setTimeout(() => (allowClickAway = true), 200)}
            >
              <LucideChevronDown />
            </IconButton>
          }
        ></Input>
        <Popper open={open} placement="bottom-start" anchorEl={anchorEl}>
          <ClickAwayListener
            onClickAway={() => allowClickAway && setAnchorEl(null)}
          >
            <Card>
              <List>
                {availableVersions.map((av, index) => (
                  <ListItem key={index}>
                    <ListItemButton
                      onClick={() => {
                        setAnchorEl(null);
                        navigate(
                          `/assets/${asset_id}/versions/${av.version.join(".")}`,
                        );
                      }}
                    >
                      {av.version.join(".")}
                    </ListItemButton>
                    <ListItemDecorator>
                      <LucideLink />
                    </ListItemDecorator>
                  </ListItem>
                ))}
              </List>
            </Card>
          </ClickAwayListener>
        </Popper>
        {isVersionZero(sanitizedVersion) ? (
          <FormHelperText>
            <LucideInfo />
            0.0.0 versions are not supported
          </FormHelperText>
        ) : (
          ""
        )}
      </FormControl>
      <FormControl orientation={"horizontal"}>
        <Typography
          component="span"
          level="body-md"
          sx={{
            textAlign: "right",
            alignItems: "center",
            ml: "10px",
            pr: "5px",
            width: "auto",
            minWidth: "100px",
          }}
        >
          {published ? "Published" : "Draft"}
        </Typography>
        <Switch
          checked={published}
          onChange={(event) =>
            updateVersion({ published: event.target.checked })
          }
          color={published ? "success" : "neutral"}
          sx={{ flex: 1 }}
        />
        <input type="hidden" name="published" value={published.toString()} />
      </FormControl>
    </Stack>
  );
};
