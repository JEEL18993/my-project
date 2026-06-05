const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync");
const adminController = require("../controller/admin");
const { isAdmin } = require("../middleware");

router.use(isAdmin);

router.get("/", wrapAsync(adminController.dashboard));

router.get("/listings", wrapAsync(adminController.listings));
router.delete("/listings/:id", wrapAsync(adminController.deleteListing));

router.get("/bookings", wrapAsync(adminController.bookings));
router.delete("/bookings/:id", wrapAsync(adminController.deleteBooking));

router.get("/reviews", wrapAsync(adminController.reviews));
router.delete("/reviews/:id", wrapAsync(adminController.deleteReview));

router.get("/users", wrapAsync(adminController.users));
router.post("/users/:id/toggle-admin", wrapAsync(adminController.toggleAdmin));
router.delete("/users/:id", wrapAsync(adminController.deleteUser));

module.exports = router;
