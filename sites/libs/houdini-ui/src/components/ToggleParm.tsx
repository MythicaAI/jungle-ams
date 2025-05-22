import React, { useEffect, useState } from 'react';
import hou,{ dictionary } from '../types/Houdini';


export interface ToggleParmProps {
    template: hou.ToggleParmTemplate;
    data: dictionary;
    onChange?: (formData: dictionary) => void; // Callback for value changes
}

export const ToggleParm: React.FC<ToggleParmProps> = ({template, data, onChange}) => {

    const [value, setValue] = useState<boolean>(
        (data?.[template.name] ?? template.default_value) as boolean
    );

    useEffect(() => {
        const myData = (data?.[template.name] ?? template.default_value) as boolean;
        if (myData!=undefined && value != myData) {
            setValue(myData);
        }
    }, [data?.[template.name]]);
    
    const handleChange = (_event: React.ChangeEvent<HTMLInputElement>) => {
        setValue(!value);

        const ret:{[key:string]: boolean} = {}
        ret[template.name] = !value
        onChange?.(ret); // Notify parent about the change
    };

    return (
        <div className="toggle-parm" title={template.help}>
            <label title={`variable: ${template.name}`}>
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
