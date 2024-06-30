const setUp = require("../../layers/nodejs/index");
const middlewares = require("../../layers/nodejs/middlewares/user");

setUp();

exports.PostItemHandler = async (event) => {
  let response = {};

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: {
        "Access-Control-Allow-Origin": process.env.CLIENT_URL,
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
    const res = await middlewares.upload(event);

    // Log response for CloudWatch
    console.info(
      `Response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
    );

    return res;
  } catch (err) {
    console.error("Error:", err);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": process.env.CLIENT_URL,
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
