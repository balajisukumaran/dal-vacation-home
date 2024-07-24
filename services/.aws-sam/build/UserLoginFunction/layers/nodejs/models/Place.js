const dynamoose = require("dynamoose");
const { v4: uuidv4 } = require("uuid");

const placeSchema = new dynamoose.Schema(
  {
    placeId: {
      type: String,
      hashKey: true,
      default: () => uuidv4(), // Ensure the function is called to generate UUID
    },
    ownerId: {
      type: String,
      required: true,
      index: {
        global: true,
        name: "OwnerIndex",
      },
    },
    title: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    photos: {
      type: Array,
      schema: [String],
    },
    description: {
      type: String,
    },
    perks: {
      type: Array,
      schema: [String],
    },
    roomType: {
      type: String,
    },
    extraInfo: {
      type: String,
    },
    maxGuests: {
      type: Number,
    },
    price: {
      type: Number,
    },
  },
  {
    timestamps: true,
  }
);

const Place = dynamoose.model("Place", placeSchema);

module.exports = Place;
