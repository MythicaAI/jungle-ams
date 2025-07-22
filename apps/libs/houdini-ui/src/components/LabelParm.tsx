import React from 'react';
import hou from '../types/Houdini';
import { useWindowSize } from '../util/useWindowSize';

export interface LabelParmProps {
    template: hou.LabelParmTemplate;
}

export const LabelParm: React.FC<LabelParmProps> = ({ template }) => {
    const { column_labels=[],tags= {} } = template;
    const { currentWidth } = useWindowSize();
    const isMobileSize = currentWidth <= 700;
    const isHeading = Object.values(tags).includes('heading');

    return (
        <div className="label-parm"
            title={template.help}
            style={!isMobileSize ? { 
                display: 'flex', 
                gap: '10px', 
                ...isHeading && { borderBottom: '1px solid #ccc' },
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
            } : undefined}>
                {column_labels[0]}
            </label>
            <div className="fields" style={!isMobileSize ? { flex: 1, width: '100%' } : undefined} />
        </div>
    );
};

export default LabelParm;