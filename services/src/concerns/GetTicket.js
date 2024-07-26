const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const Booking = require("../../layers/nodejs/models/Booking");
const Place = require("../../layers/nodejs/models/Place");

exports.handler = async (event) => {
  console.log("Full Event received:", JSON.stringify(event, null, 2));

  let userId;

  try {
    // Check if event.body is defined
    if (!event.body) {
      throw new Error("Request body is missing.");
    }

    // Parse the event body
    const body = JSON.parse(event.body);
    userId = body.userId;

    if (!userId) {
      throw new Error("Missing required parameter: userId.");
    }
  } catch (error) {
    console.error("Error parsing request body:", error);

    return {
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
        "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
        "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: "Request body is missing or invalid." }),
    };
  }

  // Scan the User table to check if the user is an agent
  const userParams = {
    TableName: "User",
    KeyConditionExpression: "userId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  };

  try {
    const userData = await dynamodb.query(userParams).promise();
    const user = userData.Items[0];

    if (!user) {
      throw new Error("User not found.");
    }

    let params = {};
    const isAgent = user.isAgent === "y";

    if (isAgent)
      params = {
        TableName: "Ticket",
        FilterExpression: "agentId = :agentId",
        ExpressionAttributeValues: {
          ":agentId": userId,
        },
      };
    else
      params = {
        TableName: "Ticket",
        FilterExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
      };
    let data = await dynamodb.scan(params).promise();
    console.log("Tickets fetched successfully", data);

    const promises = data.Items.map(async (ticket) => {
      const bookings = await Booking.query("bookingId")
        .eq(ticket.bookingId)
        .exec();

      const booking = bookings[0];
      const place = await Place.get(booking.placeId); // Assume `place` is the place ID in the booking
      return { ticket: ticket, booking: booking, place: place };
    });

    const results = await Promise.all(promises);

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
        message: "Tickets fetched successfully",
        tickets: results,
      }),
    };
  } catch (error) {
    console.error("Error fetching tickets:", error);
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
        message: "Error fetching tickets",
        error: error.message,
      }),
    };
  }
};
