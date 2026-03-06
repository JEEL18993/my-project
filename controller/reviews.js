const Listing = require("../models/listing");
const Review = require("../models/review");

// ➕ CREATE REVIEW
module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);

  const newReview = new Review(req.body.review);

  // save logged-in user as author
  newReview.author = req.user._id;

  await newReview.save();

  listing.reviews.push(newReview);
  await listing.save();

  req.flash("success", "Review added successfully!");
  res.redirect(`/listings/${listing._id}`);
};

// ❌ DELETE REVIEW
module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;

  await Listing.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });

  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review deleted successfully!");
  res.redirect(`/listings/${id}`);
};