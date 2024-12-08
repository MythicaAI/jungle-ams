import React from 'react';
import hou from '../../types/Houdini';
import { ParmFactory } from './ParmFactory'; // Reuse the view controller for nested templates
import { dictionary } from '../../types/Automation';

export interface FolderParmProps {
    template: hou.FolderParmTemplate;
    onChange: (formData: dictionary) => void; // Callback for value changes
}

const FolderParm: React.FC<FolderParmProps> = ({template, onChange}) => {

    // Render based on folder_type
    if (template.folder_type === 'Tabs') {
        return (
            <div className={`folder-parm tabs ${template.runtime_data.isActive ? 'active' : ''}`}>
                <div className="folder-content">
                    {template.parm_templates.map((parmTemplate, index) => (
                        <div key={template.name + index} className="parm-item">
                            <ParmFactory parmTemplate={parmTemplate} onChange={onChange} />
                        </div>
                    ))}
                </div>
            </div>
        );
    } else if (template.folder_type === 'Collapsible') {
        return (
            <details className={`folder-parm collapsible`}>
                <summary>{template.label}</summary>
                <div className="folder-content">
                    {template.parm_templates.map((parmTemplate, index) => (
                        <div key={template.name + index} className="parm-item">
                            <ParmFactory parmTemplate={parmTemplate} onChange={onChange} />
                        </div>
                    ))}
                </div>
            </details>
        );
    }

    // Default rendering if folder_type is not specifically handled
    return (
        <div className={`folder-parm default ${template.runtime_data.isActive ? 'active' : ''}`}>
            <div className="folder-content">
                {template.parm_templates.map((parmTemplate, index) => (
                    <div key={template.name + index} className="parm-item">
                        <ParmFactory parmTemplate={parmTemplate} onChange={onChange} />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default FolderParm;
