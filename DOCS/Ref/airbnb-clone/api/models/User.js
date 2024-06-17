const dynamoose = require("dynamoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Define the schema
const userSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true, // Primary key in DynamoDB
      default: () => dynamoose.aws.sdk.util.uuid.v4(), // Generate a UUID
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      required: true,
      default:
        "https://res.cloudinary.com/rahul4019/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1695133265/pngwing.com_zi4cre.png",
    },
  },
  {
    timestamps: true, // Adds createdAt and updatedAt timestamps
  }
);

// Method to create and return a JWT token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

// Method to validate the password
userSchema.methods.isValidatedPassword = async function (userSentPassword) {
  return await bcrypt.compare(userSentPassword, this.password);
};

// Create the model
const User = dynamoose.model("User", userSchema);

module.exports = User;
