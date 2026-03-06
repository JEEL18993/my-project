const Listing = require("../models/listing");

// 📌 INDEX: Fetch all listings (Now with Search!)
module.exports.index = async (req, res) => {
    // Grab the search query from the URL (e.g., ?q=Goa)
    let searchQuery = req.query.q;

    if (searchQuery) {
        // If there is a search, filter the database using Regex (case-insensitive)
        const allListings = await Listing.find({
            $or: [
                { location: { $regex: searchQuery, $options: "i" } },
                { country: { $regex: searchQuery, $options: "i" } },
                { title: { $regex: searchQuery, $options: "i" } }
            ]
        });

        // If the search finds nothing, flash an error and reload all listings
        if (allListings.length === 0) {
            req.flash("error", "We couldn't find any listings for that destination.");
            return res.redirect("/listings");
        }

        // Render the page with only the searched listings
        res.render("listings/index", { allListings });
    } else {
        // If there is no search (user just clicked "Explore"), show everything
        const allListings = await Listing.find({});
        res.render("listings/index", { allListings });
    }
};

// 📌 NEW FORM: Render the create page
module.exports.renderNewForm = (req, res) => {
    res.render("listings/new");
};

// 📌 SHOW: Display a specific listing with its map
module.exports.showListing = async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id)
        .populate("owner")
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        });

    if (!listing) {
        req.flash("error", "Listing not found");
        return res.redirect("/listings");
    }
    res.render("listings/show", { listing });
};

// 📌 CREATE: Handle geocoding and saving to DB
module.exports.createListing = async (req, res) => {
    const apiKey = 'eIOfAmUriGHfSPBMGcpG';
    const locationText = req.body.listing.location;

    // 1. Fetch Coordinates from MapTiler Geocoding API
    const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(locationText)}.json?key=${apiKey}`
    );
    const geoData = await response.json();

    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // 2. Logic to handle Geocoding results
    if (geoData.features && geoData.features.length > 0) {
        newListing.geometry = geoData.features[0].geometry;
    } else {
        // Fallback to New Delhi coordinates if not found
        newListing.geometry = { type: "Point", coordinates: [77.2090, 28.6139] };
    }

    if (req.file) {
        newListing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    await newListing.save();
    req.flash("success", "Listing created successfully");
    res.redirect(`/listings/${newListing._id}`);
};

// 📌 EDIT FORM: Render edit page
module.exports.renderEditForm = async (req, res) => {
    const listing = await Listing.findById(req.params.id);
    if (!listing) {
        req.flash("error", "Listing you requested does not exist!");
        return res.redirect("/listings");
    }
    res.render("listings/edit", { listing });
};

// 📌 UPDATE: Update details AND coordinates if location changes
module.exports.updatelisting = async (req, res) => {
    let { id } = req.params;
    const apiKey = 'eIOfAmUriGHfSPBMGcpG';
    const locationText = req.body.listing.location;

    // 1. Re-fetch coordinates
    const response = await fetch(
        `https://api.maptiler.com/geocoding/${encodeURIComponent(locationText)}.json?key=${apiKey}`
    );
    const geoData = await response.json();

    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    // 2. Update geometry
    if (geoData.features && geoData.features.length > 0) {
        listing.geometry = geoData.features[0].geometry;
    }

    if (req.file) {
        listing.image = {
            url: req.file.path,
            filename: req.file.filename,
        };
    }

    await listing.save();
    req.flash("success", "Listing updated");
    res.redirect(`/listings/${id}`);
};

// 📌 DELETE: Remove listing
module.exports.deleteListing = async (req, res) => {
    const { id } = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash("success", "Listing deleted");
    res.redirect("/listings");
};