const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
  .then(() => {
    console.log("Connected to DB");
    initDB();
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
  await Listing.deleteMany({}); // Clears the database
  initData.data.map((obj) => {
    obj.owner = "69982d4b4a4708117f06a439"; // Assign a default owner ID
  });
  await Listing.insertMany(initData.data); // Inserts unique data from data.js
  console.log("Database was re-initialized with unique images!");
};