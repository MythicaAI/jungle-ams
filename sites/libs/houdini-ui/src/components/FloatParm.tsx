import React, { ChangeEvent, useEffect, useState } from 'react';
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
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>("");
  const { currentWidth } = useWindowSize();
  const isMobileSize = currentWidth <= 700 && useSlidersOnMobile;
  const [isValidInput, setIsValidInput] = useState<boolean>(true);
  const isMultiComponent = template.num_components > 1;

  const getDefaultValues = () => {
    return template.default_value?.length === template.num_components
      ? [...template.default_value]
      : Array<number>(template.num_components).fill(0);
  }
  const [values, setValues] = useState<number[]>(() =>
    (data[template.name] as number[]) || getDefaultValues() 
  );
  
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


  useEffect(() => {
    const myData = data[template.name] as number[] || getDefaultValues()
    if (myData && values !== myData) {
      setValues(myData);
    }
  }, [data, data[template.name]]);

  const startEditing = (index: number, value: number) => {
    setEditingIndex(index);
    setEditValue(val(value));
    setIsValidInput(true);
  };

  const cancelEditing = () => {
    setEditingIndex(null);
    setIsValidInput(true);
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

  // Validate float input
  const handleEditChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEditValue(value);
    
    // Check if the value can be parsed as a valid float
    // Valid formats: decimal numbers, scientific notation, negative numbers
    const isValid = value.trim() !== '' && 
                    !isNaN(parseFloat(value)) && 
                    /^-?(\d*\.?\d+|\d+\.?\d*)([eE][-+]?\d+)?$/.test(value);
    
    setIsValidInput(isValid);
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
  const editableValueStyle = (hasSlider: boolean) => ({
    fontSize: 'smaller',
    margin: '0px',
    padding: '3px 5px',
    cursor: 'pointer',
    border: '1px solid #444',
    borderRadius: '3px',
    minWidth: '50px',
    width: hasSlider ? '50px' : '100%',
    textAlign: 'right' as const,
    backgroundColor: 'rgba(30, 30, 30, 0.8)',
  });

  // Mobile layout
  if (isMobileSize) {
    return (
      <div className="float-parm" title={template.help} style={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'flex-start', 
        gap: '5px',
        marginBottom: '8px'
      }}>
        <label style={{ 
          width: '100%', 
          textAlign: 'center',
          marginBottom: '3px'
        }}>
          {template.label}
        </label>
        
        <div className="fields" style={{ 
          display: 'flex', 
          gap: '5px', 
          alignItems: 'center',
          width: '100%'
        }}>
          {values.map((value, index) => (
            <div
              key={template.name + index}
              className="field"
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                flex: 1
              }}
            >
              <input
                type='range'
                value={value}  
                step={(template.max - template.min)/1000}
                parm-index={index}
                onChange={handleChange}
                min={template.min}
                max={template.max}
                style={{
                  width: '100%',
                  margin: '0px',
                }}
                className='input-slider'
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  // Desktop layout
  return (
    <div className="float-parm" title={template.help} style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '10px',
      marginBottom: '12px'
    }}>
      <label style={{ 
        width: '100px', 
        textAlign: 'right',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'flex-end',
        height: 'auto',
        minHeight: '28px',
        margin: 0,
        wordWrap: 'break-word',
        overflowWrap: 'break-word'
      }}>
        {template.label}
      </label>
      
      <div className="fields" style={{ 
        display: 'flex', 
        gap: '5px', 
        alignItems: 'center',
        flex: 1,
        width: '100%'
      }}>
        {values.map((value, index) => (
          <div
            key={template.name + index}
            className="field"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flex: isMultiComponent ? 1 : 1,
              width: '100%'
            }}
          >
            {editingIndex === index ? (
              <div style={{ 
                display: 'flex',
                alignItems: 'center',
                fontSize: 'small',
                width: !isMultiComponent ? 'auto' : '100%',
              }}>
                <input
                  type="text"
                  value={editValue}
                  onChange={handleEditChange}
                  onKeyDown={handleEditKeyDown}
                  autoFocus
                  style={{
                    textAlign: 'right',
                    padding: '3px 5px',
                    fontSize: 'small',
                    width: !isMultiComponent ? '50px' : '100%',
                    flexGrow: isMultiComponent ? 1 : 0,
                    backgroundColor: isValidInput ? 'rgba(40, 40, 40, 0.9)' : 'rgba(255, 0, 0, 0.2)',
                    border: isValidInput ? '1px solid #555' : '1px solid red',
                    borderRadius: '3px',
                    color: 'white',
                  }}
                />
                <button 
                  onClick={confirmEditing}
                  title="Confirm"
                  disabled={!isValidInput}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: isValidInput ? 'pointer' : 'not-allowed',
                    color: isValidInput ? 'white' : 'gray',
                    padding: '0 2px',
                    opacity: isValidInput ? 1 : 0.5,
                  }}
                >
                  ✓
                </button>
                <button 
                  onClick={cancelEditing}
                  title="Cancel"
                  style={{
                    background: 'none',
                    border: 'none',
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
                style={editableValueStyle(!isMultiComponent)}
                onClick={() => startEditing(index, value)}
                title="Click to edit value"
                className="editable-value"
              >
                {val(value)}
              </span>
            )}
            
            {!isMultiComponent && (
              <input
                type='range'
                value={value}  
                step={(template.max - template.min)/1000}
                parm-index={index}
                onChange={handleChange}
                min={template.min}
                max={template.max}
                style={{
                  flex: 1,
                  width: '100%',
                  margin: '0px',
                }}
                className='input-slider'
              />
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
