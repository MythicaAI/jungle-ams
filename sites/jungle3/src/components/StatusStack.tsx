import {Alert, Box, Divider, IconButton, Stack, Typography} from "@mui/joy";
import {useStatusStore} from "../stores/statusStore.ts"
import {LucideXSquare} from "lucide-react";
import {v4} from "uuid";

export const StatusStack = () => {
    const {
        success,
        warnings,
        errors,
        hasStatus,
        clear} = useStatusStore();
    return <Box
            sx={{
                position: 'relative',
                padding: '16px',
                borderRadius: '4px',
                display: 'flex',
                alignItems: 'left',
                justifyContent: 'space-between'
            }}>
            { hasStatus() ?
                <Stack spacing={1}>
                    <Box alignContent={"flex-end"}><IconButton
                        size="sm"
                        onClick={clear}>
                        <LucideXSquare/>
                    </IconButton></Box>
                    {success ?
                        <Alert color="success">
                            {success}
                        </Alert> : ""}

                    {errors.map(msg => (<Alert key={v4()} color={"danger"}>{msg}</Alert>))}
                    {warnings.map(msg => (<Alert key={v4()} color={"warning"}>{msg}</Alert>))}
                </Stack>
                : <Typography fontStyle={"italic"}>No messages</Typography>}
    </Box>;
}