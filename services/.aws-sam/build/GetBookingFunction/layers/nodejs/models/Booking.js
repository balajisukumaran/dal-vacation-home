const dynamoose = require("dynamoose");
const User = require("./User");
const Place = require("./Place");
const { v4: uuidv4 } = require("uuid");

const bookingSchema = new dynamoose.Schema({
  id: {
    type: String,
    hashKey: true,
    default: uuidv4,
  },
  user: {
    type: String,
    required: true,
    index: {
      global: true,
      name: "OwnerIndex",
    },
  },
  place: {
    type: String,
    required: true,
    index: {
      global: true,
      name: "PlaceIndex",
    },
  },
  checkIn: {
    type: Date,
    required: true,
  },
  checkOut: {
    type: Date,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const Booking = dynamoose.model("Booking", bookingSchema);

module.exports = Booking;
