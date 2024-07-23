const Booking = require("../../layers/nodejs/models/Booking");
const Place = require("../../layers/nodejs/models/Place");
const middlewares = require("../../layers/nodejs/middlewares/user");
const connectWithDB = require("../../layers/nodejs/config/db");

connectWithDB();

exports.GetItemHandler = async (event) => {
  let response = {};

  if (event.httpMethod !== "GET") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
        "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
        "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
      },
      body: JSON.stringify({
        message: `Method not allowed. GET method required, you tried: ${event.httpMethod}.`,
      }),
    };
  }

  console.info("Received event:", event);

  const loggedIn = await middlewares.checkLoggedIn(event);
  response = loggedIn[0];

  if (response) return response;

  const loggedInUser = loggedIn[1];

  try {
    if (!loggedInUser) {
      return {
        statusCode: 401,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
          "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
          "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
        },
        body: JSON.stringify({
          error: "You are not authorized to access this page!",
        }),
      };
    }

    // Fetch bookings for the user
    const bookings = await Booking.query("userId")
      .eq(loggedInUser.userId)
      .exec();

    // Fetch related place data for each booking
    const bookingsWithPlaces = await Promise.all(
      bookings.map(async (booking) => {
        const place = await Place.get(booking.place); // Assume `place` is the place ID in the booking
        return {
          ...booking,
          place,
        };
      })
    );

    response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
        "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
        "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
      },
      body: JSON.stringify({ bookings: bookingsWithPlaces, success: true }),
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
