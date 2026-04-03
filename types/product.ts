export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image: string;
}

export interface CreateProductDTO {
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageFile?: Express.Multer.File;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  id: string;
}
