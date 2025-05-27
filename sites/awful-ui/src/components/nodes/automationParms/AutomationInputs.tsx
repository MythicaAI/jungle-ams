import React, { useState, memo, useCallback, useEffect, useMemo } from 'react';
import { FileParamType, dictionary } from '../../../types/Automation';
import { hou, ParmGroup } from 'houdini-ui'

interface AutomationInputProps {
  inputSchema: dictionary[];
  onChange: (formData: dictionary) => void;
  inputData: dictionary;
  onFileParameterDetected: (fileParams: Record<string, FileParamType>) => void;
}

const AutomationInputs: React.FC<AutomationInputProps> = ({
  inputSchema,
  onChange,
  inputData,
  onFileParameterDetected,
}) => {
  const [formData, setFormData] = useState<dictionary>({});

  // Use useMemo to compute the parameter template group once when inputSchema changes.
  const parmTemplateGroup = useMemo(() => new hou.ParmTemplateGroup(inputSchema), [inputSchema]);

  // Instead of using parseInputSchema to set state every render, use an effect.
  useEffect(() => {
    const inputFileParms = parmTemplateGroup.parm_templates.filter((parm) =>
      parm instanceof hou.FileParmTemplate &&
      parm.param_type === hou.parmTemplateType.File &&
      !parm.name.startsWith("output")
    ) as hou.FileParmTemplate[];

    const fps = inputFileParms.reduce<Record<string, FileParamType>>((acc, parm) => {
      if (Array.isArray(parm.default))
        acc[parm.name] = FileParamType.Array;
      else
        acc[parm.name] = FileParamType.Scalar;
      return acc;
    }, {});

    onFileParameterDetected(fps);
  }, [parmTemplateGroup, onFileParameterDetected]);

  const handleChange = (newData: dictionary) => {
    const updatedData = { ...formData, ...newData };
    setFormData(prev => ({ ...prev, ...newData }));
    onChange(updatedData); // Trigger parent component's onChange
  };

  const handleFileUpload = useCallback(
    (formData: Record<string, File>, callback: (file_id: string) => void) => {
      console.log('AWFUL UNIMPLEMENTED: File upload handler called with formData:', formData);
      callback("Not Implemented");
    },[]
  );

  if (!parmTemplateGroup) {
    return <div>Loading...</div>;
  }
  
  return (
    <>
      <ParmGroup 
        group={parmTemplateGroup}
        data={inputData}
        onChange={handleChange}
        onFileUpload={handleFileUpload}
      />
    </>
  );
};

export default memo(AutomationInputs);
