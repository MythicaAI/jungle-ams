import React from 'react';
import hou, { dictionary } from '../types/Houdini';
import { ParmFactory } from './ParmFactory';

export interface ParmGroupProps {
  group: hou.ParmTemplateGroup;
  data: dictionary;
  onChange: (formData: dictionary) => void; // Callback for value changes
  onFileUpload?: (formData: Record<string,File>, callback:(file_id:string)=>void) => void;
  useSlidersOnMobile?: boolean;
}

export const ParmGroup: React.FC<ParmGroupProps> = ({
  group,
  data,
  onChange,
  onFileUpload,
  useSlidersOnMobile = true,
}) => {
  return (
    <div className="parm-group nodrag">
      {/* Render each ParmTemplate in the group */}
      {group.parm_templates.map((template) => (
        <ParmFactory
          key={template.id.toString()}
          data={data}
          parmTemplate={template}
          onFileUpload={onFileUpload}
          onChange={onChange}
          useSlidersOnMobile={useSlidersOnMobile}
        />
      ))}
    </div>
  );
};

export default ParmGroup;
