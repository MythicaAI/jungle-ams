import React, { useEffect, useState } from 'react';
import hou from '../../types/Houdini';
import { dictionary } from '../../types/Automation';

export interface StringParmProps {
    template: hou.StringParmTemplate;
    onChange?: (formData: dictionary) => void; // Callback for value changes
    runtimeData?: { values: string []};
}

const StringParm: React.FC<StringParmProps> = ({template, onChange, runtimeData = {values:null}}) => {
    const getDefaultValues = () => {
        return template.default_value.length === template.num_components
            ? template.default_value
            : Array<string>(template.num_components).fill("");
    }

    const [values, setValues] = useState<string[]>(getDefaultValues());

    const handleChange = (index: number, newValue: string) => {
        // Update the state 
        const updatedValues = [...values];
        updatedValues[index] = newValue;
        setValues(updatedValues);

        //and notify listeners
        const ret:{[key:string]: string[]} = {}
        ret[template.name] = updatedValues
        onChange?.(ret); // Notify parent about the change
    };

    useEffect(() => {
        runtimeData.values = values;
    }, [runtimeData, values]);


    return (
        <div className="string-parm" title={template.help}>
            <label>{template.label}</label>
            <div className="fields">
                {values.map((value, index) => (
                    <div key={template.name + index} className="field">
                        <input
                            type="text"
                            value={value}
                            onChange={(e) => handleChange(index, e.target.value)}
                            placeholder={`Component ${index + 1}`}
                        />
                    </div>  
                ))}
            </div>
        </div>
    );
};

export default StringParm;
