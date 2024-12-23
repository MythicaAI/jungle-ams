import React from 'react';
import hou from '../../../types/Houdini';
import { ParmFactory } from './ParmFactory';
import { dictionary } from '../../../types/Automation';
export interface ParmGroupProps {
    group: hou.ParmTemplateGroup;
    data: dictionary; 
    onChange: (formData: dictionary) => void; // Callback for value changes
}

const ParmGroup: React.FC<ParmGroupProps> = ({ group, data, onChange }) => {

    return (
        <div className="parm-group nodrag">
            {/* Render each ParmTemplate in the group */}
            {group.parm_templates.map((template) => (
                <ParmFactory key={template.id} data={data} parmTemplate={template} onChange={onChange} />
            ))}
        </div>
    );
};

export default ParmGroup;
