import React, { useState, useEffect } from 'react';
import { JSONSchema, JSONSchemaProperty } from '../types/JSONSchema';
import { FileParamType } from '../types/Automation';

type InputData = {
    [key: string]: unknown;
};


interface AutomationInputProps {
    inputSchema: JSONSchema | undefined;
    onChange: (formData: InputData) => void;
    onFileParameterDetected: (fileParams: Record<string, FileParamType>) => void; }

const AutomationInputs: React.FC<AutomationInputProps> = ({ inputSchema: schema, onChange, onFileParameterDetected }) => {
    const [formData, setFormData] = useState<InputData>({});
    const [fileParams, setFileParams] = useState<Record<string, FileParamType>>({});

    useEffect(() => {
        onFileParameterDetected(fileParams); // Notify parent about detected FileParameters
    }, [fileParams, onFileParameterDetected]);

    if (!schema) return null;

    const handleChange = (key: string, value: unknown) => {
        const updatedData = { ...formData, [key]: value };
        setFormData(updatedData);
        onChange(updatedData); // Trigger parent component's onChange
    };

    const resolveRef = (ref: string, schema: JSONSchema): JSONSchemaProperty | undefined => {
        const refPath = ref.replace(/^#\/?/, '').split('/');
        let resolvedSchema: unknown = schema;
        refPath.forEach((path) => {
            if (typeof resolvedSchema === 'object' && resolvedSchema !== null && path in resolvedSchema) {
                resolvedSchema = (resolvedSchema as Record<string, unknown>)[path];
            }
        });
        return resolvedSchema as JSONSchemaProperty | undefined;
    };

    const renderField = (key: string, fieldSchema: JSONSchemaProperty) => {

        // Resolve references if any
        if (fieldSchema.$ref) {
            const resolvedSchema = resolveRef(fieldSchema.$ref, schema);
            if (resolvedSchema) fieldSchema = resolvedSchema;
        }

        // Detect FileParameter (scalar or array)
        if (fieldSchema.$ref === '#/$defs/FileParameter'
            || (fieldSchema.type === 'object' && fieldSchema.title === 'FileParameter')
            || (fieldSchema.type === 'array' && fieldSchema.items?.title === 'FileParameter')
            || (fieldSchema.type === 'array' && fieldSchema.items?.$ref === '#/$defs/FileParameter')
        ) {
            const isArray = fieldSchema.type === FileParamType.Array;
            fileParamsCollector[key] = isArray ? FileParamType.Array : FileParamType.Scalar;

            return null; // Do not render a form field for FileParameter
        }

        switch (fieldSchema.type) {
            case 'string':
                return (
                    <div key={key}>
                        <label>{fieldSchema.title || key}</label>
                        <input
                            type="text"
                            defaultValue={typeof fieldSchema.default === 'string' ? fieldSchema.default : ''}
                            onChange={(e) => handleChange(key, e.target.value)}
                        />
                    </div>
                );

            case 'object':
                return (
                    <fieldset key={key}>
                        <label>{key}</label>
                        {fieldSchema.properties &&
                            Object.entries(fieldSchema.properties).map(([childKey, childSchema]) =>
                                renderField(childKey, childSchema)
                            )}
                    </fieldset>
                );

            case 'array':
                return (
                    <div key={key}>
                        <label>{fieldSchema.title || key}</label>
                        <input
                            type="text"
                            placeholder="Enter comma-separated values"
                            onChange={(e) => handleChange(key, e.target.value.split(','))}
                        />
                    </div>
                );

            default:
                if (fieldSchema.anyOf) {
                    return (
                        <div key={key}>
                            <label>{fieldSchema.title || key}</label>
                            <select onChange={(e) => handleChange(key, e.target.value)}>
                                {fieldSchema.anyOf.map((option, index) => {
                                    const val = typeof option.const === 'string' ? option.const : String(option.default ?? '');
                                    return (
                                        <option key={index} value={val}>
                                            {option.title || String(option.const ?? '') || String(option.default ?? '') || `Option ${index + 1}`}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    );
                }

                // Fallback for unsupported fields
                return (
                    <div key={key}>
                        <label>{fieldSchema.title || key}</label>
                        <input
                            type="text"
                            defaultValue={typeof fieldSchema.default === 'string' ? fieldSchema.default : ''}
                            onChange={(e) => handleChange(key, e.target.value)}
                        />
                    </div>
                );
        }
    };
    const filteredProperties = schema.properties
        ? Object.entries(schema.properties).filter(([,v]) => v['$ref'] !== '#/$defs/FileParameter')
        : []

    const fileParamsCollector: Record<string, FileParamType> = {};

    const retValue =  (
        <div>
            <h3>{ filteredProperties?.length ? "Inputs" : "" }</h3>
            <form>
                {
                schema.properties &&
                    Object.entries(schema.properties).map(([key, fieldSchema]) =>
                        renderField(key, fieldSchema)
                    )}
            </form>
        </div>
    );
    if (Object.keys(fileParamsCollector).sort().join(',') 
        !== Object.keys(fileParams).sort().join(',')) 
        setFileParams(fileParamsCollector);
    return retValue;
};

export default AutomationInputs;
