import { hou, ParmGroup, dictionary } from 'houdini-ui';
import { Box } from "@mui/joy";
import {
  extractValidationErrors,
  translateError,
} from "@services/backendCommon";
import { useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useStatusStore } from "@store/statusStore";
import LitegraphViewer from "@components/LitegraphViewer";
import { useGetFile } from "@queries/files";
import { useRunAutomation } from '@queries/automation';
import { HDAInterfaceResponse } from 'types/apiTypes';
import Cookies from "universal-cookie";
import { v4 } from 'uuid';
interface FileViewProps {
  file_id?: string;
}

const cookies = new Cookies();


export const FileView = (props: FileViewProps) => {
  const { addError, addWarning } = useStatusStore();
  const { data: file, isLoading, error } = useGetFile(props?.file_id);
  const [parmTemplateGroup, setParmTemplateGroup] =useState<hou.ParmTemplateGroup>();
  const isHDA = file?.content_type === 'application/hda';


  const { data: autoResp, isLoading: isAutomationLoading, error: automationError } = useRunAutomation({
    correlation: v4(),
    channel: 'houdini',
    path: '/mythica/hda',
    auth_token: cookies.get("auth_token"),
    data: { hdas: [file] }
  }, isHDA);

  const hdaInterface = autoResp as HDAInterfaceResponse;
  useEffect(() => {
    if (hdaInterface) {
      const strPt = hdaInterface.result?.node_types[0].code || '';
      const getParmTemplateGroup = eval(strPt);
      const ptg = getParmTemplateGroup(hou) as hou.ParmTemplateGroup;
      setParmTemplateGroup(ptg);
      ptg.draw();
    }
  }, [hdaInterface]);


  const handleError = (err: any ) => {
    addError(translateError(err));
    extractValidationErrors(err).forEach((msg) => addWarning(msg));
  };

  useEffect(() => {
    if (error) {
      handleError(error);
    }
  }, [error]);

  useEffect(() => {
    if (automationError) {
      handleError(automationError);
    }
  }, [automationError]);

  const [inputData, setInputData] = useState<dictionary>({})
  ;
  const handleParmChange = useCallback(
    (formData: dictionary) => {
      setInputData((prev) => ({ ...prev, ...formData }));
    },
    [setInputData]
  );

  const fileHeader = file ? (
    <Box>
      {file.file_id} {file.name} {file.size} {file.content_type}
    </Box>
  ) : (
    ""
  );


  const specialFileView = file ? (
    <Box style={{ height: "100%", width: "100%" }}>
      {file?.name && /^.*\.litegraph\.json$/.test(file.name) ? (
        <>
          <h2>Network: {file.name}</h2>
          <LitegraphViewer url={file.url} />
        </>
      ) : file.content_type === 'application/hda' && parmTemplateGroup ? (

        <ParmGroup
          data={inputData}
          group={parmTemplateGroup}
          onChange={handleParmChange}
          onFileUpload={() => ""}
        />

      ) : <></>
      }

    </Box>
  ) : (
    <Box>{fileHeader}</Box>
  );

  const filePending = <Box>Loading</Box>;

  return <div>{isLoading || isAutomationLoading ? filePending : specialFileView}</div>;
};

export const FileViewWrapper: React.FC = () => {
  const { file_id } = useParams();
  return <FileView file_id={file_id} />;
};

export default FileViewWrapper;
