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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const { currentWidth } = useWindowSize();
  const isMobileSize = currentWidth <= 700 && useSlidersOnMobile;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const parsedValue = parseFloat(e.target.value) || 0;
    const index = parseInt(e.target.getAttribute('parm-index') || '0', 10);

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

    // Create a new array for immutable state update
    const updatedValues = [...values];
    updatedValues[index] = validatedValue;
    setValues(updatedValues);

    // Notify parent about the change
    const ret: { [key: string]: number[] } = {};
    ret[template.name] = updatedValues;
    onChange?.(ret);
  };

  const startEditing = (index: number, value: number) => {
    setEditingIndex(index);
    setEditValue(val(value));
  };

  const cancelEditing = () => {
    setEditingIndex(null);
  };

  const confirmEditing = () => {
    if (editingIndex !== null) {
      const parsedValue = parseFloat(editValue) || 0;
      // Validate the value - only enforce limits when the corresponding strict flag is true
      let validatedValue = parsedValue;
      
      // Only enforce minimum if min_is_strict is true
      if (template.min !== undefined && template.min_is_strict && validatedValue < template.min) {
        validatedValue = template.min;
      }
      
      // Only enforce maximum if max_is_strict is true
      if (template.max !== undefined && template.max_is_strict && validatedValue > template.max) {
        validatedValue = template.max;
      }

      // Create a new array for immutable state update
      const updatedValues = [...values];
      updatedValues[editingIndex] = validatedValue;
      setValues(updatedValues);

      // Notify parent about the change
      const ret: { [key: string]: number[] } = {};
      ret[template.name] = updatedValues;
      onChange?.(ret);
      
      setEditingIndex(null);
    }
  };

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      confirmEditing();
    } else if (e.key === 'Escape') {
      cancelEditing();
    }
  };

  const range = template.max - template.min;
  const val = (val:number) => {
    if (val === undefined || val === null) return "0";
    if (range > 1000) {
      return val.toFixed(0);
    }
    if (template.max < 0.1) {
      return val.toExponential(4);
    }
    return val.toFixed(4 - Math.floor(Math.log10(range)));
  };

  // CSS for the editable value
  const editableValueStyle = {
    fontSize: 'smaller',
    margin: '0px',
    padding: '0px',
    display: 'block',
    cursor: 'pointer',
    border: '1px dashed transparent',
    borderRadius: '3px',
    transition: 'all 0.2s ease'
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
            {editingIndex === index ? (
              <div style={{ 
                alignItems: 'center',
                fontSize: 'small',
              }}>
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  autoFocus
                  style={{
                    textAlign: 'right',
                    flex: 1,
                    padding: '5px',
                    fontSize: 'small',
                  }}
                />
                <button 
                  onClick={confirmEditing}
                  title="Confirm"
                  style={{
                    background: 'none',
                    cursor: 'pointer',
                    color: 'white',
                    padding: '0 2px',
                  }}
                >
                  ✓
                </button>
                <button 
                  onClick={cancelEditing}
                  title="Cancel"
                  style={{
                    background: 'none',
                    cursor: 'pointer',
                    color: 'white',
                    padding: '0 2px',
                  }}
                >
                  ✕
                </button>
              </div>
            ) : (
              <span
                style={editableValueStyle}
                onClick={() => startEditing(index, value)}
                title="Click to edit value"
                className="editable-value"
              >
                {val(value)}
              </span>
            )}
          </div>
        ))}
      </div>

      <style>
        {`
          .editable-value:hover {
            border-color: #ccc !important;
            background-color: rgba(200, 200, 200, 0.1);
          }
        `}
      </style>
    </div>
  );
};

export default FloatParm;
