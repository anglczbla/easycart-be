import type { Request, Response } from "express";
import reviewService from "../services/reviewService";

const getReviewByProduct = async (req: Request, res: Response) => {
  try {
    const prodId = req.params.prodId as string;

    const review = await reviewService.getReviewById(prodId);
    return res.status(200).json({
      message: "success fetch review",
      data: review,
    });
  } catch (err) {
    const error = err as Error;
    console.error("getAllProducts error:", error);
    res.status(500).json({ error: error.message });
  }
};

const createReview = async (req: Request, res: Response) => {
  try {
    const { comment, rating } = req.body;
    const user_id = req.userId;
    const product_id = req.params.prodId as string;

    if (!user_id) {
      return res.status(401).json({ message: "unauthorized" });
    }

    if (!rating) {
      return res.status(400).json({ message: "rating is required" });
    }

    const newReview = await reviewService.createReview({
      comment,
      rating,
      user_id,
      product_id,
      imageFile: req.file ?? null,
    });

    return res.status(201).json({
      message: "success add review",
      data: newReview,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const updateReview = async (req: Request, res: Response) => {
  try {
    const { comment, rating } = req.body;
    const id = req.params.id as string;
    const imageFile = req.file ?? null;

    const newReview = await reviewService.updateReview({
      id,
      comment,
      rating,
      imageFile,
    });

    return res.status(200).json({
      message: "success update review",
      data: newReview,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

const deleteReview = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const product_id = req.params.prodId as string;

    const deletingReview = await reviewService.deleteReview(id, product_id);
    return res.status(200).json({
      message: "success delete review",
      data: deletingReview,
    });
  } catch (err) {
    const error = err as Error;
    res.status(500).json({ error: error.message });
  }
};

export default {
  getReviewByProduct,
  createReview,
  updateReview,
  deleteReview,
};
