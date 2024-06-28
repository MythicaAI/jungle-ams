import {Sheet, Stack, Typography} from "@mui/joy";
import {useAssetVersionStore} from "../stores/assetVersionStore.ts";


export const AssetIdentityHeader = () => {
    const {asset_id, org_id} = useAssetVersionStore();
    return <Sheet
        variant="outlined"
        sx={{
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            px: 2,
            borderRadius: 0,
            borderLeft: 'none',
            borderRight: 'none',
        }}
    >
        <Stack direction="row" spacing={1} alignItems="center">
            {[['asset_id', asset_id],
                ['org_id', org_id]].map(v => (
                <Typography key={v[0]} fontFamily={"code"} level={"body-xs"}>{v[0]} ({v[1]})</Typography>
            ))}
        </Stack>
    </Sheet>;
}