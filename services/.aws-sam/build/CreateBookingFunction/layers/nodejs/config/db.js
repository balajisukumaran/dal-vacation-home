// db.js
const dynamoose = require("dynamoose");

// // Set Dynamoose default settings
// dynamoose.model.defaults.set({
//   create: true, // Automatically create tables if they do not exist
//   waitForActive: {
//     enabled: true, // Wait for tables to be active
//     check: {
//       timeout: 180000, // 3 minutes
//       frequency: 1000, // 1 second
//     },
//   },
// });

const connectWithDB = () => {
  const ddb = new dynamoose.aws.sdk.DynamoDB();

  // const ddb = new dynamoose.aws.sdk.DynamoDB({
  //   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  //   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  //   region: process.env.AWS_REGION,
  // });

  dynamoose.aws.ddb.set(ddb);

  dynamoose.aws.ddb().listTables((err, data) => {
    if (err) {
      console.log(`DB connection failed`);
      console.log(err);
      process.exit(1);
    } else {
      console.log(`DB connected successfully`);
    }
  });
};

module.exports = connectWithDB;
