import React, { useState } from 'react';
import hou from '../../types/Houdini';
import { dictionary } from '../../types/Automation';

export interface FloatParmProps {
    template: hou.FloatParmTemplate;
    onChange: (formData: dictionary) => void; // Callback for value changes
}

const FloatParm: React.FC<FloatParmProps> = ({template, onChange}) => {
    const getDefaultValues = () => {
        return template.default_value.length === template.num_components
            ? template.default_value
            : Array<number>(template.num_components).fill(0);
    }

    const [values, setValues] = useState<number[]>(getDefaultValues());

    const handleChange = (index: number, newValue: string) => {
        const parsedValue = parseFloat(newValue);

        // Validate the value
        let validatedValue = parsedValue;
        if (template.min !== undefined) {
            if (template.min_is_strict && validatedValue <= template.min) {
                validatedValue = template.min + 1e-6; // Adjust slightly above min if strict
            } else if (!template.min_is_strict && validatedValue < template.min) {
                validatedValue = template.min;
            }
        }
        if (template.max !== undefined) {
            if (template.max_is_strict && validatedValue >= template.max) {
                validatedValue = template.max - 1e-6; // Adjust slightly below max if strict
            } else if (!template.max_is_strict && validatedValue > template.max) {
                validatedValue = template.max;
            }
        }

        // Update the state and notify parent
        const updatedValues = [...values];
        updatedValues[index] = validatedValue;
        setValues(updatedValues);

        //and notify listeners
        const ret:{[key:string]: number[]} = {}
        ret[template.name] = updatedValues
        onChange(ret); // Notify parent about the change
    };

    return (
        <div className="float-parm" title={template.help}>
            <label>{template.label}</label>
            <div className="fields">
                {values.map((value, index) => (
                    <div key={template.name + index} className="field">
                        <input
                            type="number"
                            value={value}
                            step="any"
                            onChange={(e) => handleChange(index, e.target.value)}
                            min={template.min}
                            max={template.max}
                            
                            
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FloatParm;
