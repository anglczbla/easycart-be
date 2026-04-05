export interface Review {
  id: string;
  user_id: string;
  comment: string;
  username: string;
  product_id: string;
  product_name: string;
  rating: number;
  image: string | null;
}
