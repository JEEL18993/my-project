const Booking = require("../models/booking");
const Listing = require("../models/listing");

module.exports.createBooking = async (req, res) => {
  const { id } = req.params;
  const { checkIn, checkOut, guests, paymentMethod } = req.body.booking;

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found");
    return res.redirect("/listings");
  }

  if (listing.owner && listing.owner.equals(req.user._id)) {
    req.flash("error", "You cannot book your own listing");
    return res.redirect(`/listings/${id}`);
  }

  if (!listing.price || listing.price < 0) {
    req.flash("error", "This listing cannot be booked right now");
    return res.redirect(`/listings/${id}`);
  }

  const checkInDate = new Date(checkIn);
  const checkOutDate = new Date(checkOut);
  const guestCount = Number(guests);

  if (
    Number.isNaN(checkInDate.getTime()) ||
    Number.isNaN(checkOutDate.getTime()) ||
    checkOutDate <= checkInDate ||
    !Number.isInteger(guestCount) ||
    guestCount < 1
  ) {
    req.flash("error", "Please enter valid booking details");
    return res.redirect(`/listings/${id}`);
  }

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const nights = Math.ceil((checkOutDate - checkInDate) / millisecondsPerDay);
  const totalPrice = nights * listing.price;
  const selectedPaymentMethod = paymentMethod || "card";
  const paymentStatus =
    selectedPaymentMethod === "cash" ? "Pay At Property" : "Demo Paid";

  await Booking.create({
    listing: listing._id,
    user: req.user._id,
    checkIn: checkInDate,
    checkOut: checkOutDate,
    guests: guestCount,
    totalPrice,
    paymentMethod: selectedPaymentMethod,
    paymentStatus,
    demoTransactionId: `DEMO-${Date.now()}`,
  });

  req.flash("success", "Booking created successfully with demo payment!");
  res.redirect("/bookings");
};

module.exports.index = async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .populate("listing")
    .sort({ createdAt: -1 });

  res.render("bookings/index", { bookings });
};

module.exports.deleteBooking = async (req, res) => {
  const { bookingId } = req.params;
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    req.flash("error", "Booking not found");
    return res.redirect("/bookings");
  }

  if (!booking.user.equals(req.user._id)) {
    req.flash("error", "You cannot cancel this booking");
    return res.redirect("/bookings");
  }

  await Booking.findByIdAndDelete(bookingId);
  req.flash("success", "Booking cancelled successfully");
  res.redirect("/bookings");
};
