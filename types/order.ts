export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  price: number;
  product_name?: string;
  product_image?: string;
}

export interface Order {
  id: string;
  user_id: string;
  total_price: number;
  status: string;
  shipping_address: string;
  image: string;
  created_at?: Date;
  items?: OrderItem[];
  customer_name?: string;
}

export interface CreateOrderDTO {
  userId: string;
  imageFile: Express.Multer.File;
}

export interface UpdateOrderDTO {
  orderId: string;
  status: string;
}
