import React from 'react';
import hou from '../types/Houdini';

export interface LabelParmProps {
    template: hou.LabelParmTemplate;
}

export const LabelParm: React.FC<LabelParmProps> = ({ template }) => {
    const { label, column_labels = [] } = template;

    return (
        <div className="label-parm">
            <div className="label-text">{label}</div>
            {column_labels.length > 0 && (
                <div className="column-labels">
                    {column_labels.map((colLabel, index) => (
                        <span key={index} className="column-label">{colLabel}</span>
                    ))}
                </div>
            )}
        </div>
    );
};

export default LabelParm;
