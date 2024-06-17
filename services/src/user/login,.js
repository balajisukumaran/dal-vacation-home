const User = require("../../layers/nodejs/models/User");
const cookieToken = require("../../layers/nodejs/utils/cookieToken");
const setUp = require("../../layers/nodejs/index");

setUp();

exports.GetItemHandler = async (event) => {
  let response = {};

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({
        message: `Method not allowed. POST method required, you tried: ${event.httpMethod}.`,
      }),
    };
  }

  console.info("Received event:", event);

  try {
    const { email, password } = req.body;

    // check for presence of email and password
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required!",
      });
    }

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        message: "User does not exist!",
      });
    }

    // match the password
    const isPasswordCorrect = await user.isValidatedPassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Email or password is incorrect!",
      });
    }

    // if everything is fine we will send the token
    cookieToken(user, res);
  } catch (err) {
    res.status(500).json({
      message: "Internal server Error",
      error: err,
    });
  }

  // Log response for CloudWatch
  console.info(
    `Response from: ${event.path} statusCode: ${response.statusCode} body: ${response.body}`
  );

  return response;
};
