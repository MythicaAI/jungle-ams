import {
    Button,
    Grid,
    Sheet,
} from '@mui/joy';
import {useGlobalStore} from "./stores/globalStore.ts";
import {useEffect} from "react";
import {useAssetVersionStore} from "./stores/assetVersionStore.ts";
import {extractValidationErrors, getData, postData, translateError} from "./services/backendCommon.ts";
import {useStatusStore} from "./stores/statusStore.ts";
import {AxiosError} from "axios";
import {AssetVersionContentListMap, AssetVersionResponse} from "./types/apiTypes.ts";
import {useParams, useNavigate} from "react-router-dom";
import {AssetIdentityHeader} from "./components/AssetIdentityHeader.tsx";
import {convertUserVersion, isVersionZero, sanitizeVersion} from "./types/assetEditTypes.ts";
import {AssetEditPageHeader} from "./components/AssetEditPageHeader.tsx";
import {AssetEditDetailControls} from "./components/AssetEditDetailControls.tsx";
import {AssetEditListControls} from "./components/AssetEditListControls.tsx";

interface AssetEditProps {
    assetId?: string,
    version?: string,
}


export const AssetEdit: React.FC<AssetEditProps> = (
    {assetId: propAssetId = undefined, version: propVersion = "0.0.0"}) => {
    const {orgRoles} = useGlobalStore();
    const {setSuccess, addError, addWarning} = useStatusStore();
    const {
        asset_id,
        files,
        thumbnails,
        addFiles,
        addThumbnails,
        updateVersion
    } = useAssetVersionStore();
    const navigate = useNavigate();

    // org_id state and initial update to first index
    useEffect(() => {
        if (orgRoles && orgRoles.length > 0 && orgRoles[0].org_id) {
            updateVersion({org_id: orgRoles[0].org_id});
        }
    }, [orgRoles])

    // handle populating the form if an asset ID was specified
    useEffect(() => {
        if (!propAssetId) {
            return;
        }
        getData<AssetVersionResponse>(`assets/${propAssetId}/versions/${propVersion}`).then(r => {
            loadAssetVersionResponse(r);
        }).catch(err => handleError(err));
    }, [propAssetId, propVersion]);

    const handleError = (err: AxiosError) => {
        addError(translateError(err));
        extractValidationErrors(err).map(msg => (addWarning(msg)));
    }

    const loadAssetVersionResponse = (r: AssetVersionResponse) => {
        console.log(`loading asset version ${r.asset_id} ${r.version.join('.')}`);

        const sanitized = sanitizeVersion(r.version);

        // clear files and replace with version response
        updateVersion({
            asset_id: r.asset_id,
            org_id: r.org_id || '',
            author: r.author || '',
            package_id: r.package_id || '',
            name: r.name || '',
            description: r.description || '',
            version: sanitized,
            commit_ref: r.commit_ref || '',
            created: r.created || '',
            updated: r.updated,
            files: {},
            thumbnails: {},
            links: []
        });

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

    // handle form submit for the specified version
    const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);

        // Create a plain object from FormData
        const formJson: {[key: string]: string | object} = {};
        formJson['contents'] = {
                files: Object.values(files),
                thumbnails: Object.values(thumbnails),
        };
        formData.forEach((value, key) => {
            if (key != 'org_id' || value !== '') {
                formJson[key] = value as string;
            }
        });
        const sanitizedVersion = sanitizeVersion(convertUserVersion(formJson['version'] as string));
        if (isVersionZero(sanitizedVersion)) {
            addError("Zero versions are not supported");
            return;
        }
        postData<AssetVersionResponse>(`assets/${asset_id}/versions/${sanitizedVersion.join('.')}`, formJson).then(
            r => {
                loadAssetVersionResponse(r);
                setSuccess(`${r.name}, ${r.version.join('.')} updated`);
                navigate('/packages');
            }).catch(err => handleError(err));
    }

    return (
        <Sheet
            variant="outlined"
            sx={{
                maxWidth: 1000,
                mx: 'auto', // margin left & right
                my: 4, // margin top & bottom
                py: 3, // padding top & bottom
                px: 2, // padding left & right
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                borderRadius: 'sm',
                boxShadow: 'md',
            }}
        >
            <form onSubmit={onSubmit}>
                <Grid container spacing={2} sx={{ flexGrow: 1 }}>
                    <Grid xs={12}><AssetEditPageHeader /></Grid>
                    <Grid xs={12}><AssetIdentityHeader /></Grid>

                    <Grid xs={5}>
                        <AssetEditDetailControls />
                    </Grid>

                    <Grid xs={7}>
                        <AssetEditListControls />
                    </Grid>
                    <Grid xs={7}></Grid>
                    <Grid xs={5}>
                        <Button type="submit">Update</Button>
                    </Grid>
                </Grid>
            </form>
        </Sheet>
    );
};


export const AssetEditWrapper: React.FC = () => {
    const {asset_id, version} = useParams();
    return <AssetEdit assetId={asset_id} version={version}/>;
}
