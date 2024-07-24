const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Checks user is logged in based on passed token and set the user in request
exports.checkLoggedIn = async (event) => {
  try {
    const token = event.headers.Authorization.replace("Bearer ", "");

    if (!token) {
      return [
        {
          statusCode: 401,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
            "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
            "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
          },
          body: JSON.stringify({
            success: false,
            message: "Login first to access this page.",
          }),
        },
      ];
    }

    // Decode the JWT without verifying its signature
    const decoded = jwt.decode(token, { complete: true });
    const users = await User.query("email").eq(decoded.payload.email).exec();

    return [null, users[0]];
  } catch (error) {
    console.error("JWT verification error:", error);
    return [
      {
        statusCode: 401,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
          "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
          "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
        },
        body: JSON.stringify({
          success: false,
          message: "Invalid token",
        }),
      },
    ];
  }
};

// Checks user is logged in based on passed token and set the user in request
exports.isLoggedIn = async (req, res, next) => {
  const token =
    req.cookies.token || req.header("Authorization").replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Login first to access this page",
    });
  }

  try {
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};
