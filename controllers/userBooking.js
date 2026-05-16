const Booking = require("../models/booking.js");
const Listing = require("../models/listing.js");

module.exports.index = async (req, res) => {
    const userBookings = await Booking.find({ author: req.user._id }).populate("listing");
    res.render("bookings/index.ejs", { userBookings });
};

module.exports.renderEditForm = async (req, res) => {
    let { id } = req.params;
    const booking = await Booking.findById(id).populate("listing");
    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings");
    }
    
    // We need to pass the listing's other booked dates to disable them on the calendar
    // We must exclude the current booking's dates from this list so the user can keep their current dates
    const listing = await Listing.findById(booking.listing._id).populate("bookings");
    const otherBookedDates = listing.bookings
        .filter(b => b._id.toString() !== id)
        .map(b => {
            return {
                from: b.startDate.toISOString().split('T')[0],
                to: b.endDate.toISOString().split('T')[0]
            };
        });

    res.render("bookings/edit.ejs", { booking, otherBookedDates });
};

module.exports.updateBooking = async (req, res) => {
    let { id } = req.params;
    let booking = await Booking.findById(id);
    
    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings");
    }

    const listing = await Listing.findById(booking.listing).populate("bookings");
    
    const newStart = new Date(req.body.booking.startDate);
    const newEnd = new Date(req.body.booking.endDate);
    
    // Check for overlap excluding the current booking
    const isOverlapping = listing.bookings.some(b => {
        if (b._id.toString() === id) return false;
        const existingStart = new Date(b.startDate);
        const existingEnd = new Date(b.endDate);
        return newStart < existingEnd && existingStart < newEnd;
    });

    if (isOverlapping) {
        req.flash("error", "The selected dates overlap with an existing booking. Please choose different dates.");
        return res.redirect(`/bookings/${id}/edit`);
    }

    booking.startDate = newStart;
    booking.endDate = newEnd;
    await booking.save();

    req.flash("success", "Booking updated successfully!");
    res.redirect("/bookings");
};

module.exports.deleteBooking = async (req, res) => {
    let { id } = req.params;
    let booking = await Booking.findById(id);
    
    if (!booking) {
        req.flash("error", "Booking not found");
        return res.redirect("/bookings");
    }

    // Remove from Listing's bookings array
    await Listing.findByIdAndUpdate(booking.listing, { $pull: { bookings: id } });
    
    await Booking.findByIdAndDelete(id);
    req.flash("success", "Booking cancelled successfully!");
    res.redirect("/bookings");
};
