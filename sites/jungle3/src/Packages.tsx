import {useEffect, useState} from "react";
import {
    Box,
    Chip,
    List, ListDivider,
    ListItem,
    ListItemButton,
    ListItemContent,
    ListItemDecorator, Switch,
    Typography
} from "@mui/joy";
import {AssetVersionResponse} from "./types/apiTypes.ts";
import {AxiosError} from "axios";
import {extractValidationErrors, getData, postData, translateError} from "./services/backendCommon.ts";
import {useGlobalStore} from "./stores/globalStore.ts";
import {useStatusStore} from "./stores/statusStore.ts";
import {Link} from "react-router-dom";
import {LucideLink, LucidePackage} from "lucide-react";


export const Packages = () => {
    const [versions, setVersions] = useState<AssetVersionResponse[]>([]);
    const {authToken} = useGlobalStore();
    const {addError, addWarning} = useStatusStore();

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
                    <ListItemDecorator >
                        <Switch
                            checked={a.published}
                            onChange={(event) =>
                                handlePublishToggle(a.asset_id, a.version.join('.'), event.target.checked)}
                            color={a.published ? 'success' : 'neutral'}
                             sx={{flex: 1}}
                        />
                      <Typography component="span" level="inherit" sx={{ml: '10px'}}>
                            {a.published ? 'Published' : 'Draft'}
                        </Typography>
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