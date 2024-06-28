import {useNavigate} from "react-router-dom";
import {IconButton, List, ListItemContent, ListItemDecorator, Typography} from "@mui/joy";
import {LucideChevronLeft, LucidePackage} from "lucide-react";

export const AssetEditPageHeader = () => {
    const navigate = useNavigate();
    return <List orientation={"horizontal"}>
        <ListItemDecorator>
            <IconButton onClick={() => navigate('/packages')}>
                <LucideChevronLeft/>
                <LucidePackage/>
            </IconButton>
        </ListItemDecorator>
        <ListItemContent>
            <Typography level="h4" component="h1">
                <b>Package Editor</b>
            </Typography>
        </ListItemContent>
    </List>;
}