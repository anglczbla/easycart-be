import express from "express";
import reviewController from "../controllers/reviewController";
import { authUser } from "../middleware/auth";
import upload from "../middleware/multer";
import {
  validateCreateReview,
  validateUpdateReview,
} from "../middleware/validation/reviewValidation";
const router = express.Router();

router.get("/:prodId", reviewController.getReviewByProduct);
router.post(
  "/:prodId",
  authUser,
  upload.single("image"),
  validateCreateReview,
  reviewController.createReview,
);
router.put(
  "/:id",
  authUser,
  upload.single("image"),
  validateUpdateReview,
  reviewController.updateReview,
);
router.delete("/:id/:prodId", authUser, reviewController.deleteReview);

export default router;
