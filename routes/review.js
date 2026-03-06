const express = require("express");
const router = express.Router({ mergeParams: true });

const wrapAsync = require("../utils/wrapAsync");

// ✅ correct path based on YOUR folder name
const reviewController = require("../controller/reviews");

const { isLoggedIn, isReviewAuthor } = require("../middleware");


// ➕ CREATE REVIEW
router.post(
  "/",
  isLoggedIn,
  wrapAsync(reviewController.createReview)
);


// ❌ DELETE REVIEW (ONLY AUTHOR)
router.delete(
  "/:reviewId",
  isLoggedIn,
  isReviewAuthor,
  wrapAsync(reviewController.deleteReview)
);

module.exports = router;