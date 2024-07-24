const User = require("../../layers/nodejs/models/User");
const { v4: uuidv4 } = require("uuid");
const axios = require("axios");
const connectWithDB = require("../../layers/nodejs/config/db");

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
    const { name, email, isAgent, questionId, answerHash, cipherCode } =
      JSON.parse(event.body);

    if (
      !name ||
      !email ||
      !isAgent ||
      !questionId ||
      !answerHash ||
      !cipherCode
    ) {
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
      userId: uuidv4(),
      name: name,
      email: email,
      isAgent: isAgent,
      questionId: questionId,
      answerHash: answerHash,
      cipherCode: cipherCode,
    });

    await user.save(); // Save the user instance to DynamoDB

    try {
      // await user.save(); // Save the user instance to DynamoDB
      console.log("User saved successfully.");

      const response = await axios.post(
        "https://aymnjk1za7.execute-api.us-east-1.amazonaws.com/Prod/registration-SNS",
        {
          email: user.email,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      console.log("POST request successful:", response.data);
    } catch (error) {
      console.error("Error during user save or POST request:", error);
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
        "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
        "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        success: true,
        user,
      }),
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
};
