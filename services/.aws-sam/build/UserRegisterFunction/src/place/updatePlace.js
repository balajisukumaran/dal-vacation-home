const Place = require("../../layers/nodejs/models/Place");
const middlewares = require("../../layers/nodejs/middlewares/user");
const connectWithDB = require("../../layers/nodejs/config/db");

connectWithDB();

exports.PutItemHandler = async (event) => {
  let response = {};

  if (event.httpMethod !== "PUT") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
        "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
        "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
      },
      body: JSON.stringify({
        message: `Method not allowed. PUT method required, you tried: ${event.httpMethod}.`,
      }),
    };
  }

  console.info("Received event:", event);

  const loggedIn = await middlewares.checkLoggedIn(event);
  response = loggedIn[0];

  if (response) return response;

  const loggedInUser = loggedIn[1];

  try {
    const userId = loggedInUser.userId;
    const {
      placeId,
      title,
      address,
      addedPhotos,
      description,
      perks,
      roomType,
      extraInfo,
      maxGuests,
      price,
    } = JSON.parse(event.body);

    const places = await Place.query("placeId").eq(placeId).exec();
    const place = places[0];

    if (place && userId === place.ownerId.toString()) {
      place.title = title;
      place.address = address;
      place.photos = addedPhotos;
      place.description = description;
      place.perks = perks;
      place.roomType = roomType;
      place.extraInfo = extraInfo;
      place.maxGuests = maxGuests;
      place.price = price;

      await place.save();

      response = {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
          "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
          "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
        },
        body: JSON.stringify({
          message: "Place updated!",
        }),
      };
    } else {
      response = {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
          "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
          "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
        },
        body: JSON.stringify({
          message: "Place not found or not authorized",
        }),
      };
    }
  } catch (err) {
    console.error("Error:", err);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
        "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
        "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
      },
      body: JSON.stringify({
        message: "Internal server error",
        error: err.message,
      }),
    };
  }

  // Log response for CloudWatch
  console.info(
    `Response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );

  return response;
};
