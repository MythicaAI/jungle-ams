import { useEffect, useState, useCallback } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  DialogContent,
  DialogTitle,
  Modal,
  ModalClose,
  ModalDialog,
  Stack,
  Typography,
} from "@mui/joy";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import SceneViewer from "@components/BabylonViewer/SceneViewer";
import SceneControls from "@components/BabylonViewer/SceneControls";
import GeneratorSelector from "@components/BabylonViewer/GeneratorSelector";
import { useSceneStore } from "scenetalk";
import { SceneTalkConnector } from "scenetalk";
import { useWindowSize } from "@hooks/useWindowSize";
import { useNavigate, useParams } from "react-router-dom";
import { useGetAssetByVersion, useGetJobDefinition } from "@queries/packages";
import { LucideChevronLeft, LucideChevronRight } from "lucide-react";
import { StatusBar } from "@components/StatusBar";
import { DefaultParmFactory, ParmFactoryProps, ParmFactoryProvider } from "houdini-ui";

export const PackageScene: React.FC = () => {
  const { asset_id, version_id, job_def_id } = useParams();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(true);
  const { currentWidth } = useWindowSize();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidepanelOpen, setIsSidepanelOpen] = useState(true); // New state for panel visibility
  const isMobileSize = currentWidth <= 700;

  // Get state and actions from the store
  const {
    selectedJobDef,
  } = useSceneStore();

  const navigate = useNavigate();
  
  const { data: jobDefinitions } =
    useGetJobDefinition(asset_id as string, (version_id as string)?.split("."));

  const { data: assetVersion } =
    useGetAssetByVersion(asset_id as string, version_id as string);


  useEffect(() => {
    if (!isMobileSize && isModalOpen) {
      setIsModalOpen(false);
    }
  }, [currentWidth, isMobileSize]);

  useEffect(() => {
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (selectedJobDef) {
      navigate(
        `/package-view/${asset_id}/versions/${version_id}/jobs/${selectedJobDef.job_def_id}`, 
        { replace: true }
      );
    }
  }, [selectedJobDef, navigate, asset_id, version_id, isLoading]);

  const FilteredParmFactory: React.FC<ParmFactoryProps> = useCallback((props) => {
    props.parmTemplate.is_hidden = selectedJobDef?.params_schema.hidden?.[props.parmTemplate.name] || false;
    return (
      <div 
        style={{
          display: (selectedJobDef?.params_schema.hidden?.[props.parmTemplate.name] ? 'none' : 'block'),
        }}>
        <DefaultParmFactory
          {
            ...props
          }
        />
      </div>
    );
  },[selectedJobDef?.params_schema.hidden])
  

  if (isLoading || !assetVersion) {
    return <CircularProgress />;
  }

  return (
    <>
      {/* Main container */}
      <Box 
        sx={{ 
          width: "100%", 
          mb: "12px", 
          display: "flex",
          flexWrap: "nowrap",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 2
        }}
      >
        {/* Title area */}
        {!isMobileSize ? (
          <Stack direction="row" alignItems="center" gap="12px" sx={{ flexShrink: 0 }}>
            <Typography level="h2">{assetVersion?.name}</Typography>
            <Chip
              key={assetVersion?.version.join(".")}
              variant="soft"
              color="primary"
              size="lg"
              sx={{ borderRadius: "xl" }}
            >
              {assetVersion?.version.join(".")}
            </Chip>
          </Stack>
        ) : (
          <Box sx={{ flexShrink: 0 }} />
        )}
        
        {/* Controls section */}
        <Box sx={{ 
          display: "flex", 
          flexWrap: "wrap",
          gap: 2,
          justifyContent: "center",
          flexGrow: 1,
          alignItems: "center"
        }}>
          <GeneratorSelector 
            assetVersion={assetVersion}
            jobDefinitions={jobDefinitions}
            initialJobDefId={job_def_id}
          />
        </Box>
        
        {/* Back button area */}
        <Button
          variant="outlined"
          color="neutral"
          startDecorator={<LucideChevronLeft height="20px" width="20px" />}
          sx={{ 
            pl: "10px",
            flexShrink: 0
          }}
          onClick={() => {
            navigate(`/package-view/${asset_id}/versions/${version_id}`);
          }}
        >
          {!isMobileSize ? "Back to Package view" : "Back"}
        </Button>
      </Box>
      
      <Box
        ref={(el: HTMLElement) => {
          if (el) {
            const topPosition = el.getBoundingClientRect().top;
            const viewportHeight = document.documentElement.clientHeight;
            const availableHeight = viewportHeight - topPosition - 40;
            // Apply the height directly or store in a state variable
            el.style.height = `${availableHeight}px`;
          }
        }}
        sx={{ display: "flex", position: "relative", padding: 0, margin: 0 }}
      >
        <Helmet>
          <title>Mythica • {t("common.sceneViewer")}</title>
        </Helmet>

        {!isMobileSize ? (
          <>
            {/* Toggle button for sidepanel */}
            <Button
              color="neutral"
              variant="soft"
              sx={{
                position: "absolute",
                left: isSidepanelOpen ? "395px" : "5px",
                top: "5px",
                zIndex: 10,
                minWidth: "32px",
                width: "32px",
                height: "32px",
                padding: 0,
              }}
              onClick={() => setIsSidepanelOpen(!isSidepanelOpen)}
            >
              {isSidepanelOpen ? 
                <LucideChevronLeft height="20px" width="20px" /> : 
                <LucideChevronRight height="20px" width="20px" />
              }
            </Button>
            
            {/* Floating sidepanel */}
            <Box
              sx={{
                left: isSidepanelOpen ? "0" : "-390px",
                width: isSidepanelOpen ? "390px" : "0px",
                top: 0,
                bottom: 0,
                height: "100%", 
                zIndex: 5,
                transition: "none",
                backgroundColor: "background.surface",
                boxShadow: isSidepanelOpen ? "md" : "none",
                borderRight: isSidepanelOpen ? "1px solid" : "none",
                borderColor: "divider",
                visibility: isSidepanelOpen ? "visible" : "hidden",
                overflow: "auto", // Enable scrollbar when needed
                display: "flex",
                flexDirection: "column",
              }}
            >
              {selectedJobDef ? 
                <ParmFactoryProvider value={FilteredParmFactory as React.FC<ParmFactoryProps>}>              
                  <SceneControls 
                    style={{width:390}} 
                    assetVersion={assetVersion}
                    jobDefinition={selectedJobDef} />
                </ParmFactoryProvider>
              : 
                <Box sx={{ width: 390,padding: "20px" }}>
                  <Typography level="h4" fontSize="medium">
                    Select a Generator to continue
                  </Typography>
                </Box>
              } 
            </Box>
          </>
        ) : (
          <Button
            color="neutral"
            sx={{
              position: "absolute",
              left: 5,
              top: 5,
              zIndex: 1,
            }}
            onClick={() => setIsModalOpen(true)}
          >
            Open Controls
          </Button>
        )}
        {isModalOpen && (
          <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            <ModalDialog layout="fullscreen">
              <ModalClose />
              <DialogTitle>Controls</DialogTitle>
              <DialogContent>
              {selectedJobDef ?
                <ParmFactoryProvider value={FilteredParmFactory as React.FC<ParmFactoryProps>}>              
                  <SceneControls 
                    style={{width:currentWidth - 40}} 
                    assetVersion={assetVersion}
                    jobDefinition={selectedJobDef} />
                </ParmFactoryProvider>
              : 
                <Box sx={{ width: currentWidth - 40,padding: "20px" }}> 
                  <Typography level="h4" fontSize="medium">
                    Select a Generator to continue
                  </Typography>
                </Box>
              } 
              </DialogContent>
            </ModalDialog>
          </Modal>
        )}
        <SceneTalkConnector />
        <SceneViewer packageName={assetVersion?.name as string} />
        <StatusBar />
      </Box>
    </>
  )
};
