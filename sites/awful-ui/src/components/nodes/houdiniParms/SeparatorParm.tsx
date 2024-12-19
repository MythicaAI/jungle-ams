import React from 'react';
import hou from '../../../types/Houdini';

export interface SeparatorParmProps {
    template: hou.SeparatorParmTemplate;
}

const SeparatorParm: React.FC<SeparatorParmProps> = () => {
    return <hr className="separator-parm" />;
};

export default SeparatorParm;
