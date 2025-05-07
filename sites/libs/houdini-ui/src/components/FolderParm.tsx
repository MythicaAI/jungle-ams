import React from 'react';
import hou, { dictionary } from '../types/Houdini';
import { ParmFactoryContext } from './ParmFactory'; // Reuse the view controller for nested templates
import ChevronRight from '../assets/chevron-right.svg';
import ChevronDown from '../assets/chevron-down.svg';
import Cross from '../assets/cross.svg';
import Plus from '../assets/plus.svg';
import Minus from '../assets/minus.svg';
import Insert from '../assets/insert.svg';

export interface FolderParmProps {
  template: hou.FolderParmTemplate;
  data: dictionary;
  onChange: (formData: dictionary) => void; // Callback for value changes
  onFileUpload?: (formData: Record<string,File>, callback:(file_id:string)=>void) => void;
  multiBlocks?: number[]; // Multiblocks for this folder
  setMultiBlocks?: React.Dispatch<React.SetStateAction<number[]>>; // Setter for multibocks
  multiFolderIndex?: number; // Index of the multi folder
  useSlidersOnMobile?: boolean;
}

export const FolderParm: React.FC<FolderParmProps> = (folderParm) => {
  const ParmFactory = React.useContext(ParmFactoryContext);

  const {
    template,
    data,
    onChange,
    onFileUpload,
    setMultiBlocks,
    multiBlocks,
    multiFolderIndex,
    useSlidersOnMobile,
  } = folderParm;
  const [isOpen, setIsOpen] = React.useState(false);
  const [forceRerender, setForceRerender] = React.useState(false);

  const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
    const target = event.target as HTMLDetailsElement;
    setIsOpen(target.open);
  };

  const handleAddMultiBlock = () => {
    if (setMultiBlocks && multiBlocks) {
      setMultiBlocks([...multiBlocks, multiBlocks.length]);
    }
  };

  const handleRemoveMultiBlock = (index: number) => {
    if (setMultiBlocks && multiBlocks) {
      const updatedBlocks = multiBlocks.filter((_, i) => i !== index);
      setMultiBlocks(updatedBlocks);

      const updatedValues: typeof data = { ...data };
      const blockNameTemplate = template.parm_templates[0].name;

      const removedBlockName = blockNameTemplate.replace(/#/, `${index}`);
      updatedValues[removedBlockName] = null;

      for (let i = index; i < multiBlocks.length - 1; i++) {
        const currentBlockName = blockNameTemplate.replace(/#/, `${i}`);
        const nextBlockName = blockNameTemplate.replace(/#/, `${i + 1}`);

        updatedValues[currentBlockName] = updatedValues[nextBlockName];
      }

      const lastBlockName = blockNameTemplate.replace(
        /#/,
        `${multiBlocks.length - 1}`
      );
      updatedValues[lastBlockName] = null;

      onChange(updatedValues);
      setTimeout(() => {
        setForceRerender((prev) => !prev);
      }, 100);
    }
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
                onFileUpload={onFileUpload}
                useSlidersOnMobile={useSlidersOnMobile}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }
  if (template.folder_type === 'Collapsible') {
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
                useSlidersOnMobile={useSlidersOnMobile}
              />
            </div>
          ))}
        </div>
      </details>
    );
  }

  {
    /* TODO break down to separate component */
  }
  if (
    template.folder_type === 'MultiparmBlock' ||
    template.folder_type === 'ScrollingMultiparmBlock'
  ) {
    return (
      <div>
        <div className="align-center gap-8" style={{ margin: '4px 0 8px' }}>
          <span className="multiblock-counter">{multiBlocks?.length}</span>
          <div className="multiblock-counter-button">
            <span
              className="align-center"
              onClick={handleAddMultiBlock}
              style={{ paddingRight: '9px' }}
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
                if (setMultiBlocks && multiBlocks) {
                  if (multiBlocks.length > 0) {
                    const updatedBlocks = multiBlocks.slice(0, -1);
                    setMultiBlocks(updatedBlocks);

                    const updatedValues = { ...data };
                    const blockNameTemplate = template.parm_templates[0].name;

                    const lastBlockName = blockNameTemplate.replace(
                      /#/,
                      `${multiBlocks.length - 1}`
                    );
                    updatedValues[lastBlockName] = null;

                    onChange(updatedValues);
                  }
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
              if (setMultiBlocks) {
                setMultiBlocks(() => {
                  const newTemplates = Array.from(
                    { length: template.default_value ?? 0 },
                    (_, i) => i
                  );

                  return newTemplates;
                });
              }
            }}
          >
            Clear
          </span>
        </div>

        {/* TODO break down to separate component */}
        <div className="folder-content" key={`${forceRerender}`}>
          {multiBlocks &&
            multiBlocks?.map((_, index) => {
              const temlpateName = template.parm_templates[0].name.replace(
                /#/,
                `${index}`
              );
              return (
                <div
                  key={`${template.name}-${index}-${multiBlocks.length}`}
                  className="parm-item align-center"
                >
                  <div
                    className="align-center gap-4  multiblock-counter-button"
                    style={{ marginRight: '18px', cursor: 'default' }}
                  >
                    <button
                      className="align-center justify-center"
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: 0,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        handleRemoveMultiBlock(index);
                      }}
                    >
                      <img width="14px" height="14px" src={Cross} alt="cross" />
                    </button>
                    <div
                      style={{
                        height: '22px',
                        width: '1px',
                        background: '#ccc',
                        position: 'absolute',
                      }}
                    />
                    <button
                      className="align-center"
                      style={{
                        background: 'none',
                        border: 'none',
                        padding: '0 0 0 6px',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        if (setMultiBlocks && multiBlocks) {
                          const newBlockIndex = index;

                          const updatedBlocks = [
                            ...multiBlocks.slice(0, newBlockIndex),
                            multiBlocks[newBlockIndex],
                            ...multiBlocks.slice(newBlockIndex),
                          ];

                          setMultiBlocks(updatedBlocks);

                          const updatedValues = { ...data };
                          const blockNameTemplate =
                            template.parm_templates[0].name;

                          for (
                            let i = updatedBlocks.length - 1;
                            i > newBlockIndex;
                            i--
                          ) {
                            const currentBlockName = blockNameTemplate.replace(
                              /#/,
                              `${i - 1}`
                            );
                            const newBlockName = blockNameTemplate.replace(
                              /#/,
                              `${i}`
                            );

                            updatedValues[newBlockName] =
                              updatedValues[currentBlockName];
                          }

                          const newBlockName = blockNameTemplate.replace(
                            /#/,
                            `${newBlockIndex}`
                          );
                          updatedValues[newBlockName] = Array.isArray(
                            template.parm_templates[0]?.default_value
                          )
                            ? [...(template.parm_templates[0]?.default_value ?? [])]
                            : template.parm_templates[0]?.default_value ?? null;

                          onChange(updatedValues);
                          setTimeout(() => {
                            setForceRerender((prev) => !prev);
                          }, 100);
                        }
                      }}
                    >
                      <img
                        width="16px"
                        height="16px"
                        src={Insert}
                        alt="insert"
                      />
                    </button>
                  </div>
                  <div className="folder-content">
                    {template.parm_templates.map((parmTemplate, parmIndex) => {
                      return (
                        <div key={`${template.name}-${index}-${parmIndex}`} className="parm-item">
                          <ParmFactory
                            data={data}
                            parmTemplate={parmTemplate}
                            onChange={onChange}
                            onFileUpload={onFileUpload}
                            useSlidersOnMobile={useSlidersOnMobile}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  }

  if (template.folder_type === 'TabbedMultiparmBlock') {
    return (
      <div
        className={`folder-parm default ${
          template.runtime_data.isActive ? 'active' : ''
        }`}
      >
        <div className="folder-content">
          {template.parm_templates.map((parmTemplate, index) => {
            const name = parmTemplate.name.replace(/#/, `${multiFolderIndex}`);
            return (
              <div key={template.name + index} className="parm-item">
                <ParmFactory
                  data={data}
                  parmTemplate={{
                    ...parmTemplate,
                    name,
                    default_value: data[name] || null,
                  } as hou.ParmTemplate}
                  onChange={onChange}
                  onFileUpload={onFileUpload}
                  useSlidersOnMobile={useSlidersOnMobile}
                />
              </div>
            );
          })}
        </div>
      </div>
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
              useSlidersOnMobile={useSlidersOnMobile}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FolderParm;
