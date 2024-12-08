import React from 'react';
import hou from '../../types/Houdini';
import { ParmFactory } from './ParmFactory';
import { dictionary } from '../../types/Automation';
import { v4 as uuid } from 'uuid';
export interface ParmGroupProps {
    group: hou.ParmTemplateGroup;
    onChange: (formData: dictionary) => void; // Callback for value changes
}

const ParmGroup: React.FC<ParmGroupProps> = ({ group, onChange }) => {

    return (
        <div className="parm-group nodrag">
            {/* Render each ParmTemplate in the group */}
            {group.parm_templates.map((template) => (
                <ParmFactory key={uuid()} parmTemplate={template} onChange={onChange} />
            ))}
        </div>
    );
};

export default ParmGroup;
