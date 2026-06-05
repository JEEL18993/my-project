const Listing = require("../models/listing");

// 📌 INDEX: Fetch all listings (Now with Search!)
module.exports.index = async (req, res) => {
    // Grab the search query from the URL (e.g., ?q=Goa)
    let searchQuery = req.query.q;
    let selectedCategory = req.query.category;

    const categoryFilters = {
        trending: ["luxury", "villa", "resort", "palace", "grand", "retreat", "penthouse"],
        rooms: ["room", "hotel", "inn", "apartment", "loft", "residency", "cottage"],
        cities: ["city", "downtown", "urban", "tokyo", "mumbai", "new york", "boston", "miami", "ahmedabad"],
        mountains: ["mountain", "cabin", "chalet", "hill", "snow", "aspen", "banff", "manali", "shimla"],
        castles: ["castle", "palace", "heritage", "historic"],
        pools: ["pool", "villa", "resort", "lagoon", "tropical"],
        camping: ["camp", "camping", "tent", "desert"],
        farms: ["farm", "garden", "cottage", "rustic"],
        arctic: ["snow", "ski", "arctic", "chalet", "shimla"],
        domes: ["dome", "domes", "igloo", "treehouse", "unique", "retreat"],
        boats: ["boat", "island", "lake", "lagoon", "riverside", "beach"],
    };

    const queryConditions = [];

    if (searchQuery) {
        queryConditions.push({
            $or: [
                { location: { $regex: searchQuery, $options: "i" } },
                { country: { $regex: searchQuery, $options: "i" } },
                { title: { $regex: searchQuery, $options: "i" } },
                { description: { $regex: searchQuery, $options: "i" } },
            ]
        });
    }

    if (selectedCategory && categoryFilters[selectedCategory]) {
        const categoryRegex = categoryFilters[selectedCategory].join("|");
        queryConditions.push({
            $or: [
                { location: { $regex: categoryRegex, $options: "i" } },
                { country: { $regex: categoryRegex, $options: "i" } },
                { title: { $regex: categoryRegex, $options: "i" } },
                { description: { $regex: categoryRegex, $options: "i" } },
            ]
        });
    }

    const filterQuery = queryConditions.length > 0 ? { $and: queryConditions } : {};
    const allListings = await Listing.find(filterQuery);

    if (allListings.length === 0 && (searchQuery || selectedCategory)) {
        req.flash("error", "We couldn't find any listings for that filter.");
        return res.redirect("/listings");
    }

    res.render("listings/index", { allListings, selectedCategory });
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

    if (req.files && req.files["listing[image]"]) {
        const coverImage = req.files["listing[image]"][0];
        newListing.image = {
            url: coverImage.path,
            filename: coverImage.filename,
        };
    }

    if (req.files && req.files["listing[images]"]) {
        newListing.images = req.files["listing[images]"].map((file) => ({
            url: file.path,
            filename: file.filename,
        }));

        if (!newListing.image || !newListing.image.url) {
            newListing.image = newListing.images[0];
        }
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

    if (req.files && req.files["listing[image]"]) {
        const coverImage = req.files["listing[image]"][0];
        listing.image = {
            url: coverImage.path,
            filename: coverImage.filename,
        };
    }

    if (req.files && req.files["listing[images]"]) {
        const newImages = req.files["listing[images]"].map((file) => ({
            url: file.path,
            filename: file.filename,
        }));
        listing.images = [...(listing.images || []), ...newImages];
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
