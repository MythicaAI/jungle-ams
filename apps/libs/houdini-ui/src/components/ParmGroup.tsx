import React from 'react';
import hou, { dictionary } from '../types/Houdini';
import { ParmFactoryContext } from './ParmFactory';

export interface ParmGroupProps {
  group: hou.ParmTemplateGroup;
  data: dictionary;
  onChange: (formData: dictionary) => void; // Callback for value changes
  onFileUpload?: (formData: Record<string,File>, callback:(file_id:string)=>void) => void;
}

export const ParmGroup: React.FC<ParmGroupProps> = (props) => {
  const ParmFactory = React.useContext(ParmFactoryContext);

  return (
    <div className="parm-group nodrag">
      {/* Render each ParmTemplate in the group */}
      {props.group.parm_templates.map((template) => (
        <ParmFactory
          key={template.id.toString()}
          data={props.data}
          parmTemplate={template}
          onFileUpload={props.onFileUpload}
          onChange={props.onChange}
        />
      ))}
    </div>
  );
};

export default ParmGroup;
