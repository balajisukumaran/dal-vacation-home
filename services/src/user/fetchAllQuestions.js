const AWS = require("aws-sdk");
const dynamodb = new AWS.DynamoDB.DocumentClient();
const tableName = "Question";

exports.GetItemHandler = async (event, context) => {
  try {
    // Scan the DynamoDB table to fetch all items
    const response = await dynamodb.scan({ TableName: tableName }).promise();

    // Extract QuestionId and Question from each item
    const questions = response.Items.map((item) => ({
      questionId: item.questionId,
      question: item.question,
    }));

    // Return a successful response with CORS headers
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET",
      },
      body: JSON.stringify(questions),
    };
  } catch (e) {
    // Return an error response if any exception occurs
    console.error(`Error fetching questions: ${e}`);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET",
      },
      body: JSON.stringify({ error: "Failed to fetch questions" }),
    };
  }
};
