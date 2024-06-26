import {StatusStack} from "./StatusStack.tsx";
import React, {useState} from "react";
import {LucideBell, LucideBellRing} from "lucide-react";
import {Dropdown, MenuButton, IconButton, Menu} from "@mui/joy";
import {useStatusStore} from "../stores/statusStore.ts";


export const StatusAlarm: React.FC = () => {
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