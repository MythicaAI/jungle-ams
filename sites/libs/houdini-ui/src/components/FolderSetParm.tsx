import React, { useState } from 'react';
import hou, { dictionary } from '../types/Houdini';
import FolderParm from './FolderParm';
import { RadioIndicator } from './RadioIndicator';

export interface FolderSetParmProps {
  template: hou.FolderSetParmTemplate;
  data: dictionary;
  onChange: (formData: dictionary) => void; // Callback for value changes
}

export const FolderSetParm: React.FC<FolderSetParmProps> = ({
  template,
  data,
  onChange,
}) => {
  const [activeFolder, setActiveFolder] = useState<string | null>(
    template.parm_templates[0].name
  );

  const hasCollapsibleChildren = template.parm_templates.some(
    (parm) => parm.folder_type === 'Collapsible'
  );
  const hasSimpleChildren = template.parm_templates.some(
    (parm) => parm.folder_type === 'Simple'
  );
  const hasRadioChildren = template.parm_templates.some(
    (parm) => parm.folder_type === 'RadioButtons'
  );

  const handleFolderActivation = (folderName: string) => {
    setActiveFolder(folderName); // Update local active state
  };

  return (
    <div
      className={`folder-container ${
        hasCollapsibleChildren ? 'collapsible-folder-container' : ''
      }     
        ${hasSimpleChildren ? 'simple-folder-container' : ''}
      `}
    >
      {/* Tab header */}
      {!hasCollapsibleChildren && (
        <div className="folder-tabs">
          {template.parm_templates.map(
            (folder: hou.FolderParmTemplate, index) => (
              <div
                key={index}
                className={`folder-tab ${
                  activeFolder === folder.name ? 'active' : ''
                } 
                ${hasSimpleChildren ? 'simple-folder-tab' : ''}
                ${hasRadioChildren ? 'align-center gap-4' : ''}
                `}
                onClick={() => handleFolderActivation(folder.name || '')}
              >
                {hasRadioChildren && (
                  <RadioIndicator checked={activeFolder === folder.name} />
                )}
                {folder.label}
              </div>
            )
          )}
        </div>
      )}

      {/* Only render the active folder */}
      <div className="folder-content">
        {template.parm_templates.map(
          (folder: hou.FolderParmTemplate, index) => {
            if (hasCollapsibleChildren || folder.name === activeFolder) {
              return (
                <div
                  key={index}
                  className={`folder-item active ${
                    hasCollapsibleChildren ? 'collapsible-folder' : ''
                  }`}
                >
                  <FolderParm
                    data={data}
                    onChange={onChange}
                    template={folder}
                  />
                </div>
              );
            }
            return null;
          }
        )}
      </div>
    </div>
  );
};

export default FolderSetParm;
