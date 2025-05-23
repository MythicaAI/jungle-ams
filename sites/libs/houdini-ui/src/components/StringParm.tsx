import React, { ChangeEvent, useEffect, useState } from 'react';
import hou,{ dictionary } from '../types/Houdini';
import { useWindowSize } from '../util/useWindowSize';

export interface StringParmProps {
    template: hou.StringParmTemplate;
    data: dictionary;
    onChange?: (formData: dictionary) => void; // Callback for value changes
    onFileUpload?: (formData: Record<string,File>, callback:(file_id:string)=>void) => void; // Callback for file upload
}

export const StringParm: React.FC<StringParmProps> = ({template, data = {}, onChange, onFileUpload}) => {
    const { currentWidth } = useWindowSize();
    const isMobileSize = currentWidth <= 700;
    
    
    const getDefaultValues = () => {
        return template.default_value?.length === template.num_components
            ? [...template.default_value]
            : Array<string>(template.num_components).fill("");
    }

    const [values, setValues] = useState<string[]>(
        data[template.name] as string[] || getDefaultValues()
    );

    // Add state for file upload toggle
    const [showFileUpload, setShowFileUpload] = useState<boolean>(false);
    
    useEffect(() => {
        const myData = data[template.name] as string[] || getDefaultValues();
        if (myData && values !== myData) {
            setValues(myData);
        }
    }, [data[template.name]]);
    
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const index =  e.target.getAttribute('parm-index') as unknown as number;

        if (template.string_type==hou.stringParmType.FileReference) {
            const handleFileUploadSuccess = (file_id:string) => {
                const newValue = {file_id: file_id};

                const ret:{[key:string]: dictionary} = {}
                ret[template.name] = newValue;
                onChange?.(ret); // Notify parent about the change
                setShowFileUpload(false); // Hide the file upload input
            }
            const file = e.target.files?.[0];
            if (file && onFileUpload) {
                onFileUpload({[template.name]: file},handleFileUploadSuccess); // Notify parent about the file upload    
            } else {
                console.warn("StringParm: File StringParam of FileReference but no FileUpload handler provided");                    
            }
        } else {
            const newValue = e.target.value;
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
        }
    };

    if (template.string_type==hou.stringParmType.FileReference) {
        // Check if we have file data
        const fileData = data[template.name] as {file_id: string, file_name: string} | undefined;
        const hasExistingFile = fileData && fileData.file_id;
        
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
                <div key={template.name} className="fields" style={!isMobileSize ? { flex: 1, width: '100%' } : undefined}>
                    
                    <div style={{ 
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        padding: '4px 8px',
                        gap: '4px',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                    }}>
                        {hasExistingFile && !showFileUpload ? (
                            <>
                            <input
                                type="text"
                                readOnly
                                value={fileData.file_name || fileData.file_id}
                                style={{ 
                                    flex: 1, 
                                    width: '100%',
                                    border: 'none',
                                    background: 'transparent',
                                    padding: '4px',
                                    cursor: 'default',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis'
                                }}
                            />
                            <button
                                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                    e.preventDefault();
                                    setShowFileUpload(true);
                                }}
                                style={{
                                    padding: '2px 8px',
                                    border: '1px solid #ccc',
                                    borderRadius: '3px',
                                    cursor: 'pointer'
                                }}
                            >
                                Change
                            </button>
                            </>
                        ) : (
                            <>
                            <input
                                type="file"
                                accept={template.file_type}
                                onChange={handleChange}
                                parm-index={0}
                                style={{
                                    width: '100%',
                                    paddingBottom: '2px',
                                }}
                                placeholder={`Upload ${template.file_type} File`}
                            />
                            {hasExistingFile && showFileUpload && (
                                <button
                                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                                        e.preventDefault();
                                        setShowFileUpload(false);
                                    }}
                                    style={{
                                        padding: '2px 8px',
                                        border: '1px solid #ccc',
                                        borderRadius: '3px',
                                        cursor: 'pointer',
                                        marginBottom: '1px'
                                    }}
                                >
                                    Cancel&nbsp;
                                </button>
                            )}
                            </>
                        )}                            
                    </div>
                </div>
            </div>
        );
    } else {
        return (
            <div 
            className="string-parm" 
            title={template.help}
            style={!isMobileSize ? { 
                display: 'flex', 
                alignItems: 'center', 
                gap: '10px',
                marginBottom: '12px'
            } : undefined}>
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
                } : undefined}
                title={`variable: ${template.name}`}
                >{template.label}</label>
                <div className="fields" 
                    style={!isMobileSize ? { 
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        flex: 1, 
                        width: '100%' } : undefined}>
                    {values.map((value, index) => (
                        <div 
                            key={template.name + index} 
                            style={{ 
                                width: `${100/values.length}%`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                            }}
                            className="field">
                            <input
                                type="text"
                                value={value}
                                parm-index={index}
                                className="editable-value"
                                style={{
                                    textAlign: 'right',
                                    fontSize: 'small',
                                    width: '100%',
                                    flexGrow: 1,
                                    backgroundColor: 'rgba(40, 40, 40, 0.9)',
                                    border: '1px solid #555',
                                    borderRadius: '3px',
                                    color: 'white',
                                }}
                                onChange={handleChange}
                                placeholder={`Component ${index + 1}`}
                            />
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
    }
};

export default StringParm;
