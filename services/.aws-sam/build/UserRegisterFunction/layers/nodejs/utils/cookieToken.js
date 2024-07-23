// cookieToken.js
const cookieToken = (user, token, allQuestion) => {
  const options = {
    expires: new Date(Date.now() + 60 * 60 * 1000), // Set expiry to 59 minutes from now
    httpOnly: true, // makes the token available only to backend
    secure: true, // Only send over HTTPS
    sameSite: "none", // Allow cross-origin requests
  };

  const cookieString = `token=${token}; Expires=${options.expires.toUTCString()}; HttpOnly; Secure; SameSite=None`;

  return {
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
      "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
      "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
      "Set-Cookie": cookieString,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      success: true,
      token,
      user,
      allQuestion: allQuestion,
    }),
  };
};

module.exports = cookieToken;
