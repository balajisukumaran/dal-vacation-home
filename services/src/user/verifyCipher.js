const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB();

exports.PostItemHandler = async (event, context) => {
  const body = JSON.parse(event.body);
  const email = body.email;
  const randomText = body.randomText;
  const cipher = body.cipher;

  const params = {
    TableName: "User",
    FilterExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": { S: email },
    },
  };

  try {
    const response = await dynamodb.scan(params).promise();

    if (!response.Items || response.Items.length === 0) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
          "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
          "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
        },
        body: JSON.stringify({ error: "User not found" }),
      };
    }

    const userItem = response.Items[0];
    const cipherCode = parseInt(userItem.cipherCode.S);

    const shiftedText = shiftText(randomText, cipherCode);

    if (shiftedText === cipher) {
      return {
        statusCode: 200,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
          "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
          "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
        },
        body: JSON.stringify({ status: "true", message: "Cipher matches" }),
      };
    } else {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
          "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
          "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
        },
        body: JSON.stringify({
          status: "false",
          error: "Cipher does not match",
        }),
      };
    }
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
        "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
        "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
      },
      body: JSON.stringify({
        error: "Internal Server Error",
        details: error.message,
      }),
    };
  }
};

function shiftText(text, shift) {
  let shifted = "";
  for (let char of text) {
    shifted += String.fromCharCode(
      ((char.charCodeAt(0) - "A".charCodeAt(0) + shift) % 26) +
        "A".charCodeAt(0)
    );
  }
  return shifted;
}
