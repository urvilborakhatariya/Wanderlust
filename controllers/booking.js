const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");

module.exports.createBooking = async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("bookings");
    
    // Check for overlap
    const newStart = new Date(req.body.booking.startDate);
    const newEnd = new Date(req.body.booking.endDate);
    
    const isOverlapping = listing.bookings.some(booking => {
        const existingStart = new Date(booking.startDate);
        const existingEnd = new Date(booking.endDate);
        // Overlap condition: start1 < end2 && start2 < end1
        return newStart < existingEnd && existingStart < newEnd;
    });

    if (isOverlapping) {
        req.flash("error", "The selected dates overlap with an existing booking. Please choose different dates.");
        return res.redirect(`/listings/${id}`);
    }

    let newBooking = new Booking(req.body.booking);
    newBooking.author = req.user._id;
    newBooking.listing = listing._id;

    listing.bookings.push(newBooking);

    await newBooking.save();
    await listing.save();

    req.flash("success", "Booking Successful!");
    res.redirect(`/listings/${listing._id}`);
};
