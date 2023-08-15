export interface ResponseDTO<T> {
  data: ResponseListDTO<T> | T;
}

export interface ResponseListDTO<T> {
  list: T[];
  count?: number;
  metadata?: any;
}
