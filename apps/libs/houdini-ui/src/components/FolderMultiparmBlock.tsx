import React, { useEffect, useState } from 'react';
import hou from '../types/Houdini';
import { ParmFactoryContext } from './ParmFactory'; // Reuse the view controller for nested templates
import { FolderParmProps } from './FolderParm';
import Cross from '../assets/cross.svg';
import Plus from '../assets/plus.svg';
import Minus from '../assets/minus.svg';
import Insert from '../assets/insert.svg';

export const FolderMultiparmBlock: React.FC<FolderParmProps> = (folderParm) => {
  const ParmFactory = React.useContext(ParmFactoryContext);

  const {
    template,
    data,
    onChange,
    onFileUpload,
  } = folderParm;
  

  const tagTemplate = () => {
    if (("templateName" in template.tags)) return;
    template.setTags({"templateName": template.name + "#"});
    for (const parmTemplate of template.parm_templates) {
      parmTemplate.setTags({"templateName": parmTemplate.name});
    }
  }
  
  useEffect(() => {
    tagTemplate();
  }, [template]);
  
  const createMultiBlock = (index: number) => {
    tagTemplate();
    const newBlock = template.clone();
    newBlock.name = newBlock.tags["templateName"].replace(/#$/, `${index+1}`);
    for (const parmTemplate of newBlock.parm_templates) {
      parmTemplate.name = parmTemplate.tags["templateName"].replace(/#/, `${index+1}`);
    }

    return newBlock;
  };

  const [multiBlocks, setMultiBlocks] = useState<hou.FolderParmTemplate[]>(() => {
    const templates = []
    for (let i = 0; i < template.default_value; i++) {
      templates.push(createMultiBlock(i));
    }
    return templates;
  });

  const [activeTab, setActiveTab] = useState<number>(0);

  const notifyChangeListeners = (value: number) => {
    const ret: { [key: string]: number } = {};
    ret[template.name] = value;
    onChange?.(ret);
  };
    
  // Handler for input change
  const handleMultiBlockValueChange = (newValue: number, suppress=false) => {
    if (isNaN(newValue) || newValue < 0) newValue = 0;

    
    if (newValue > multiBlocks.length) {
      const dif = newValue - multiBlocks.length;
      const newBlocks = Array.from({ length: dif }, (_, i) => createMultiBlock(i + multiBlocks.length));
      setMultiBlocks((prev)=>{
        return [...prev, ...newBlocks]
      });
    }
    else if (newValue < multiBlocks.length) {
      setMultiBlocks((prev)=>{
        return prev.slice(0, newValue);
      });
    }
    if (!suppress) {
      notifyChangeListeners(newValue);
    }
  };

  const handleAddMultiBlock = () => {
    const length = multiBlocks.length;
    setMultiBlocks((prev) => [...prev, createMultiBlock(prev.length)]);
    notifyChangeListeners(length + 1);
  };

  const handleInsertMultiBlock = (index: number) => {
    setMultiBlocks((prev) => {
      const updated = [...prev];
      const newBlock = createMultiBlock(index);
      updated.splice(index, 0, newBlock);
      const update: { [key: string]: any } = {}
      for (let i = updated.length - 1; index < i; i--) {
        updated[i].name = template.tags["templateName"].replace(/#$/, `${i+1}`);
        for (const parmTemplate of updated[i].parm_templates) {
          const newName = parmTemplate.tags["templateName"].replace(/#/, `${i+1}`);
          if (data[parmTemplate.name]) {
            update[parmTemplate.name] = null;
            update[newName] = data[parmTemplate.name];
          }
          parmTemplate.name = newName
        }
      } 
      update[template.name] = updated.length;
      onChange?.(update);
      return updated;
    });
  };

  const handleRemoveMultiBlock = (index: number) => {
    setMultiBlocks((prev)=>{
      const updated = [...prev];
      const removed = updated.splice(index, 1);
      const update: { [key: string]: any } = {}
      for (const pt of removed[0].parm_templates) {
        update[pt.name] = null;
      }
      for (let i = index; i < updated.length; i++) {
        updated[i].name = updated[i].tags["templateName"].replace(/#$/, `${i+1}`);
        for (const parmTemplate of updated[i].parm_templates) {
          const newName = parmTemplate.tags["templateName"].replace(/#/, `${i+1}`);
          if (data[parmTemplate.name]) {
            update[parmTemplate.name] = null;
            update[newName] = data[parmTemplate.name];
          }
          parmTemplate.name = newName
        }
      }
      update[template.name] = updated.length;
      onChange?.(update);
      return updated;
    });


  };

  const handleClearMultiBlock = () => {
    const update: { [key: string]: any } = {}
      multiBlocks.forEach((multiblock) => {
        multiblock.parm_templates.forEach((parmTemplate) => {
        update[parmTemplate.name] = null;
        
      });
    });
    const templates = []
    for (let i = 0; i < template.default_value; i++) {
      templates.push(createMultiBlock(i));
    }
    setMultiBlocks(templates);
    update[template.name] = null;
    onChange?.(update);
  };
  
  useEffect(() => {
    const myData = data[template.name] as number;
    if (myData && multiBlocks.length !== myData) {
      handleMultiBlockValueChange(myData, true);
    }
    // Reset active tab if it's out of bounds after blocks change
    if (activeTab >= multiBlocks.length && multiBlocks.length > 0) {
      setActiveTab(multiBlocks.length - 1);
    } else if (multiBlocks.length === 0) {
      setActiveTab(0);
    }
  }, [data[template.name], multiBlocks.length]);
 
  return (
    <div>
      <div className="align-center gap-8" style={{ margin: '4px 0 8px' }}>
        <input
          type="number"
          min={0}
          style={{ width: 60, textAlign: 'center', padding: '4px' }}
          value={data[template.name] as number || template.default_value}
          onChange={(e) => handleMultiBlockValueChange(parseInt(e.target.value))}
        />
        <div style={{ display: 'flex' }}>
          <span
            className="align-center"
            onClick={handleAddMultiBlock}
            style={{ border: '1px solid #ccc', padding: '3px' }}
          >
            <img
              width="18px"
              height="18px"
              src={Plus}
              alt="plus icon"
              className="multiblock-icon"
            />
          </span>
          <span
            className="align-center"
            onClick={() => {
              if (multiBlocks?.length) {
                handleRemoveMultiBlock(multiBlocks.length - 1);
              }
            }}
            style={{ border: '1px solid #ccc', padding: '3px' }}
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
          className="align-center"
          style={{ 
            fontWeight: 'bold',
            fontSize: '14px',
            padding: '1px 8px', 
            border: '1px solid #ccc',
            cursor: 'pointer',
          }}
          onClick={handleClearMultiBlock}
        >
          Clear
        </span>
      </div>

      {(
        template.folder_type === hou.folderType.MultiparmBlock ||
        template.folder_type === hou.folderType.ScrollingMultiparmBlock
      ) && (
        <div className="folder-content">
          {multiBlocks &&
            multiBlocks?.map((multiblock, index) => {
              return (
                <div
                  key={`${multiblock.name}-${index}-${multiBlocks.length}`}
                >
                  <div
                    style={{  cursor: 'default', display: 'flex', alignItems: 'center' }}
                  >
                    <button
                      className="align-center"
                      style={{
                        background: 'none',
                        border: '1px solid #ccc',
                        borderRadius: '0',
                        padding: 3,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleRemoveMultiBlock(index)}
                    >
                    <img width="14px" height="14px" src={Cross} alt="cross" />
                    </button>
                    <button
                      className="align-center"
                      style={{
                        background: 'none',
                        border: '1px solid #ccc',
                        borderRadius: '0',
                        padding: 3,
                        cursor: 'pointer',
                      }}
                      onClick={() => handleInsertMultiBlock(index)}
                    >
                      <img
                        width="14px"
                        height="14px"
                        src={Insert}
                        alt="insert"
                      />
                    </button>
                  </div>
                  <div>
                    {multiblock.parm_templates.map((parmTemplate, parmIndex) => {
                      return (
                        <div key={`${parmTemplate.name}-${index}-${parmIndex}`} className="parm-item">
                          <ParmFactory
                            data={data}
                            parmTemplate={parmTemplate}
                            onChange={onChange}
                            onFileUpload={onFileUpload}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
        </div>
      )}
      {template.folder_type === hou.folderType.TabbedMultiparmBlock && (
        <div className="folder-content">
          {multiBlocks.length > 0 && (
            <div className="tab-bar" style={{ 
              display: 'flex', 
              borderBottom: '1px solid #ccc', 
              marginBottom: '10px' 
            }}>
              {multiBlocks.map((_, index) => (
                <div
                  key={`tab-${index}`}
                  className={`tab ${activeTab === index ? 'active-tab' : ''}`}
                  style={{
                    padding: '8px 16px',
                    cursor: 'pointer',
                    backgroundColor: activeTab === index ? '#f0f0f0' : 'transparent',
                    borderTop: '1px solid #ccc',
                    borderLeft: '1px solid #ccc',
                    borderRight: '1px solid #ccc',
                    borderBottom: activeTab === index ? 'none' : '1px solid #ccc',
                    marginBottom: activeTab === index ? '-1px' : '0',
                    position: 'relative',
                    borderRadius: '4px 4px 0 0',
                  }}
                  onClick={() => setActiveTab(index)}
                >
                  {index + 1}
                </div>
              ))}
            </div>
          )}
          
          {multiBlocks.map((multiblock, index) => {
            // Only render the content of the active tab
            if (index !== activeTab) return null;

            return (
              <div
                key={`${multiblock.name}-${index}-${multiBlocks.length}`}
                className="parm-item"
              >
                <div className="folder-content">
                  {multiblock.parm_templates.map((parmTemplate, parmIndex) => {
                    return (
                      <div key={`${parmTemplate.name}-${index}-${parmIndex}`} className="parm-item">
                        <ParmFactory
                          data={data}
                          parmTemplate={parmTemplate}
                          onChange={onChange}
                          onFileUpload={onFileUpload}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


export default FolderMultiparmBlock;
