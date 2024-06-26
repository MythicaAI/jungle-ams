import {StatusStack} from "./StatusStack.tsx";
import {LucideBell, LucideBellRing} from "lucide-react";
import {Dropdown, MenuButton, Menu} from "@mui/joy";
import {useStatusStore} from "../stores/statusStore.ts";


export const StatusAlarm= () => {
    const {hasStatus} = useStatusStore();
    return <Dropdown open={hasStatus()}>
        <MenuButton>
            {hasStatus() ? <LucideBellRing/> : <LucideBell/>}
        </MenuButton>
        <Menu placement="bottom-end">
            <StatusStack/>
        </Menu>
    </Dropdown>;
};