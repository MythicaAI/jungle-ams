import {AssetVersionResponse} from "../types/apiTypes.ts";

const defaultThumbnailImg = "/houdini.svg";

export const getThumbnailImg = (version: AssetVersionResponse): string => {
  if (!version || !version.contents || !('thumbnails' in version.contents)) {
    return defaultThumbnailImg;
  }
  const thumbnails = version.contents['thumbnails'];
  if (!thumbnails || !thumbnails.length) {
    return defaultThumbnailImg;
  }
  const file_name = thumbnails[0].file_name;
  const content_hash = thumbnails[0].content_hash;
  const extension = file_name.split('.')[1];
  const baseUrl = import.meta.env.VITE_IMAGES_BASE_URL;
  return `${baseUrl}/${content_hash}.${extension}`;
};
