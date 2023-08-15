export interface ICGProductMapTo {
  _masterBox: string;
  img: string;
  name: string;
  farmer: ICGProductFarmer;
  price: number;
  selectedQuantity: number;
}

export interface ICGProductFarmer {
  name: string;
  country: string;
}
