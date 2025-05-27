import React, { useState, useEffect, memo, useCallback } from 'react';
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

  const parseInputSchema = (schema: dictionary[]): hou.ParmTemplateGroup => {
    const ptg = new hou.ParmTemplateGroup(schema);

    const inputFileParms: hou.FileParmTemplate[] = ptg.parm_templates.filter((parm) =>
      parm instanceof hou.FileParmTemplate &&
      parm.param_type === hou.parmTemplateType.File &&
      !parm.name.startsWith("output"),
    ) as hou.FileParmTemplate[];

    const fileParams = inputFileParms.reduce<Record<string, FileParamType>>((acc, parm) => {
      if (Array.isArray(parm.default))
        acc[parm.name] = FileParamType.Array;
      else
        acc[parm.name] = FileParamType.Scalar;
      return acc;
    }, {});

    onFileParameterDetected(fileParams);
    return ptg;
  }

  const [parmTemplateGroup, setParmTemplateGroup] = useState<hou.ParmTemplateGroup>(parseInputSchema(inputSchema));

  useEffect(() => {
    setParmTemplateGroup(parseInputSchema(inputSchema));
  }, [inputSchema, onFileParameterDetected]);

  const handleChange = (newData: dictionary) => {
    const updatedData = { ...formData, ...newData };
    setFormData((prev) => ({
      ...prev,
      ...newData
    }));

    onChange(updatedData); // Trigger parent component's onChange
  };

  const handleFileUpload = useCallback(
    (formData: Record<string,File>, callback: (file_id:string)=>void) => {
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
