export type JSONSchema = {
    title: string;
    type: string;
    additionalProperties?: boolean;
    properties?: Record<string, JSONSchemaProperty>;
    required?: string[];
    $defs?: Record<string, JSONSchemaProperty>;
};

export type JSONSchemaProperty = {
    type: string;
    title?: string;
    default?: unknown;
    propertyNames?: string[];
    properties?: Record<string, JSONSchemaProperty>;
    required?: string[];
    anyOf?: Array<{ title?: string; const?: unknown; default?: unknown }>;
    $ref?: string;
    items?: JSONSchemaProperty ; // Support for single or multiple schemas in arrays
    additionalProperties?: JSONSchemaProperty; // To handle cases like objects with dynamic keys
};