const User = require("../../layers/nodejs/models/User");
const cookieToken = require("../../layers/nodejs/utils/cookieToken");
const setUp = require("../../layers/nodejs/index");

setUp();

exports.PostItemHandler = async (event) => {
  let response = {};

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
      },
      body: JSON.stringify({
        message: `Method not allowed. POST method required, you tried: ${event.httpMethod}.`,
      }),
    };
  }

  console.info("Received event:", event);

  try {
    const { email, password } = JSON.parse(event.body);

    // check for presence of email and password
    if (!email || !password) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "*",
        },
        body: JSON.stringify({
          message: "Email and password are required!",
        }),
      };
    }

    // Check if user is already registered
    const userExists = await User.query("email").eq(email).exec();

    if (userExists.length === 0) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "*",
        },
        body: JSON.stringify({
          message: "User does not exist!",
        }),
      };
    }

    const user = userExists[0];

    // match the password
    const isPasswordCorrect = await user.isValidatedPassword(password);

    if (!isPasswordCorrect) {
      return {
        statusCode: 401,
        headers: {
          "Access-Control-Allow-Origin": "http://localhost:5173",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Allow-Methods": "*",
        },
        body: JSON.stringify({
          message: "Email or password is incorrect!",
        }),
      };
    }

    const token = await user.getJwtToken(); // Generate JWT token after saving

    // if everything is fine we will send the token
    response = cookieToken(user, token);
  } catch (err) {
    console.error("Error:", err);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "http://localhost:5173",
        "Access-Control-Allow-Headers": "*",
        "Access-Control-Allow-Methods": "*",
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
