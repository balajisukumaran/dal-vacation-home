const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AWS = require("aws-sdk");
const s3 = new AWS.S3();
const multipart = require("aws-lambda-multipart-parser");
const { v4: uuidv4 } = require("uuid");
const BUCKET_NAME = "dalvacation-home-profile";

exports.upload = async (event) => {
  try {
    // Parse the multipart form data
    const result = multipart.parse(event, false);

    // Check if files are present in the parsed result
    if (!result.photos || Object.keys(result.photos).length === 0) {
      throw new Error("No files found in the request");
    }

    const fileUploadPromises = Object.keys(result.photos).map(async (key) => {
      const file = result.photos[key];
      console.log("Parsed file:", file);

      // Convert the base64 content to a buffer
      const fileContentBuffer = Buffer.from(file.content, "base64");

      // Log the file content (first 100 bytes) for debugging
      console.log(
        "File content (buffer, first 100 bytes):",
        fileContentBuffer.slice(0, 100)
      );

      // Verify the size of the file
      const fileSize = fileContentBuffer.length;
      console.log("File size:", fileSize);

      // Generate a unique file name
      const uniqueFileName = `${uuidv4()}-${file.filename}`;

      // Ensure ContentType is correctly set
      const contentType = "application/octet-stream";
      console.log("Content Type:", contentType);

      // Define the S3 parameters
      const s3Params = {
        Bucket: BUCKET_NAME,
        Key: `place/${uniqueFileName}`, // The path to store the file in S3
        Body: fileContentBuffer,
        ContentType: contentType,
      };

      // Upload the file to S3
      await s3.upload(s3Params).promise();

      // Construct the public URL
      return `https://${s3Params.Bucket}.s3.amazonaws.com/${s3Params.Key}`;
    });

    // Wait for all files to be uploaded
    const fileUrls = await Promise.all(fileUploadPromises);

    // Return the URLs
    return {
      statusCode: 200,
      body: JSON.stringify({ urls: fileUrls }),
      headers: {
        "Access-Control-Allow-Origin": process.env.CLIENT_URL,
        "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
        "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
        "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
        "Content-Type": "application/json",
      },
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
      headers: {
        "Access-Control-Allow-Origin": process.env.CLIENT_URL,
        "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
        "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
        "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
        "Content-Type": "application/json",
      },
    };
  }
};

exports.uploadPicture = async (event) => {
  try {
    // Parse the multipart form data
    const result = multipart.parse(event, false);

    // Check if files are present in the parsed result
    if (!result.picture || Object.keys(result.picture).length === 0) {
      throw new Error("No files found in the request");
    }

    const file = result.picture; // Adjust the key based on your form-data field name
    console.log("Parsed file:", file);

    // Convert the base64 content to a buffer
    const fileContentBuffer = Buffer.from(file.content, "base64");

    // Log the file content (first 100 bytes) for debugging
    console.log(
      "File content (buffer, first 100 bytes):",
      fileContentBuffer.slice(0, 100)
    );

    // Verify the size of the file
    const fileSize = fileContentBuffer.length;
    console.log("File size:", fileSize);

    // Generate a unique file name
    const uniqueFileName = `${uuidv4()}-${file.filename}`;

    // Ensure ContentType is correctly set
    const contentType = file.contentType;
    console.log("Content Type:", contentType);

    // Define the S3 parameters
    const s3Params = {
      Bucket: BUCKET_NAME,
      Key: `profile/${uniqueFileName}`, // The path to store the file in S3
      Body: fileContentBuffer,
      ContentType: contentType,
    };

    // Upload the file to S3
    await s3.upload(s3Params).promise();

    // Construct the public URL
    const fileUrl = `https://${s3Params.Bucket}.s3.amazonaws.com/${s3Params.Key}`;

    // Return the URL
    return {
      statusCode: 200,
      body: JSON.stringify({ url: fileUrl }),
      headers: {
        "Access-Control-Allow-Origin": process.env.CLIENT_URL,
        "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
        "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
        "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
      },
    };
  } catch (error) {
    console.error(error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
      headers: {
        "Access-Control-Allow-Origin": process.env.CLIENT_URL,
        "Access-Control-Allow-Headers": process.env.ALLOWED_HEADERS,
        "Access-Control-Allow-Methods": process.env.ALLOWED_METHODS,
        "Access-Control-Allow-Credentials": process.env.ALLOWED_CREDENTIALS,
      },
    };
  }
};

// Checks user is logged in based on passed token and set the user in request
exports.isLoggedIn = async (req, res, next) => {
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
