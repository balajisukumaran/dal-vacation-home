const dynamoose = require("dynamoose");
const { v4: uuidv4 } = require("uuid");

const bookingSchema = new dynamoose.Schema({
  bookingId: {
    type: String,
    hashKey: true,
    default: uuidv4,
  },
  userId: {
    type: String,
    required: true,
    index: {
      global: true,
      name: "UserIndex",
    },
  },
  placeId: {
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
  email: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  numOfGuests: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    required: true,
  },
});

const Booking = dynamoose.model("Booking", bookingSchema);

module.exports = Booking;
