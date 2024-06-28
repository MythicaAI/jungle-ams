import {StatusStack} from "./StatusStack.tsx";
import {LucideBell, LucideBellRing} from "lucide-react";
import {Dropdown, MenuButton, Menu} from "@mui/joy";
import {useStatusStore} from "../stores/statusStore.ts";
import {useEffect, useState} from "react";


export const StatusAlarm= () => {
    const {hasStatus, clear} = useStatusStore();
    const [closing, setClosing] = useState<boolean>(false);
    useEffect(() => {
        if (hasStatus() && !closing) {
            setClosing(true);
            setTimeout(() => clear(), 250);
        }
    }, [closing]);
    return <Dropdown open={hasStatus()}>
        <MenuButton>
            {hasStatus() ? <LucideBellRing/> : <LucideBell/>}
        </MenuButton>
        <Menu placement="bottom-end">
            <StatusStack/>
        </Menu>
    </Dropdown>;
};