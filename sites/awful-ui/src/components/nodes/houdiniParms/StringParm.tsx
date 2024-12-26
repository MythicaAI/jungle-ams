import React, { ChangeEvent, useState } from 'react';
import hou from '../../../types/Houdini';
import { dictionary } from '../../../types/Automation';

export interface StringParmProps {
    template: hou.StringParmTemplate;
    data: dictionary;
    onChange?: (formData: dictionary) => void; // Callback for value changes
}

const StringParm: React.FC<StringParmProps> = ({template, data, onChange}) => {
    const getDefaultValues = () => {
        return data[template.name] ||
            template.default_value.length === template.num_components
            ? template.default_value
            : Array<string>(template.num_components).fill("");
    }

    const [values, setValues] = useState<string[]>(getDefaultValues());

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        const index =  e.target.getAttribute('parm-index') as unknown as number;

        setValues((prev)=>{
            prev[index] = newValue;
            return prev;
        });


        //and notify listeners
        const ret:{[key:string]: string[]} = {}
        const updatedValues = [...values];
        updatedValues[index] = newValue;
        ret[template.name] = updatedValues
        onChange?.(ret); // Notify parent about the change
    };

    return (
        <div className="string-parm" title={template.help}>
            <label>{template.label}</label>
            <div className="fields">
                {values.map((value, index) => (
                    <div key={template.name + index} className="field">
                        <input
                            type="text"
                            value={value}
                            // eslint-disable-next-line react/no-unknown-property
                            parm-index={index}
                            onChange={handleChange}
                            placeholder={`Component ${index + 1}`}
                        />
                    </div>  
                ))}
            </div>
        </div>
    );
};

export default StringParm;
