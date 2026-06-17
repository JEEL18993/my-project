# Wanderlust

Wanderlust is a full-stack hotel and travel listing web application built with Node.js, Express, MongoDB, EJS, Bootstrap, Passport authentication, Cloudinary image uploads, and MapTiler maps.

## Project Updates

Recent major features added to the project:

- Added a booking system with check-in date, check-out date, guests, and total price calculation.
- Added a demo payment flow with card, UPI, net banking, and pay at property options.
- Added a My Bookings page where users can view and cancel their bookings.
- Added real category filtering for listing filters such as Rooms, Mountains, Castles, Pools, Camping, Farms, Arctic, Domes, and Boats.
- Added multiple image/gallery support for listings.
- Improved the listing detail page with a better gallery layout, stay details, booking section, reviews, and map.
- Added an admin panel for managing listings, bookings, reviews, and users.
- Added single-admin protection so only one admin account can access the admin panel.
- Added new hotel/listing data with images, rent, location, and map coordinates.

## Main Features

- User signup, login, and logout
- Create, edit, and delete listings
- Upload listing images with Cloudinary
- Search listings by destination, country, or title
- Category-based listing filters
- Reviews and ratings
- Interactive maps for listing locations
- Booking and demo payment system
- Admin dashboard for project management

## Tech Stack

- Node.js
- Express.js
- MongoDB and Mongoose
- EJS and EJS Mate
- Bootstrap
- Passport.js
- Cloudinary
- MapTiler

## Admin Access

The admin panel is available at:

```text
/admin
```

Only the configured admin account can access this panel.
