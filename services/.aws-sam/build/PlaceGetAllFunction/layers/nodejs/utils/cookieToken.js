// cookieToken.js
const cookieToken = (user, token) => {
  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true, // makes the token available only to backend
    secure: true, // Only send over HTTPS
    sameSite: "none", // Allow cross-origin requests
  };

  user.password = undefined;

  const cookieString = `token=${token}; Expires=${options.expires.toUTCString()}; HttpOnly; Secure; SameSite=None`;

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "http://localhost:5173",
      "Access-Control-Allow-Headers": "*",
      "Access-Control-Allow-Methods": "*",
    },
    headers: {
      "Set-Cookie": cookieString,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      success: true,
      token,
      user,
    }),
  };
};

module.exports = cookieToken;
