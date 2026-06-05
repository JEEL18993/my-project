const Booking = require("../models/booking");
const Listing = require("../models/listing");
const Review = require("../models/review");
const User = require("../models/user");

module.exports.dashboard = async (req, res) => {
  const [listingCount, userCount, reviewCount, bookingCount] = await Promise.all([
    Listing.countDocuments({}),
    User.countDocuments({}),
    Review.countDocuments({}),
    Booking.countDocuments({}),
  ]);

  res.render("admin/dashboard", {
    listingCount,
    userCount,
    reviewCount,
    bookingCount,
  });
};

module.exports.listings = async (req, res) => {
  const listings = await Listing.find({}).populate("owner").sort({ _id: -1 });
  res.render("admin/listings", { listings });
};

module.exports.deleteListing = async (req, res) => {
  const { id } = req.params;
  const listing = await Listing.findById(id);

  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/admin/listings");
  }

  await Review.deleteMany({ _id: { $in: listing.reviews } });
  await Booking.deleteMany({ listing: id });
  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing deleted by admin");
  res.redirect("/admin/listings");
};

module.exports.bookings = async (req, res) => {
  const bookings = await Booking.find({})
    .populate("listing")
    .populate("user")
    .sort({ createdAt: -1 });

  res.render("admin/bookings", { bookings });
};

module.exports.deleteBooking = async (req, res) => {
  await Booking.findByIdAndDelete(req.params.id);
  req.flash("success", "Booking deleted by admin");
  res.redirect("/admin/bookings");
};

module.exports.reviews = async (req, res) => {
  const reviews = await Review.find({}).populate("author").sort({ createdAt: -1 });
  res.render("admin/reviews", { reviews });
};

module.exports.deleteReview = async (req, res) => {
  const { id } = req.params;
  await Listing.updateMany({ reviews: id }, { $pull: { reviews: id } });
  await Review.findByIdAndDelete(id);

  req.flash("success", "Review deleted by admin");
  res.redirect("/admin/reviews");
};

module.exports.users = async (req, res) => {
  const users = await User.find({}).sort({ username: 1 });
  res.render("admin/users", { users });
};

module.exports.toggleAdmin = async (req, res) => {
  const { id } = req.params;

  if (id !== req.user._id.toString()) {
    req.flash("error", "Only one admin account is allowed");
    return res.redirect("/admin/users");
  }

  req.flash("error", "You cannot remove your own admin access");
  res.redirect("/admin/users");
};

module.exports.deleteUser = async (req, res) => {
  const { id } = req.params;

  if (id === req.user._id.toString()) {
    req.flash("error", "You cannot delete your own account from admin panel");
    return res.redirect("/admin/users");
  }

  await Booking.deleteMany({ user: id });
  await Review.deleteMany({ author: id });
  await Listing.deleteMany({ owner: id });
  await User.findByIdAndDelete(id);

  req.flash("success", "User deleted by admin");
  res.redirect("/admin/users");
};
