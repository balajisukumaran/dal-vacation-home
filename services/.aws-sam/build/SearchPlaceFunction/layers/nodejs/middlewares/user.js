const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Checks user is logged in based on passed token and set the user in request
exports.isLoggedIn = async (req, res, next) => {
  // token could be found in request cookies or in reqest headers
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
    req.user = await User.findById(decoded.id);
    next();
  } catch (error) {
    // Handle JWT verification error
    console.error("JWT verification error:", error);
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// Checks user is logged in based on passed token and set the user in request
exports.checkLoggedIn = async (event) => {
  try {
    // token could be found in request cookies or in reqest headers
    const token = event.headers.Authorization.replace("Bearer ", "");

    if (!token) {
      return [
        {
          statusCode: 401,
          headers: {
            "Access-Control-Allow-Origin": process.env.CLIENT_URL,
            "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
            "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
            "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
          },
          body: JSON.stringify({
            success: false,
            message: "Login first to access this page",
          }),
        },
      ];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await User.query("id").eq(decoded.id).exec();

    return [null, users[0]];
  } catch (error) {
    // Handle JWT verification error
    console.error("JWT verification error:", error);
    return [
      {
        statusCode: 401,
        headers: {
          "Access-Control-Allow-Origin": process.env.CLIENT_URL,
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
