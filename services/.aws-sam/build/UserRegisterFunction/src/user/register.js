const User = require("../../layers/nodejs/models/User");
const cookieToken = require("../../layers/nodejs/utils/cookieToken");
const setUp = require("../../layers/nodejs/index");
const middleware = require("../../layers/nodejs/middlewares/user");

setUp();

exports.PostItemHandler = async (event) => {
  let response = {};

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

  try {
    const { firstName, lastName, email, password, isAgent } = JSON.parse(
      event.body
    );

    if (!firstName || !lastName || !email || !password) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
          "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
          "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
        },
        body: JSON.stringify({
          message: "Name, email, and password are required.",
        }),
      };
    }

    // Check if user is already registered
    const userExists = await User.query("email").eq(email).exec();

    middleware.register(firstName, lastName, email, password, isAgent);

    if (userExists.length !== 0) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
          "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
          "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
        },
        body: JSON.stringify({
          message: "User already registered!",
        }),
      };
    }

    // Create and save new user
    const user = new User({
      firstName: firstName,
      lastName: lastName,
      name: firstName + " " + lastName,
      email: email,
      passwordHash: password,
      isAgent: isAgent,
    });

    await user.hashPassword();
    await user.save(); // Save the user instance to DynamoDB

    const token = await user.getJwtToken(); // Generate JWT token after saving

    // Generate JWT token and set it in the response
    response = cookieToken(user, token);
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
