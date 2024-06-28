import {useEffect, useState} from "react";
import {
    Box, Button,
    Chip,
    List, ListDivider,
    ListItem,
    ListItemButton,
    ListItemContent,
    ListItemDecorator, Stack, Switch,
    Typography
} from "@mui/joy";
import {AssetCreateRequest, AssetCreateResponse, AssetVersionResponse} from "./types/apiTypes.ts";
import {AxiosError} from "axios";
import {extractValidationErrors, getData, postData, translateError} from "./services/backendCommon.ts";
import {useGlobalStore} from "./stores/globalStore.ts";
import {useStatusStore} from "./stores/statusStore.ts";
import {Link, useNavigate} from "react-router-dom";
import {LucideLink, LucidePackage, LucidePlusCircle} from "lucide-react";
import {useAssetVersionStore} from "./stores/assetVersionStore.ts";
import {DownloadButton} from "./components/DownloadButton.tsx";


export const Packages = () => {
    const [versions, setVersions] = useState<AssetVersionResponse[]>([]);
    const {authToken} = useGlobalStore();
    const {addError, addWarning} = useStatusStore();
    const {asset_id, updateVersion, clearVersion} = useAssetVersionStore();
    const navigate = useNavigate();

    const handleError = (err: AxiosError) => {
        addError(translateError(err));
        extractValidationErrors(err).map(msg => (addWarning(msg)));
    }

    const updateAssetVersion = (a: AssetVersionResponse) => {
        setVersions(
            versions.map(value=>
                (value.asset_id === a.asset_id) ? a : value));
    }

    const handlePublishToggle = (asset_id: string, version: string, published: boolean) => {
        console.log("publish toggle:", asset_id, published);
        postData<AssetVersionResponse>(`assets/${asset_id}/versions/${version}`, {published: published})
            .then(r => updateAssetVersion(r as AssetVersionResponse))
            .catch(err => handleError(err));
    }

    const createAsset = function() {
        if (!asset_id || asset_id === "") {
            const createRequest: AssetCreateRequest = {};
            postData<AssetCreateResponse>('assets/', createRequest).then(r => {
                // update the asset edit state
                clearVersion();
                updateVersion({
                    asset_id: r.id,
                    org_id: r.org_id,
                });
                navigate(`/assets/${r.id}/versions/0.0.0`)
            }).catch(err => handleError(err));
        }
    }

    useEffect(() => {
        if (!authToken) {
            return;
        }
        getData<AssetVersionResponse[]>('assets/owned')
            .then(r => setVersions(r as AssetVersionResponse[]))
            .catch(err => handleError(err));
    }, [authToken]);

    return <Box>
            <List size={"lg"}>
                <ListItem key={"create-header"}>
                    <ListItemDecorator>
                        <Button
                            component="label"
                            variant={"plain"}
                            color={"neutral"}
                            onMouseDown={createAsset}
                            startDecorator={<LucidePlusCircle/>}>
                            Create New Package
                        </Button>
                    </ListItemDecorator>
                </ListItem>
                <ListItem key={"header"}>
                    <ListItemDecorator sx={{flex: 1}}>Package</ListItemDecorator>
                    <ListItemDecorator sx={{flex: 1}}>ID</ListItemDecorator>
                </ListItem>
            {versions.map(a => (
                <ListItemButton
                    key={`${a.asset_id}-${a.version.join('.')}`}
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                    <ListItemDecorator>
                        <Stack spacing={1} alignItems="center">
                            <Link to={`/assets/${a.asset_id}/versions/${a.version.join('.')}`}>

                            </Link>
                            {a.package_id ? <DownloadButton icon={<LucidePackage />} file_id={a.package_id} /> : ""}
                        </Stack>
                    </ListItemDecorator>
                    <ListDivider orientation={"vertical"} />
                    <ListItemContent sx={{flex: 1}}>
                        <Typography
                            component={Link}
                            to={`/assets/${a.asset_id}/versions/${a.version.join('.')}`}
                            level="body-md"
                            fontWeight="bold">
                            {a.org_name}::{a.name}
                        </Typography>
                        <Chip
                            variant="soft"
                            color="neutral"
                            size="sm"
                            sx={{borderRadius: 'xl'}}
                        >
                            {a.version.join('.')}
                        </Chip>
                        <Typography level="body-sm" color="neutral">
                            by {a.author_name}
                        </Typography>
                    </ListItemContent>
                    <ListDivider orientation={"vertical"}/>
                    <ListItemDecorator>
                        <Typography fontFamily={"code"} level={"body-xs"}>
                            {a.asset_id}
                        </Typography>
                    </ListItemDecorator>
                    <ListItemDecorator>
                        <Typography
                            component="span"
                            level="body-md"
                            sx={{
                                textAlign: 'right',
                                ml: '10px',
                                width: 'auto',
                                minWidth: '100px'
                            }}>
                            {a.published ? 'Published' : 'Draft'}
                        </Typography>
                        <Switch
                            checked={a.published}
                            onChange={(event) =>
                                handlePublishToggle(a.asset_id, a.version.join('.'), event.target.checked)}
                            color={a.published ? 'success' : 'neutral'}
                            sx={{flex: 1}}
                        />
                    </ListItemDecorator>
                </ListItemButton>
                ))}
        </List>
    </Box>;

}