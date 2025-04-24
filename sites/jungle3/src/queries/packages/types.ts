import { dictionary } from 'houdini-ui';

export type JobDefinition = {
  description: string;
  job_def_id: string;
  job_type: string;
  name: string;
  owner_id: string;
  params_schema: {
    params: {
      [key: string]: {
        category_label: null | string;
        constant: boolean;
        default: null | number | string | string[];
        label: string;
        param_type: string;
        min?: number;
        max?: number;
        values?: {
          name: string;
          label: string;
        }[];
      };
    };
    params_v2: dictionary[];
  };
  source: {
    asset_id: string;
    entry_point: string;
    file_id: string;
    major: number;
    minor: number;
    patch: number;
  };
};

export type JobDetails = {
  job_def_id: string;
  created: string;
  completed: string;
  results: [
    {
      created_in: string;
      result_data: {
        [key: string]: any;
        item_type: string;
      };
      job_result_id: string;
    },
  ];
  job_id: string;
};
