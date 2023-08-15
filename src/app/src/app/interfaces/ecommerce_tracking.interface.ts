export interface IEcommerceTracking {
  // PREDEFINED FIELDS
  index: number;
  item_brand: string;
  currency: string;
  price: number;
  item_variant: string;
  quantity: number;
  item_id: string;
  item_category: string;
  item_category2: string;
  item_category3: string;
  item_category4: string;
  item_list_name: string;
  item_name: string;
  // CUSTOM FIELDS
  product_id: string;
  product_code: string;
  product_project_code: string;
  product_delivery_plan: string;
  product_cost_calculator: string; // yes | no
  search_term: string;
  product_gift: string; // yes | no
  product_box_size: number;
  giving: string; // yes | no
  estimated_delivery_date: number; // 21092023
}
