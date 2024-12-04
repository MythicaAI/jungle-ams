import React, { useEffect, useState } from 'react';
import hou from '../../types/Houdini';
import { dictionary } from '../../types/Automation';

export interface ToggleParmProps {
    template: hou.ToggleParmTemplate;
    onChange?: (formData: dictionary) => void; // Callback for value changes
    runtimeData?: { value: boolean };
}

const ToggleParm: React.FC<ToggleParmProps> = ({template, onChange, runtimeData = {value:null}}) => {

    const [value, setValue] = useState<boolean>(template.default_value || false);

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = event.target.checked;
        setValue(newValue);

        const ret:{[key:string]: boolean} = {}
        ret[template.name] = newValue
        onChange?.(ret); // Notify parent about the change
    };

    useEffect(() => {
        runtimeData.value = value;
    }, [runtimeData, value]);

    return (
        <div className="toggle-parm" title={template.help}>
            <label>
                <input
                    type="checkbox"
                    checked={value}
                    onChange={handleChange}
                />
                {template.label}
            </label>
        </div>
    );
};

export default ToggleParm;
