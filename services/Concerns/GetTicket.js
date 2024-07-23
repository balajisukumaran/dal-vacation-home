const AWS = require('aws-sdk');

// Initialize AWS DynamoDB DocumentClient
AWS.config.update({
    region: 'us-east-1'
});

const dynamodb = new AWS.DynamoDB.DocumentClient();

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
            body: JSON.stringify({ message: "Request body is missing or invalid." })
        };
    }

    const params = {
        TableName: 'Ticket',
        FilterExpression: 'userId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    };

    try {
        const data = await dynamodb.scan(params).promise();
        console.log("Tickets fetched successfully", data);
        return {
            statusCode: 200,
            body: JSON.stringify({ message: "Tickets fetched successfully", tickets: data.Items })
        };
    } catch (error) {
        console.error("Error fetching tickets:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Error fetching tickets", error: error.message })
        };
    }
};
