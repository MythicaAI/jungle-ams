import React, { ChangeEvent, useState } from 'react';
import hou from '../../../types/Houdini';
import { dictionary } from '../../../types/Automation';

export interface IntParmProps {
    template: hou.IntParmTemplate;
    data: dictionary;
    onChange: (formData: dictionary) => void; // Callback for value changes
}

const IntParm: React.FC<IntParmProps> = ({template, data, onChange}) => {
    const getDefaultValues = () => {
        return data[template.name] ||
            template.default_value.length === template.num_components
            ? template.default_value
            : Array<number>(template.num_components).fill(0);
    }

    const [values, setValues] = useState<number[]>(getDefaultValues());

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const parsedValue = parseFloat(e.target.value) || 0;
        const index =  e.target.getAttribute('parm-index') as unknown as number;

        // Validate the value
        let validatedValue = parsedValue;
        if (template.min !== undefined) {
            if (template.min_is_strict && validatedValue <= template.min) {
                validatedValue = template.min + 1; // Adjust slightly above min if strict
            } else if (!template.min_is_strict && validatedValue < template.min) {
                validatedValue = template.min;
            }
        }
        if (template.max !== undefined) {
            if (template.max_is_strict && validatedValue >= template.max) {
                validatedValue = template.max - 1; // Adjust slightly below max if strict
            } else if (!template.max_is_strict && validatedValue > template.max) {
                validatedValue = template.max;
            }
        }

        // Update the state and notify parent
        setValues((prev)=>{
            prev[index] = validatedValue;
            return prev;
        });

        //and notify listeners
        const updatedValues = [...values];
        updatedValues[index] = validatedValue;
        const ret:{[key:string]: number[]} = {}
        ret[template.name] = updatedValues
        onChange?.(ret); // Notify parent about the change
    };

    return (
        <div className="int-parm" title={template.help}>
            <label>{template.label}</label>
            <div className="fields">
                {values.map((value, index) => (
                    <div key={template.name + index} className="field">
                        <input
                            type="number"
                            value={value}
                            step="1"
                            parm-index={index}
                            onChange={handleChange}
                            min={template.min}
                            max={template.max}
                            
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default IntParm;
