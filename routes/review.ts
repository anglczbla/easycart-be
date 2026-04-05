import express from "express";
import reviewController from "../controllers/reviewController";
import { authUser } from "../middleware/auth";
import {
  validateCreateReview,
  validateUpdateReview,
} from "../middleware/validation/reviewValidation";
const router = express.Router();

router.get("/:prodId", authUser, reviewController.getReviewByProduct);
router.post("/", authUser, validateCreateReview, reviewController.createReview);
router.put(
  "/:id",
  authUser,
  validateUpdateReview,
  reviewController.updateReview,
);
router.delete("/:id", authUser, reviewController.deleteReview);

export default router;
