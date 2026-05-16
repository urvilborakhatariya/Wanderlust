const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn, isBookingAuthor, validateBooking } = require("../middleware.js");
const userBookingController = require("../controllers/userBooking.js");

router.route("/")
    .get(isLoggedIn, wrapAsync(userBookingController.index));

router.route("/:id/edit")
    .get(isLoggedIn, isBookingAuthor, wrapAsync(userBookingController.renderEditForm));

router.route("/:id")
    .put(isLoggedIn, isBookingAuthor, validateBooking, wrapAsync(userBookingController.updateBooking))
    .delete(isLoggedIn, isBookingAuthor, wrapAsync(userBookingController.deleteBooking));

module.exports = router;
