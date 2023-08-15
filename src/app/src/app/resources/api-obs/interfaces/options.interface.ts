export interface OptionsApi {
  method?: string;
  fileUpload?: boolean;
  loader?: boolean;
  service?: string;
  params?: any;
  queryParams?: any;
  body?: object | string | [];
  token?: string;
  noApi?: boolean;
  api?: string;
  version?: string;
}
