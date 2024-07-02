const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AWS = require("aws-sdk");
const Amplify = require("aws-amplify");

Amplify.default.configure({
  Auth: {
    userPoolId: "us-east-1_fxqdGPnnZ",
    userPoolWebClientId: "49gf14snt2hgr0p4grf9slkcuq",
    region: "us-east-1",
  },
});

exports.register = async (firstName, lastName, email, password, isAgent) => {
  const { user } = await Amplify.Auth.signUp({
    username: email,
    password,
    attributes: {
      email,
      firstName,
      lastName,
    },
  });
};

exports.login = async (email, password) => {
  const user = await Amplify.Auth.signIn(email, password);
  const tokens = user.signInUserSession;

  return user;

  return {
    statusCode: 200,
    body: JSON.stringify({
      message: "User signed in successfully",
      idToken: tokens.idToken.jwtToken,
      accessToken: tokens.accessToken.jwtToken,
      refreshToken: tokens.refreshToken.token,
    }),
  };
};

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
            message: "Login first to access this page",
          }),
        },
      ];
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const users = await User.query("userId").eq(decoded.userId).exec();

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

// // Checks user is logged in based on passed token and set the user in request
// exports.isLoggedIn = async (req, res, next) => {
//   const token =
//     req.cookies.token || req.header("Authorization").replace("Bearer ", "");

//   if (!token) {
//     return res.status(401).json({
//       success: false,
//       message: "Login first to access this page",
//     });
//   }

//   try {
//     const decoded = await jwt.verify(token, process.env.JWT_SECRET);
//     req.user = await User.findById(decoded.userId);
//     next();
//   } catch (error) {
//     console.error("JWT verification error:", error);
//     return res.status(401).json({
//       success: false,
//       message: "Invalid token",
//     });
//   }
// };
