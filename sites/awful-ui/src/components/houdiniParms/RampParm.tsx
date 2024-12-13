import React from 'react';
import hou from '../../types/Houdini';
import { dictionary } from '../../types/Automation';
import ValueRampParm from './RampParmValue';
import ColorRampParm from './RampParmColor';

interface RampParmProps {
    template: hou.RampParmTemplate;
    data: dictionary;
    onChange?: (formData: dictionary) => void;
}

const RampParm: React.FC<RampParmProps> = ({ template, data, onChange }) => {
    // Decide based on template.ramp_parm_type
    if (template.ramp_parm_type === hou.rampParmType.Color) {
        return <ColorRampParm data={data} template={template} onChange={onChange} />;
    } else {
        return <ValueRampParm data={data} template={template} onChange={onChange} />;
    }
};

export default RampParm;
