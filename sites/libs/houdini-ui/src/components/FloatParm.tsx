import React, { ChangeEvent, useState } from 'react';
import hou, { dictionary } from '../types/Houdini';
import { useWindowSize } from '../util/useWindowSize';

export interface FloatParmProps {
  template: hou.FloatParmTemplate;
  data: dictionary;
  onChange: (formData: dictionary) => void; // Callback for value changes
  useSlidersOnMobile?: boolean;
}

export const FloatParm: React.FC<FloatParmProps> = ({
  template,
  data,
  onChange,
  useSlidersOnMobile,
}) => {
  const [values, setValues] = useState<number[]>(() =>
    data[template.name] ||
    template.default_value.length === template.num_components
      ? template.default_value
      : Array<number>(template.num_components).fill(0)
  );
  const { currentWidth } = useWindowSize();
  const isMobileSize = currentWidth <= 700 && useSlidersOnMobile;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const parsedValue = parseFloat(e.target.value) || 0;
    const index = e.target.getAttribute('parm-index') as unknown as number;

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
    setValues((prev) => {
      prev[index] = validatedValue;
      return prev;
    });

    //and notify listeners
    const updatedValues = [...values];
    updatedValues[index] = validatedValue;
    const ret: { [key: string]: number[] } = {};
    ret[template.name] = updatedValues;
    onChange?.(ret); // Notify parent about the change
  };

  const range = template.max - template.min;
  const val = (val:number) => {
    if (val === undefined || val === null) return 0;
    if (range > 1000) {
      return val.toFixed(0);
    }
    if (template.max < 0.1) {
      return val.toExponential(4);
    }
    return val.toFixed(4 - Math.floor(Math.log10(range)));
  };

  return (
    <div className="float-parm" title={template.help}>
      <label>{template.label}</label>
      <div className="fields">
        {values.map((value, index) => (
          <div
            key={template.name + index}
            className={`field ${isMobileSize ? 'slider-field' : ''}`}
            style={{
              width: `${100/values.length}%`,
              padding: '0px',
          }}
          >
            <input
              type='range'
              value={value || template.default_value[index] || template.min || 0}  
              step={(template.max - template.min)/1000}
              parm-index={index}
              onChange={handleChange}
              min={template.min}
              max={template.max}
              style={{
                width: '100%',  
                margin: '0px',
                padding: '0px',
              }}
              className='input-slider'
            />
            <span
              style={{ 
                fontSize: 'smaller',
                margin: '0px',
                padding: '0px',
                display: 'block',
              }}
            >
              {val(value)}
            </span> 
          </div>
        ))}
      </div>
    </div>
  );
};

export default FloatParm;
