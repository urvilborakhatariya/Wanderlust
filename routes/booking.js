const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, validateBooking } = require("../middleware.js");
const bookingController = require("../controllers/booking.js");

// Post Booking Route
router.post("/", isLoggedIn, validateBooking, wrapAsync(bookingController.createBooking));

module.exports = router;
