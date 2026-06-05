const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync");
const bookingController = require("../controller/bookings");
const { isLoggedIn } = require("../middleware");

router.post("/", isLoggedIn, wrapAsync(bookingController.createBooking));

router.get("/", isLoggedIn, wrapAsync(bookingController.index));

router.delete(
  "/:bookingId",
  isLoggedIn,
  wrapAsync(bookingController.deleteBooking)
);

module.exports = router;
