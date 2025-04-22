import React, { useState } from 'react';
import hou, { dictionary } from '../types/Houdini';
import FolderParm from './FolderParm';
import { RadioIndicator } from './RadioIndicator';
import Plus from '../assets/plus.svg';
import Minus from '../assets/minus.svg';

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
  const [multiBlocks, setMultiBlocks] = useState<Record<string, number[]>>(() =>
    template.parm_templates.reduce((acc, folder) => {
      acc[folder.name] = Array.from(
        { length: folder?.default_value || 1 },
        (_, i) => i
      );
      return acc;
    }, {} as Record<string, number[]>)
  );

  const [multiFolders, setMultiFolders] = React.useState<string[] | null>(() =>
    template.parm_templates[0] &&
    template.parm_templates[0].folder_type === 'TabbedMultiparmBlock' &&
    template.parm_templates[0].default_value
      ? Array.from(
          { length: template.parm_templates[0].default_value },
          (_, i) => `${template.parm_templates[0].label}${i + 1}`
        )
      : null
  );

  const [activeFolder, setActiveFolder] = useState<string | null>(
    multiFolders ? multiFolders[0] : template.parm_templates[0].name
  );

  const updateMultiBlocks = (
    folderName: string,
    newTemplates: number[] | ((prevTemplates: number[]) => number[])
  ) => {
    setMultiBlocks((prev) => ({
      ...prev,
      [folderName]:
        typeof newTemplates === 'function'
          ? newTemplates(prev[folderName])
          : newTemplates,
    }));
  };

  const hasCollapsibleChildren = template.parm_templates.some(
    (parm) => parm.folder_type === 'Collapsible'
  );
  const hasSimpleChildren = template.parm_templates.some(
    (parm) => parm.folder_type === 'Simple'
  );
  const hasRadioChildren = template.parm_templates.some(
    (parm) => parm.folder_type === 'RadioButtons'
  );
  const simpleMultiBlockChildren = template.parm_templates.some(
    (parm) =>
      parm.folder_type === 'MultiparmBlock' ||
      parm.folder_type === 'ScrollingMultiparmBlock'
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
      {!hasCollapsibleChildren && !multiFolders && (
        <div className="folder-tabs">
          {template.parm_templates.map(
            (folder: hou.FolderParmTemplate, index) => (
              <div
                key={index}
                className={`folder-tab ${
                  activeFolder === folder.name ? 'active' : ''
                } 
                ${
                  hasSimpleChildren || simpleMultiBlockChildren
                    ? 'simple-folder-tab'
                    : ''
                }
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

      {/* TODO break down to separate component */}
      {multiFolders && (
        <div className="folder-tabs">
          {multiFolders.map((folder, index) => (
            <div
              key={index}
              className={`folder-tab ${activeFolder === folder ? 'active' : ''} 
                ${
                  hasSimpleChildren || simpleMultiBlockChildren
                    ? 'simple-folder-tab'
                    : ''
                }
                ${hasRadioChildren ? 'align-center gap-4' : ''}
                `}
              onClick={() => handleFolderActivation(folder || '')}
            >
              {index + 1}
            </div>
          ))}
          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              color: '#fff',
              marginLeft: '10px',
            }}
          >
            {template.parm_templates[0].label}
            <div className="align-center gap-8" style={{ margin: '0 8px' }}>
              <span className="multiblock-counter">{multiFolders?.length}</span>
              <div className="multiblock-counter-button">
                <span
                  className="align-center"
                  style={{ paddingRight: '9px' }}
                  onClick={() => {
                    if (setMultiFolders && multiFolders && setActiveFolder) {
                      const nextIndex = multiFolders.length + 1;
                      const newFolder = `${template.parm_templates[0].label}${nextIndex}`;

                      setMultiFolders([...multiFolders, newFolder]);
                      setActiveFolder(newFolder);
                    }
                  }}
                >
                  <img
                    width="18px"
                    height="18px"
                    src={Plus}
                    alt="plus icon"
                    className="multiblock-icon"
                  />
                </span>
                <div
                  style={{
                    height: '22px',
                    width: '1px',
                    background: '#ccc',
                    position: 'absolute',
                  }}
                />
                <span
                  className="align-center"
                  onClick={() => {
                    if (
                      setMultiFolders &&
                      setActiveFolder &&
                      multiFolders &&
                      multiFolders.length > 0
                    ) {
                      const updatedFolders = multiFolders.slice(0, -1);
                      setMultiFolders(updatedFolders);

                      const updatedValues = { ...data };
                      const lastFolderIndex = multiFolders.length - 1;
                      const newActiveFolderIndex = multiFolders.length - 2;
                      const blockNameTemplate = template.parm_templates[0].name;

                      setActiveFolder(multiFolders[newActiveFolderIndex]);

                      const lastFolderName = blockNameTemplate.replace(
                        /#/,
                        `${lastFolderIndex}`
                      );
                      updatedValues[lastFolderName] = null;

                      onChange(updatedValues);
                    }
                  }}
                  style={{ paddingLeft: '2px' }}
                >
                  <img
                    className="multiblock-icon"
                    width="18px"
                    height="18px"
                    src={Minus}
                    alt="minus icon"
                  />
                </span>
              </div>
              <span
                className="white underline-text"
                style={{ fontSize: '14px' }}
                onClick={() => {
                  if (setMultiFolders && multiFolders) {
                    const defaultFolders =
                      template.parm_templates[0] &&
                      template.parm_templates[0].folder_type ===
                        'TabbedMultiparmBlock' &&
                      template.parm_templates[0].default_value
                        ? Array.from(
                            {
                              length: template.parm_templates[0].default_value,
                            },
                            (_, i) =>
                              `${template.parm_templates[0].label}${i + 1}`
                          )
                        : null;
                    const defaultFoldersLength = defaultFolders?.length;

                    const foldersToBeCutOff =
                      multiFolders.slice(defaultFoldersLength);

                    const indexesToBeCutOff = getCutOffIndexes(
                      multiFolders,
                      foldersToBeCutOff.length
                    );

                    const updatedValues = { ...data };
                    template.parm_templates.forEach((folder) => {
                      folder.parm_templates.forEach((parm) => {
                        indexesToBeCutOff.forEach((index) => {
                          const blockName = parm.name.replace(/#/, `${index}`);
                          updatedValues[blockName] = null;
                        });
                      });
                    });

                    if (defaultFolders) {
                      setMultiFolders(defaultFolders);
                      setActiveFolder(defaultFolders[0]);
                      onChange(updatedValues);
                    }
                  }
                }}
              >
                Clear
              </span>
            </div>
          </span>
        </div>
      )}

      {multiFolders && (
        <div className="folder-content">
          {multiFolders.map(
            (folder, index) =>
              folder === activeFolder && (
                <div key={index} className={`folder-item active `}>
                  {template.parm_templates.map((folder) => (
                    <FolderParm
                      key={folder.name}
                      data={data}
                      onChange={onChange}
                      template={folder}
                      multiFolderIndex={index}
                    />
                  ))}
                </div>
              )
          )}
        </div>
      )}

      {/* Only render the active folder */}
      {!multiFolders && (
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
                      multiBlocks={multiBlocks[folder.name]}
                      setMultiBlocks={(newBlocks) =>
                        updateMultiBlocks(folder.name, newBlocks)
                      }
                    />
                  </div>
                );
              }
              return null;
            }
          )}
        </div>
      )}
    </div>
  );
};

export default FolderSetParm;

function getCutOffIndexes(arr: string[], n: number): number[] {
  if (n <= 0) return [];
  if (n > arr.length) return Array.from({ length: arr.length }, (_, i) => i);

  const startIndex = arr.length - n;
  return Array.from({ length: n }, (_, i) => startIndex + i);
}
