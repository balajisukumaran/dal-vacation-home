const User = require("../../layers/nodejs/models/User");
const Question = require("../../layers/nodejs/models/Question");
const cookieToken = require("../../layers/nodejs/utils/cookieToken");
const connectWithDB = require("../../layers/nodejs/config/db");
const axios = require("axios");

connectWithDB();

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
    const { email, token } = JSON.parse(event.body);

    // check for presence of email and password
    if (!email || !token) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
          "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
          "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
        },
        body: JSON.stringify({
          message: "Email and password are required!",
        }),
      };
    }

    // Check if user is already registered
    const userExists = await User.query("email").eq(email).exec();
    const allQuestion = await Question.scan().exec();

    if (userExists.length === 0) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
          "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
          "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
        },
        body: JSON.stringify({
          message: "User does not exist!",
        }),
      };
    }

    const user = userExists[0];

    const res = await axios.post(
      "https://588cr4cfe7.execute-api.us-east-1.amazonaws.com/userDetails/Login-SNS",
      {
        email: user.email,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    console.log("POST request successful:", res.data);

    // if everything is fine we will send the token
    response = cookieToken(user, token, allQuestion);
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
