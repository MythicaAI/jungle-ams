export type Tag = {
  name: string;
  tag_id: string;
  owner_id: string;
  created: string;
  contents: {
    thumbnails: {
      file_id: string;
      file_name: string;
      content_hash: string;
      size: number;
    }[];
    blurb: string;
  } | null;
  page_priority: number | null;
};
