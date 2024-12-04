import React, { useEffect } from 'react';
import { JSONSchema, JSONSchemaProperty } from '../types/JSONSchema';

export type ResultData = {
    [key: string]: unknown;
};

interface AutomationOutputProps {
    outputSchema: JSONSchema | undefined;
    outputData: ResultData | null;
    onFileOutputDetected: (fileOutputs: Set<string>) => void;
}

const AutomationOutputs: React.FC<AutomationOutputProps> = ({ outputSchema, outputData, onFileOutputDetected }) => {
    const [fileOutputs, setFileOutputs] = React.useState<Set<string>>(new Set());
    const hiddenFields = [
        'correlation',
        'index',
        'item_type',
        'job_id',
        'process_guid'
    ];

    useEffect(() => {
        onFileOutputDetected(fileOutputs);
    }, [fileOutputs, onFileOutputDetected]);

    if (!outputSchema) return null;

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
        // Detect FileParameter by schema structure or other unique identifiers
        if (!fieldSchema) return;


        if (fieldSchema.$ref) {
            const resolvedSchema = resolveRef(fieldSchema.$ref, outputSchema);
            if (resolvedSchema) fieldSchema = resolvedSchema;
        }

        if (key === 'files') {
            const fileKeys =
                fieldSchema.type === 'object' && fieldSchema.default
                    ? Object.keys(fieldSchema.default)
                    : ['?'];
        
            const sortedFileKeys = fileKeys.sort().join(',');
            const sortedPrevFileOutputs = [...fileOutputs].sort().join(',');
        
            if (sortedFileKeys !== sortedPrevFileOutputs) {
            setFileOutputs((prevFileOutputs) => {
                
                const newFileOutputs = new Set(prevFileOutputs);
                newFileOutputs.forEach((file) => {
                    if (!fileKeys.includes(file)) {
                        newFileOutputs.delete(file);
                    }
                })
                fileKeys.forEach((file) => newFileOutputs.add(file));
                return newFileOutputs;
            });
            }
        
            return null;
        }
        

        return (
            <div key={key}>
                <label>{key}:</label>
                <span>{JSON.stringify(outputData?.[key]) || ''}</span>
            </div>
        );
    }

    const filteredProperties = outputSchema.properties
        ? Object.entries(outputSchema.properties).filter(([k,]) => !(hiddenFields.includes(k)))
        : []
    if (!filteredProperties?.length) return null;
    return (
        <div>
            {/*TODO: There nas to be a better way... */}
            <h3>{filteredProperties?.length > 1 ? "Outputs": ""}</h3>
            <div>
                {filteredProperties.map(([key, fieldSchema]) =>
                    renderField(key, fieldSchema)
                )}
            </div>
        </div>
    );
};

export default AutomationOutputs;
