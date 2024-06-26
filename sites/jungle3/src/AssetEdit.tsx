import {
  Box,
  Button,
  Drawer,
  FormControl,
  FormLabel,
  IconButton,
  Input,
  List,
  ListItem,
  Option,
  Select,
  Sheet,
  Stack,
  Typography
} from '@mui/joy';
import {ClickAwayListener} from '@mui/base/ClickAwayListener';
import Textarea from '@mui/joy/Textarea';
import {useGlobalStore} from "./stores/globalStore.ts";
import React, {useEffect, useState} from "react";
import {useAssetVersionStore} from "./stores/assetVersionStore.ts";
import {extractValidationErrors, getData, postData, translateError} from "./services/backendCommon.ts";
import {useStatusStore} from "./stores/statusStore.ts";
import {AxiosError} from "axios";
import {AssetVersionContentListMap, AssetVersionResponse, FileUploadResponse} from "./types/apiTypes.ts";
import {useParams} from "react-router-dom";
import {LucideSidebarClose} from "lucide-react";
import {UploadsReadyList} from "./components/UploadsReadyList.tsx";
import {FileUploadStatus, useUploadStore} from "./stores/uploadStore.ts";
import {AssetEditFileList} from "./components/AssetEditFileList.tsx";

interface AssetEditProps {
    prop_asset_id?: string,
    prop_version?: string,
}

interface OpenUploadsState {
    open: boolean,
    category?: string,
    fileFilters?: string[]
}

