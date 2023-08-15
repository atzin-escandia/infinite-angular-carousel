interface EcommerceCartItems {
  id: string;
  quantity: number;
}

export interface EcommerceCartItem {
  type: string;
  articles: EcommerceCartItems[];
}
