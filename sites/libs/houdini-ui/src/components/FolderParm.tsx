import React from 'react';
import hou, { dictionary } from '../types/Houdini';
import { ParmFactory } from './ParmFactory'; // Reuse the view controller for nested templates
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
  multiBlocks?: number[]; // Templates for this folder
  setMultiBlocks?: React.Dispatch<React.SetStateAction<number[]>>; // Setter for templates
}

export const FolderParm: React.FC<FolderParmProps> = ({
  template,
  data,
  onChange,
  setMultiBlocks,
  multiBlocks,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleToggle = (event: React.SyntheticEvent<HTMLDetailsElement>) => {
    const target = event.target as HTMLDetailsElement;
    setIsOpen(target.open);
  };

  const handleAddTemplate = () => {
    if (setMultiBlocks && multiBlocks) {
      setMultiBlocks([...multiBlocks, multiBlocks.length]);
    }
  };

  const handleRemoveTemplate = (index: number) => {
    if (setMultiBlocks && multiBlocks) {
      setMultiBlocks(multiBlocks.filter((_, i) => i !== index));
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
              />
            </div>
          ))}
        </div>
      </details>
    );
  }

  if (
    template.folder_type === 'MultiparmBlock' ||
    template.folder_type === 'ScrollingMultiparmBlock' ||
    template.folder_type === 'TabbedMultiparmBlock'
  ) {
    return (
      <div>
        <div className="align-center gap-8" style={{ margin: '4px 0 8px' }}>
          <span className="multiblock-counter">{multiBlocks?.length}</span>
          <div className="multiblock-counter-button">
            <span
              className="align-center"
              onClick={handleAddTemplate}
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
                  setMultiBlocks(
                    multiBlocks.length > 1
                      ? multiBlocks.slice(0, -1)
                      : multiBlocks
                  );
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
        <div className="folder-content">
          {multiBlocks &&
            multiBlocks?.map((_, index) => (
              <div
                key={template.name + index}
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
                      handleRemoveTemplate(index);
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
                        setMultiBlocks([
                          ...multiBlocks.slice(0, index),
                          multiBlocks.length,
                          ...multiBlocks.slice(index),
                        ]);
                      }
                    }}
                  >
                    <img width="16px" height="16px" src={Insert} alt="insert" />
                  </button>
                </div>
                <ParmFactory
                  data={data}
                  //@ts-ignore
                  parmTemplate={{
                    ...template.parm_templates[0],
                    name: template.parm_templates[0].name.replace(
                      /#/,
                      `${index}`
                    ),
                  }}
                  onChange={onChange}
                />
              </div>
            ))}
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
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default FolderParm;
