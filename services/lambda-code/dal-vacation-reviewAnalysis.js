const AWS = require('aws-sdk');
const fs = require('fs');
const uuid4 = require('uuid4');
const path = require('path');
const { LanguageServiceClient } = require('@google-cloud/language');

// Initialize the DynamoDB DocumentClient
const docClient = new AWS.DynamoDB.DocumentClient();

// Initialize the Google Cloud LanguageServiceClient
let client;

exports.handler = async (event) => {
    // Define the path for the service account file in /tmp
    const serviceAccountPath = '/tmp/credentials.json';

    // Copy the service account file to /tmp
    try {
        const originalPath = path.join(__dirname, 'credentials.json');
        fs.copyFileSync(originalPath, serviceAccountPath);

        // Set the GOOGLE_APPLICATION_CREDENTIALS environment variable
        process.env.GOOGLE_APPLICATION_CREDENTIALS = serviceAccountPath;
    } catch (error) {
        console.error("Error copying service account file", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" })
        };
    }

    // Initialize the Google Cloud LanguageServiceClient if it hasn't been already
    if (!client) {
        client = new LanguageServiceClient();
    }

    // Extract the review, userId, and placeId from the event
    console.log('event:', event);
    const { review, userId, placeId } = event;

    // Prepare the document for sentiment analysis
    const document = {
        content: review,
        type: 'PLAIN_TEXT',
    };
    console.log('document:', document);
    let results = 0;

    // Perform sentiment analysis on the review
    try {
        const result = await client.analyzeSentiment({ document });
        console.log('result:', result);
        const sentiment = result[0].documentSentiment;
        results = sentiment.score;
        console.log('Sentiment:', results);
    } catch (error) {
        console.error("Error performing sentiment analysis", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" })
        };
    }

    // Prepare the parameters for inserting the review into DynamoDB
    const params = {
        TableName: 'Review',
        Item: {
            ReviewId: uuid4(),
            placeId: placeId,
            Review: review,
            UserId: userId,
            Date: new Date().toISOString(),
            Sentiment: results,
            Polarity: results === 0 ? 'Neutral' : results > 0 ? 'Positive' : 'Negative',
        },
    };

    console.log('params:', params);

    // Insert the review into DynamoDB
    try {
        await docClient.put(params).promise();
    } catch (error) {
        console.error("Error inserting review into DynamoDB", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: "Internal server error" })
        };
    }

    return {
        statusCode: 200,
        body: JSON.stringify(results)
    };
};