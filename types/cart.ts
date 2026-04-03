export interface CartItem {
  cart_id: string;
  cart_item_id: string;
  product_id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface AddToCartDTO {
  userId: string;
  product_id: string;
  quantity: number;
}

export interface UpdateCartDTO {
  userId: string;
  cartId: string;
  product_id: string;
  quantity: number;
}

export interface DeleteCartDTO {
  userId: string;
  cartId: string;
  product_id: string;
}