export const AssetEdit: React.FC<AssetEditProps> = ({prop_asset_id = undefined, prop_version = "0.0.0"}) => {
    const {orgRoles} = useGlobalStore();
    const {setSuccess, addError, addWarning} = useStatusStore();
    const {trackUploads} = useUploadStore();
    const {
        asset_id,
        org_id,
        name,
        description,
        version,
        files,
        thumbnails,
        addFiles,
        removeFile,
        addThumbnails,
        removeThumbnail,
        updateVersion
    } = useAssetVersionStore();

    // version sanitizing state
    const [
        sanitizedVersion,
        setSanitizedVersion] = useState<number[]>([0, 0, 0]);

    const [
        openUploads,
        setOpenUploads
    ] = useState<OpenUploadsState>({open: false});

    // initialize version sanitation
    useEffect(() => {
        sanitizeVersion(version);
    }, [version]);

    // org_id state and initial update to first index
    useEffect(() => {
        if (orgRoles && orgRoles.length > 0 && orgRoles[0].org_id) {
            updateVersion({org_id: orgRoles[0].org_id});
        }
    }, [orgRoles])

    // handle populating the form if an asset ID was specified
    useEffect(() => {
        if (!prop_asset_id) {
            return;
        }
        getData<AssetVersionResponse>(`assets/${prop_asset_id}/versions/${prop_version}`).then(r => {
            loadAssetVersionResponse(r);
        }).catch(err => handleError(err));
    }, [prop_asset_id, prop_version]);

    // handle populating the file uploads if the drawer is opened
    useEffect(() => {
        if (openUploads.open) {
            getData<FileUploadResponse[]>("upload/pending").then(files => {
                trackUploads(files as FileUploadStatus[]);
            }).catch(err => handleError(err));
        }
    }, [openUploads]);

    const handleError = (err: AxiosError) => {
        addError(translateError(err));
        extractValidationErrors(err).map(msg => (addWarning(msg)));
    }

    const loadAssetVersionResponse = (r: AssetVersionResponse) => {
        console.log(`loading asset version ${r.asset_id} ${r.version.join('.')}`);

        // clear files and replace with version response
        updateVersion({
            asset_id: r.asset_id,
            org_id: r.org_id,
            author: r.author,
            package_id: r.package_id,
            name: r.name,
            description: r.description,
            version: r.version,
            commit_ref: r.commit_ref,
            created: r.created,
            updated: r.updated,
            files: {},
            thumbnails: {},
            links: []
        });
        sanitizeVersion(r.version);
        if (r.contents) {
            const contentMap: AssetVersionContentListMap = r.contents;
            if ("files" in contentMap) {
                addFiles(contentMap["files"])
            }
            if ("thumbnails" in contentMap) {
                addThumbnails(contentMap["thumbnails"])
            }
        }
    }

    // version sanitation helper
    const sanitizeVersion = (version: number[]): number[] => {
        let sanitized: number[] = [0, 0, 0]
        if (!version) {
            setSanitizedVersion(sanitized);
            return sanitized;
        }
        sanitized = version;
        if (sanitized.length > 3) {
            sanitized = sanitized.slice(0, 3);
        }
        while (sanitized.length < 3) {
            sanitized.push(0);
        }
        setSanitizedVersion(sanitized);
        // console.log("version:", version, "sanitized:", sanitized);
        return sanitized;
    }

    // handle form submit for the specified version
    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const contents = {
            files: Object.values(files),
            thumbnails: Object.values(thumbnails),
        };
        const formJson = {
            ...Object.fromEntries(formData.entries()),
            contents: contents,
        };
        postData<AssetVersionResponse>(`assets/${asset_id}/versions/${sanitizedVersion.join('.')}`, formJson).then(
            r => {
                loadAssetVersionResponse(r);
                setSuccess(`Version updated ${r.name} ${r.version.join('.')}`);
            }).catch(err => handleError(err));
    }

    const onUpdateOrg = (_event: React.SyntheticEvent | null, value: (string | null)) => {
      if (!value) {
        return;
      }
      updateVersion({org_id: value});
      console.log(`org updated ${value}`);
    }

    // When leaving the version field, split and parse the values and pass it through the version update
    // to sanitize it
    const onVersionBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        event.preventDefault();
        if (!event.target) {
            return;
        }
        const versionStr: string = event.target.value;
        const parts = versionStr
            .split('.')
            .map(v => parseInt(v, 10))
            .filter(v => !isNaN(v));
        sanitizeVersion(parts).join('.')
    }

    const onUploadDrawerKeyDown = (event: React.KeyboardEvent | React.MouseEvent) => {
        if (event.type == "keydown") {
            const key = (event as React.KeyboardEvent).key;
            if (key === 'Escape') {
                setOpenUploads({open: false})
            }
        }
    };

    const onClickAway = () => {
        if (openUploads.open) {
            setOpenUploads({open: false});
        }
    };

    return (
        <Sheet sx={{p: 2}} className="full-size-box">
            <Stack>
                {[['asset_id', asset_id],
                    ['org_id', org_id]].map(v => (
                    <Typography key={v[0]} level="body-xs">{v[0]}: {v[1]}</Typography>
                ))}
            </Stack>
            <ClickAwayListener onClickAway={onClickAway}>
                <Drawer open={openUploads.open}
                        onKeyDown={onUploadDrawerKeyDown}
                        size="lg">
                    <Sheet
                        sx={{
                            borderBottom: '1px solid',
                            borderColor: 'divider',
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Typography level="h4">Uploads</Typography>
                        <IconButton onClick={() => setOpenUploads({open: false})} variant="plain">
                            <LucideSidebarClose/>
                        </IconButton>
                    </Sheet>
                    <UploadsReadyList/>
                </Drawer>
            </ClickAwayListener>
            <form onSubmit={onSubmit}>
                <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
                    <FormControl>
                        <FormLabel>
                            Name
                        </FormLabel>
                        <Input name="name" variant="outlined" placeholder="Name..." value={name}/>
                    </FormControl>

                    <FormControl>
                        <FormLabel>
                            Org / Namespace
                        </FormLabel>
                        <Select
                            name="org_id"
                            placeholder={"Choose an existing org..."}
                            value={orgRoles.length > 0 ? orgRoles[0].org_id : ""}
                            multiple={false}
                            onChange={onUpdateOrg}>
                            {orgRoles.map(role => (
                                <Option key={role.org_id} value={role.org_id}>
                                    {role.org_name}
                                </Option>)
                            )}
                        </Select>
                    </FormControl>

                    <FormControl>
                        <FormLabel>
                            Version
                        </FormLabel>
                        <Input
                            name="version"
                            variant="outlined"
                            placeholder="0.0.0"
                            value={sanitizedVersion.join('.')}
                            onBlur={onVersionBlur}/>
                    </FormControl>

                    <FormControl>
                        <FormLabel>
                            Description
                        </FormLabel>
                        <Textarea
                            name="description"
                            placeholder="Fill out a description..."
                            variant="outlined"
                            size="md"
                            minRows={4}
                            value={description}/>

                    </FormControl>

                    <AssetEditFileList
                        title={"Files"}
                        category={"files"}
                        fileFilters={["hda", "hip"]}
                        openUploadList={(category, fileFilters) =>
                            setOpenUploads({open: true, category: category, fileFilters: fileFilters})}
                        removeFile={removeFile}
                        files={files}/>

                    <AssetEditFileList
                        title={"Thumbnails"}
                        category={"thumbnails"}
                        fileFilters={["png", "jpg", "jpeg", "gif", "webm"]}
                        openUploadList={(category, fileFilters) =>
                            setOpenUploads({open: true, category: category, fileFilters: fileFilters})}
                        removeFile={removeThumbnail}
                        files={thumbnails}/>


                    <FormControl>
                        <FormLabel>
                            Links
                        </FormLabel>
                        <Box>
                            <List id="links">
                                <ListItem>http://mysite.com</ListItem>
                            </List>
                        </Box>
                    </FormControl>

                    <Box>
                        <Typography level="title-md">Discovered References</Typography>
                        <List>
                            <ListItem key={1}>mythica::palm_fan:1.0</ListItem>
                            <ListItem key={2}>mythica::scatter:1.0</ListItem>
                        </List>
                    </Box>

                    <Button type="submit">Update</Button>

                </Box>
            </form>
        </Sheet>
    )
        ;
};


export const AssetEditWrapper: React.FC = () => {
    const {asset_id, version} = useParams();
    return <AssetEdit prop_asset_id={asset_id} prop_version={version}/>;
}
