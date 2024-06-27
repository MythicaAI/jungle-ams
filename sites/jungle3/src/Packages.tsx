import {useEffect, useState} from "react";
import {
    Box, Button,
    Chip,
    List, ListDivider,
    ListItem,
    ListItemButton,
    ListItemContent,
    ListItemDecorator, Switch,
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
                    component={Link}
                    to={`/assets/${a.asset_id}/versions/${a.version.join('.')}`}
                    key={`${a.asset_id}-${a.version.join('.')}`}
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}>
                    <ListItemDecorator>
                        <LucidePackage/>
                    </ListItemDecorator>
                    <ListItemContent sx={{flex: 1}}>
                        <Typography level="body-md" fontWeight="bold">
                            {a.name}
                        </Typography>
                        <Chip
                            variant="soft"
                            color="neutral"
                            size="sm"
                            sx={{borderRadius: 'xl'}}
                        >
                            {a.version.join('.')}
                        </Chip>
                    </ListItemContent>
                    <ListItemDecorator>
                        <Typography component="span" level="inherit" sx={{ml: '10px'}}>
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
                    <ListDivider />
                    <ListItemDecorator>
                        <Link to={`/assets/${a.asset_id}/versions/${a.version.join('.')}`}>
                            <LucideLink />  {a.asset_id}
                        </Link>
                    </ListItemDecorator>
                </ListItemButton>
                ))}
        </List>
    </Box>;

}