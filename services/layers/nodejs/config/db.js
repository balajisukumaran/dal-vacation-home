const dynamoose = require("dynamoose");

const connectWithDB = () => {
  const ddb = new dynamoose.aws.sdk.DynamoDB();

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
