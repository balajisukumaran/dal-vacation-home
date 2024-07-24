const Place = require("../../layers/nodejs/models/Place");
const middlewares = require("../../layers/nodejs/middlewares/user");
const { v4: uuidv4 } = require("uuid");

const connectWithDB = require("../../layers/nodejs/config/db");

connectWithDB();

exports.PostItemHandler = async (event) => {
  let response;

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
        "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
        "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
      },
      body: JSON.stringify({
        message: `Method not allowed. POST method required, you tried: ${event.httpMethod}.`,
      }),
    };
  }

  console.info("Received event:", event);

  const loggedIn = await middlewares.checkLoggedIn(event);
  response = loggedIn[0];

  if (response) return response;

  const loggedInUser = loggedIn[1];

  try {
    const userData = loggedInUser;
    const {
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

    const place = new Place({
      placeId: uuidv4(),
      ownerId: userData.userId,
      title: title,
      address: address,
      photos: addedPhotos,
      description: description,
      perks: perks,
      roomType: roomType,
      extraInfo: extraInfo,
      maxGuests: parseInt(maxGuests),
      price: price,
    });

    await place.save();

    response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
        "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
        "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
      },
      body: JSON.stringify(place),
    };
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
