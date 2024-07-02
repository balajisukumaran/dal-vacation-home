const User = require("../../layers/nodejs/models/User");
const middlewares = require("../../layers/nodejs/middlewares/user");
const cookieToken = require("../../layers/nodejs/utils/cookieToken");
const setUp = require("../../layers/nodejs/index");

setUp();

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
    const userId = loggedInUser.id;
    const { firstName, lastName, email, picture } = JSON.parse(event.body);

    const users = await User.query("email").eq(email).exec();
    const user = users[0];

    if (user) {
      if (picture) {
        user.picture = picture;
      }
      if (firstName && firstName !== "") {
        user.firstName = firstName;
      }
      if (lastName && lastName !== "") {
        user.lastName = lastName;
      }
      await user.save();

      const token = await user.getJwtToken(); // Generate JWT token after saving

      // if everything is fine we will send the token
      response = cookieToken(user, token);
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
          message: "User not found or not authorized",
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
