import React from 'react';
import hou from '../../types/Houdini';
import FloatParm from './FloatParm';
import FolderParm from './FolderParm';
import FolderSetParm from './FolderSetParm';
import IntParm from './IntParm';
import LabelParm from './LabelParm';
import MenuParm from './MenuParm';
import RampParm from './RampParm';
import SeparatorParm from './SeparatorParm';
import StringParm from './StringParm';
import ToggleParm from './ToggleParm';



import { dictionary } from '../../types/Automation';

export const parmView = (parmModel: hou.ParmTemplate, onChange:((formData: dictionary) => void)): React.ReactNode => {
    // Dispatch based on template type or other properties
    
    switch (parmModel.type) {
        case hou.parmTemplateType.Folder:
            return <FolderParm key={parmModel.id} onChange={onChange} template={parmModel as hou.FolderParmTemplate} />;
        case hou.parmTemplateType.FolderSet:
            return <FolderSetParm key={parmModel.id} onChange={onChange} template={parmModel as hou.FolderSetParmTemplate} />;
        case hou.parmTemplateType.String:
            return <StringParm key={parmModel.id} onChange={onChange} template={parmModel as hou.StringParmTemplate} />;        
        case hou.parmTemplateType.Float:
            return <FloatParm key={parmModel.id} onChange={onChange} template={parmModel as hou.FloatParmTemplate} />;        
        case hou.parmTemplateType.Int:
            return <IntParm key={parmModel.id} onChange={onChange} template={parmModel as hou.IntParmTemplate} />;        
        case hou.parmTemplateType.Toggle:
            return <ToggleParm key={parmModel.id} onChange={onChange} template={parmModel as hou.ToggleParmTemplate} />;        
        case hou.parmTemplateType.Separator:
            return <SeparatorParm key={parmModel.id} template={parmModel as hou.SeparatorParmTemplate} />;
        case hou.parmTemplateType.Label:
            return <LabelParm key={parmModel.id} template={parmModel as hou.LabelParmTemplate} />;
        case hou.parmTemplateType.Menu:
            return <MenuParm key={parmModel.id} onChange={onChange} template={parmModel as hou.MenuParmTemplate} />;
        case hou.parmTemplateType.Ramp:
            return <RampParm key={parmModel.id} onChange={onChange} template={parmModel as hou.RampParmTemplate} />;        
        default:
            return <div key={parmModel.id} >Not Implemented: {parmModel.type}</div>
    }

};


