const Booking = require("../../layers/nodejs/models/Booking");
const setUp = require("../../layers/nodejs/index");
const middlewares = require("../../layers/nodejs/middlewares/user");
const { v4: uuidv4 } = require("uuid");

setUp();

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
    const { place, checkIn, checkOut, noOfGuests, name, phone, price } =
      JSON.parse(event.body);

    const booking = new Booking({
      id: uuidv4(), // Explicitly set the ID
      user: userData.id,
      place: place,
      checkIn: new Date(checkIn),
      checkOut: new Date(checkOut),
      numOfGuests: noOfGuests,
      name: name,
      phone: phone,
      price: price,
    });
    await booking.save();

    response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
        "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
        "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
      },
      body: JSON.stringify({ booking }), // Returning booking ID
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
