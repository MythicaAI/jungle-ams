import {Box, FormControl, FormHelperText, FormLabel, Input, Option, Select} from "@mui/joy";
import {Link, useParams} from "react-router-dom";
import {LucideInfo} from "lucide-react";
import Textarea from "@mui/joy/Textarea";
import {useGlobalStore} from "../stores/globalStore.ts";
import {useAssetVersionStore} from "../stores/assetVersionStore.ts";
import {convertUserVersion, isVersionZero, sanitizeVersion} from "../types/assetEditTypes.ts";
import {useEffect, useState} from "react";


export const AssetEditDetailControls = () => {
    const { version: paramVersion} = useParams();
    const {orgRoles} = useGlobalStore();
    const {
        org_id,
        name,
        description,
        version,
        updateVersion
    } = useAssetVersionStore();

     // version sanitizing state, should only be populated by the sanitizeVersion() function
    const [
        sanitizedVersion,
        setSanitizedVersion] = useState<number[]>([0, 0, 0]);

    // separately manage the user's input version
    const [
        userVersion,
        setUserVersion] = useState<string>("0.0.0");

    // initialize version sanitation
    useEffect(() => {
        if (paramVersion) {
            setSanitizedVersion(convertUserVersion(paramVersion));
            setUserVersion(paramVersion)
        }
        if (version && !isVersionZero(version)) {
            setSanitizedVersion(sanitizeVersion(version));
        }
    }, [paramVersion, version]);


    const onUpdateOrg = (_event: React.SyntheticEvent | null, value: (string | null)) => {
        if (!value) {
            return;
        }
        updateVersion({org_id: value});
        console.log(`org updated ${value}`);
    }

    // When leaving the version field, split and parse the values and pass it through the version update
    // to sanitize it
    const onVersionBlur = (event: React.FocusEvent<HTMLInputElement>) => {
        event.preventDefault();
        if (!event.target) {
            return;
        }
        const parts = convertUserVersion(event.target.value);
        const sanitized = sanitizeVersion(parts);
        updateVersion({version: sanitized});
    }

    return <Box sx={{display: 'flex', flexDirection: 'column', gap: 2}}>
        <FormControl>
            <FormLabel>
                Name
            </FormLabel>
            <Input
                name="name"
                variant="outlined"
                placeholder="Name..."
                value={name}
                onChange={(e) => updateVersion({name: e.target.value})}/>
        </FormControl>

        <FormControl>
            <FormLabel>
                Org / Namespace
            </FormLabel>
            {(!org_id && orgRoles.length == 0) ?
                <Link to={"/orgs"}>Create New Organization</Link> : ""}
            {orgRoles.length > 0 ?
                <Select
                    variant="soft"
                    name="org_id"
                    placeholder={"Choose an existing org..."}
                    value={org_id}
                    multiple={false}
                    onChange={onUpdateOrg}>
                    {orgRoles.map(role => (
                        <Option key={role.org_id} value={role.org_id}>
                            {role.org_name}
                        </Option>)
                    )}
                    {org_id ! in orgRoles ? <Option key={org_id} value={org_id}>
                        {org_id} (not a member)
                    </Option> : ""}
                </Select>
                : ""}
        </FormControl>

        <FormControl error={isVersionZero(sanitizedVersion)}>
            <FormLabel>
                Version
            </FormLabel>
            <Input
                name="version"
                variant="outlined"
                placeholder={sanitizedVersion.join('.')}
                value={userVersion}
                onChange={(e) => {
                    setUserVersion(e.target.value);
                    setSanitizedVersion(sanitizeVersion(convertUserVersion(e.target.value)));
                }}
                onBlur={onVersionBlur}/>
            {isVersionZero(sanitizedVersion) ? <FormHelperText>
                <LucideInfo/>
                0.0.0 versions are not supported
            </FormHelperText> : ""}
        </FormControl>

        <FormControl>
            <FormLabel>
                Description
            </FormLabel>
            <Textarea
                name="description"
                placeholder="Fill out a description..."
                variant="outlined"
                size="md"
                minRows={4}
                value={description}
                onChange={(e) => updateVersion({description: e.target.value})}/>

        </FormControl>
    </Box>;
}
