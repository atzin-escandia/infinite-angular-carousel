export interface ICGState {
  ngoId: string;
  projects: ICGStateProject[];
}

export interface ICGStateProject {
  id: string;
  quantity: number;
}
