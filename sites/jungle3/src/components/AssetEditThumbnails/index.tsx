import React, { useEffect, useState } from "react";
import { ReactSortable } from "react-sortablejs";
import {
  FormControl,
  FormLabel,
  IconButton,
  Sheet,
  Typography,
} from "@mui/joy";
import { LucidePlusCircle } from "lucide-react";
import { api } from "../../services/api";
import { useAssetVersionStore } from "../../stores/assetVersionStore.ts";
import { Thumbnail } from "./Thumbnail.tsx";
import {
  AssetVersionContentMap,
  DownloadInfoResponse,
} from "../../types/apiTypes.ts";

interface AssetEditFileListProps {
  title: string;
  category: string;
  fileTypeFilters: string[];
  openUploadList: (category: string, fileFilters: string[]) => void;
  removeFile: (file_id: string) => void;
  files: AssetVersionContentMap;
}

import "./styles.css";

export const AssetEditThumbnails: React.FC<AssetEditFileListProps> = (
  props,
) => {
  const [thumbnailUrls, setThumbnailUrls] = useState<DownloadInfoResponse[]>(
    [],
  );
  const [draggingFinished, setDraggingFinished] = useState(false);
  const { addThumbnails, removeThumbnails, thumbnails } =
    useAssetVersionStore();

  useEffect(() => {
    const fetchThumbnails = async () => {
      const details = await Promise.all(
        Object.values(thumbnails).map(async (file) => {
          const res = await api.get<DownloadInfoResponse>({
            path: `/download/info/${file.file_id}`,
          });
          return res;
        }),
      );
      setThumbnailUrls(details);
    };

    fetchThumbnails();
  }, [thumbnails]);

  useEffect(() => {
    if (thumbnailUrls.length >= 2 && draggingFinished) {
      removeThumbnails();

      addThumbnails(
        thumbnailUrls.map((item) => ({ ...item, file_name: item.name })),
      );
      setDraggingFinished(false);
    }
  }, [draggingFinished]);

  // Handle drag and drop
  const onDragDropEnds = () => {
    setDraggingFinished(true);
  };

  return (
    <FormControl>
      <FormLabel>
        <IconButton
          onClick={(e) => {
            e.preventDefault();
            props.openUploadList(props.category, props.fileTypeFilters);
          }}
        >
          <LucidePlusCircle />
        </IconButton>
        <Typography variant="soft" level="title-md" fontWeight="bold">
          {props.title}
        </Typography>
      </FormLabel>
      <Sheet
        key={props.category}
        variant="outlined"
        sx={{ borderRadius: "sm" }}
      >
        {thumbnailUrls.length > 0 ? (
          <ReactSortable
            //@ts-ignore
            list={thumbnailUrls}
            //@ts-ignore
            setList={setThumbnailUrls}
            ghostClass="dropArea"
            handle=".dragHandle"
            filter=".ignoreDrag"
            preventOnFilter
            className="grid-container"
            onEnd={() => onDragDropEnds()}
          >
            {thumbnailUrls.map((file, idx) => (
              <Thumbnail
                key={file.file_id}
                file={file}
                removeFile={props.removeFile}
                index={idx}
              />
            ))}
          </ReactSortable>
        ) : (
          <Typography fontSize="14px" textAlign="start" p="10px 8px">
            No thumbnails selected
          </Typography>
        )}
      </Sheet>
    </FormControl>
  );
};
