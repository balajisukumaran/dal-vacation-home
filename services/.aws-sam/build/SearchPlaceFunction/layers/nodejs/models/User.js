const dynamoose = require("dynamoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");

// Define the schema
const userSchema = new dynamoose.Schema(
  {
    id: {
      type: String,
      hashKey: true,
      default: uuidv4,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      index: {
        global: true, // Create a global secondary index on the email attribute
        name: "EmailIndex",
      },
    },
    password: {
      type: String,
      required: true,
    },
    picture: {
      type: String,
      default:
        "https://res.cloudinary.com/rahul14019/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1695133265/pngwing.com_zi4cre.png",
    },
  },
  {
    timestamps: true,
  }
);

// Create the model
const User = dynamoose.model("User", userSchema);

// Manual pre-save hook to hash the password
User.prototype.hashPassword = async function () {
  this.password = await bcrypt.hash(this.password, 10);
};

// Method to generate JWT token
User.prototype.getJwtToken = async function () {
  return jwt.sign({ id: this.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRY,
  });
};

// validate the password
User.prototype.isValidatedPassword = async function (userSentPassword) {
  return await bcrypt.compare(userSentPassword, this.password);
};

module.exports = User;
