import React from 'react';
import hou, { dictionary } from '../types/Houdini';
import { ParmFactory } from './ParmFactory'; // Reuse the view controller for nested templates
import ChevronRight from '../assets/chevron-right.svg';
import ChevronDown from '../assets/chevron-down.svg';

export interface FolderParmProps {
  template: hou.FolderParmTemplate;
  data: dictionary;
  onChange: (formData: dictionary) => void; // Callback for value changes
}

export const FolderParm: React.FC<FolderParmProps> = ({
  template,
  data,
  onChange,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
    const target = event.target as HTMLDetailsElement;
    setIsOpen(target.open);
  };

  // Render based on folder_type
  if (template.folder_type === 'Tabs') {
    return (
      <div
        className={`folder-parm tabs ${
          template.runtime_data.isActive ? 'active' : ''
        }`}
      >
        <div className="folder-content">
          {template.parm_templates.map((parmTemplate, index) => (
            <div key={template.name + index} className="parm-item">
              <ParmFactory
                data={data}
                parmTemplate={parmTemplate}
                onChange={onChange}
              />
            </div>
          ))}
        </div>
      </div>
    );
  } else if (template.folder_type === 'Collapsible') {
    return (
      <details
        className={`folder-parm collapsible`}
        open={isOpen}
        onToggle={handleToggle}
      >
        <summary className="cursor-pointer align-center justify-start gap-4">
          {isOpen ? (
            <img width="16" height="16" src={ChevronDown} alt="chevron down" />
          ) : (
            <img
              width="16"
              height="16"
              src={ChevronRight}
              alt="chevron right"
            />
          )}
          {template.label}
        </summary>
        <div className="folder-content">
          {template.parm_templates.map((parmTemplate, index) => (
            <div key={template.name + index} className="parm-item">
              <ParmFactory
                data={data}
                parmTemplate={parmTemplate}
                onChange={onChange}
              />
            </div>
          ))}
        </div>
      </details>
    );
  }

  // Default rendering if folder_type is not specifically handled
  return (
    <div
      className={`folder-parm default ${
        template.runtime_data.isActive ? 'active' : ''
      }`}
    >
      <div className="folder-content">
        {template.parm_templates.map((parmTemplate, index) => (
          <div key={template.name + index} className="parm-item">
            <ParmFactory
              data={data}
              parmTemplate={parmTemplate}
              onChange={onChange}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FolderParm;
