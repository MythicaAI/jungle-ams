import React from 'react';
import hou, { dictionary } from '../types/Houdini';
import FolderMultiparmBlock from './FolderMultiparmBlock';
import { ParmFactoryContext } from './ParmFactory'; // Reuse the view controller for nested templates
import ChevronRight from '../assets/chevron-right.svg';
import ChevronDown from '../assets/chevron-down.svg';


export interface FolderParmProps {
  template: hou.FolderParmTemplate;
  data: dictionary;
  onChange: (formData: dictionary) => void; // Callback for value changes
  onFileUpload?: (formData: Record<string,File>, callback:(file_id:string)=>void) => void;
}

export const FolderParm: React.FC<FolderParmProps> = (folderParm) => {
  const ParmFactory = React.useContext(ParmFactoryContext);

  const {
    template,
    data,
    onChange,
    onFileUpload,
  } = folderParm;
  const [isOpen, setIsOpen] = React.useState(false);

  const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
    const target = event.target as HTMLDetailsElement;
    setIsOpen(target.open);
  };

  if (
    template.folder_type === hou.folderType.MultiparmBlock ||
    template.folder_type === hou.folderType.ScrollingMultiparmBlock ||
    template.folder_type === hou.folderType.TabbedMultiparmBlock
  ) {
    return (
      <FolderMultiparmBlock
        {...folderParm}
      />
    );
  }
  
  // Render based on folder_type
  if (template.folder_type === hou.folderType.Tabs) {
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
                onFileUpload={onFileUpload}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (template.folder_type === hou.folderType.Collapsible) {
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
                onFileUpload={onFileUpload}
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
              onFileUpload={onFileUpload}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FolderParm;
