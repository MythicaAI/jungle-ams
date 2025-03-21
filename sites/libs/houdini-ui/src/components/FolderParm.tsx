import React from 'react';
import hou, { dictionary } from '../types/Houdini';
import { ParmFactory } from './ParmFactory'; // Reuse the view controller for nested templates
import { LucideChevronDown, LucideChevronRight } from 'lucide-react';

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
            <LucideChevronDown size={16} />
          ) : (
            <LucideChevronRight size={16} />
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
