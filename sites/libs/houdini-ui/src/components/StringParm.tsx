import React, { ChangeEvent, useState } from 'react';
import hou,{ dictionary } from '../types/Houdini';
import { useWindowSize } from '../util/useWindowSize';

export interface StringParmProps {
    template: hou.StringParmTemplate;
    data: dictionary;
    onChange?: (formData: dictionary) => void; // Callback for value changes
    onFileUpload?: (formData: Record<string,File>, callback:(file_id:string)=>void) => void; // Callback for file upload
}

export const StringParm: React.FC<StringParmProps> = ({template, data, onChange, onFileUpload}) => {
    const { currentWidth } = useWindowSize();
    const isMobileSize = currentWidth <= 700;
    
    const getDefaultValues = () => {
        return data[template.name] ||
            template.default_value.length === template.num_components
            ? template.default_value
            : Array<string>(template.num_components).fill("");
    }

    const [values, setValues] = useState<string[]>(getDefaultValues());

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const index =  e.target.getAttribute('parm-index') as unknown as number;

        if (template.string_type==hou.stringParmType.FileReference) {
            const handleFileUploadSuccess = (file_id:string) => {
                const newValue = {file_id: file_id};

                const ret:{[key:string]: dictionary} = {}
                ret[template.name] = newValue;
                onChange?.(ret); // Notify parent about the change
            }
            const file = e.target.files?.[0];
            if (file && onFileUpload) {
                onFileUpload({[template.name]: file},handleFileUploadSuccess); // Notify parent about the file upload    
            } else {
                console.warn("StringParm: File StringParam of FileReference but no FileUpload handler provided");                    
            }
        } else {
            setValues((prev)=>{
                prev[index] = newValue;
                return prev;
            });
            
            const newValue = e.target.value;
            //and notify listeners
            const ret:{[key:string]: string[]} = {}
            const updatedValues = [...values];
            updatedValues[index] = newValue;
            ret[template.name] = updatedValues
            onChange?.(ret); // Notify parent about the change
        }
    };

    if (template.string_type==hou.stringParmType.FileReference) {
        return (
            <div className="string-parm" title={template.help}>
                <label>{template.label}</label>
                <div className="fields">
                    <div 
                        key={template.name} 
                        style={{
                            width: '100%',
                        }}
                        className="field">
                        
                        <input
                            type="file"
                            accept={template.file_type}
                            onChange={handleChange}
                            parm-index={0}
                            style={{
                                width: '100%',
                                margin: '0px',
                            }}
                            placeholder={`Upload ${template.file_type} File`}
                        />
                    </div>  
                </div>
            </div>
        );
    } else {
        return (
            <div 
            className="string-parm" 
            title={template.help}
            style={!isMobileSize ? { display: 'flex', gap: '10px' } : undefined}>
                <label style={!isMobileSize ? { 
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
                } : undefined}>{template.label}</label>
                <div className="fields" style={!isMobileSize ? { flex: 1, width: '100%' } : undefined}>
                    {values.map((value, index) => (
                        <div 
                            key={template.name + index} 
                            style={{ 
                                width: `${100/values.length}%`,
                                padding: '0px',
                            }}
                            className="field">
                            <input
                                type="text"
                                value={value}
                                parm-index={index}
                                style={{
                                    width: '100%',
                                    margin: '0px',
                                }}
                                onChange={handleChange}
                                placeholder={`Component ${index + 1}`}
                            />
                        </div>  
                    ))}
                </div>
            </div>
        );
    }
};

export default StringParm;
