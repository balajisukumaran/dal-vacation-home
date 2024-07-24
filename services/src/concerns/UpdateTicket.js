const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();

const updateTicket = async (event) => {
  try {
    // Log the event for debugging
    console.log("Event received:", JSON.stringify(event, null, 2));

    // Check if event.body exists and is a string
    let requestBody = {};
    if (event.body) {
      try {
        requestBody = JSON.parse(event.body);
      } catch (error) {
        console.error("Error parsing JSON body:", error);
        return {
          statusCode: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
            "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
            "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ message: "Invalid JSON format." }),
        };
      }
    } else {
      console.error("Request body is missing.");
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
          "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
          "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: "Request body is missing." }),
      };
    }

    // Log the parsed requestBody
    console.log("Parsed requestBody:", JSON.stringify(requestBody, null, 2));

    const { ticketId, updatedFields } = requestBody;

    // Validate if required fields are present
    if (!ticketId || !updatedFields) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
          "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
          "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Missing required fields: ticketId or updatedFields.",
        }),
      };
    }

    const { status, comments } = updatedFields;

    // Validate if updatedFields contains necessary parameters
    if (!status || !comments) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
          "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
          "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message:
            "Missing one or more required parameters in updatedFields: status, comments.",
        }),
      };
    }

    // Update ticket parameters
    const updateParams = {
      TableName: "Ticket",
      Key: { ticketId: ticketId },
      UpdateExpression: "set #status = :status, comments = :comments",
      ExpressionAttributeNames: {
        "#status": "status",
      },
      ExpressionAttributeValues: {
        ":status": status,
        ":comments": comments,
      },
      ReturnValues: "UPDATED_NEW",
    };

    const result = await dynamodb.update(updateParams).promise();

    // Log the result for debugging
    console.log("Update result:", JSON.stringify(result, null, 2));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
        "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
        "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Ticket updated successfully", result }),
    };
  } catch (error) {
    // Log the error for debugging
    console.error("Error updating ticket:", error);

    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
        "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
        "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: "Error updating ticket",
        error: error.message,
      }),
    };
  }
};

exports.handler = updateTicket;
