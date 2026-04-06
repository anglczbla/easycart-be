import fs from "fs";
import {
  getCached,
  KEYS,
  removeCached,
  setCached,
  TTL,
} from "../cache/userCache";
import { cloudinary } from "../config/cloudinary";
import { dbEcommerce } from "../config/db";
import { Review } from "../types/review";

const getReviewById = async (prodId: string): Promise<Review[]> => {
  const cached = await getCached(KEYS.reviewById(prodId));
  if (cached) return cached;

  const getReview = await dbEcommerce.many(
    `SELECT 
      r.id,
      r.product_id,
      r.comment,
      r.rating,
      r.image,
      u.username,
      p.name AS product_name
     FROM reviews r
     JOIN users u ON r.user_id = u.id
     JOIN products p ON r.product_id = p.id
     WHERE r.product_id = $1`,
    [prodId],
  );

  if (!getReview) return [];

  const result = getReview.map((r: Review) => ({
    id: r.id,
    user_id: r.user_id,
    rating: r.rating,
    product_id: r.product_id,
    comment: r.comment,
    username: r.username,
    product_name: r.product_name,
    image: r.image,
  }));

  await setCached(KEYS.reviewById(prodId), result, TTL.reviewById);
  return result;
};

const createReview = async ({
  comment,
  rating,
  user_id,
  product_id,
  imageFile,
}: {
  comment: string;
  rating: number;
  user_id: string;
  product_id: string;
  imageFile: Express.Multer.File | null;
}): Promise<Review> => {
  if (!comment) throw new Error("comment is required");

  let image = null;
  if (imageFile) {
    const result = await cloudinary.uploader.upload(imageFile.path, {
      folder: "easycart/reviews",
    });
    fs.unlinkSync(imageFile.path);
    image = result.secure_url;
  }

  const newReview = await dbEcommerce.one(
    `INSERT INTO reviews (user_id, product_id, comment, rating, image)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [user_id, product_id, comment, rating, image],
  );

  removeCached(KEYS.reviewById(product_id));
  return newReview;
};

const deleteReview = async ({
  id,
  prodId,
  userId,
}: {
  id: string;
  prodId: string;
  userId: string;
}) => {
  const review = await dbEcommerce.oneOrNone(
    "DELETE FROM reviews WHERE id = $1  AND user_id = $2 RETURNING *",
    [id, userId],
  );

  if (review) {
    removeCached(KEYS.reviewById(prodId));
  }

  return review;
};

const updateReview = async ({
  comment,
  rating,
  id,
  imageFile,
}: {
  comment: string;
  rating: number;
  id: string;
  imageFile: Express.Multer.File | null;
}): Promise<Review> => {
  const existing = await dbEcommerce.oneOrNone(
    "SELECT image, product_id FROM reviews WHERE id = $1",
    [id],
  );

  if (!existing) throw new Error("review not found");

  let image = existing.image ?? null;
  if (imageFile) {
    const result = await cloudinary.uploader.upload(imageFile.path, {
      folder: "easycart/reviews",
    });
    fs.unlinkSync(imageFile.path);
    image = result.secure_url;
  }

  const updatedReview = await dbEcommerce.one(
    `UPDATE reviews SET comment = $1, rating = $2, image = $3 
     WHERE id = $4 RETURNING *`,
    [comment, rating, image, id],
  );

  removeCached(KEYS.reviewById(existing.product_id));
  return updatedReview;
};

export default {
  getReviewById,
  createReview,
  deleteReview,
  updateReview,
};
