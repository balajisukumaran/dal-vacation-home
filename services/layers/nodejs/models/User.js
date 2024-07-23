const dynamoose = require("dynamoose");
const { v4: uuidv4 } = require("uuid");

// Define the schema
const userSchema = new dynamoose.Schema(
  {
    userId: {
      type: String,
      hashKey: true,
      default: () => uuidv4(),
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
    picture: {
      type: String,
      default:
        "https://res.cloudinary.com/rahul14019/image/upload/w_1000,c_fill,ar_1:1,g_auto,r_max,bo_5px_solid_red,b_rgb:262c35/v1695133265/pngwing.com_zi4cre.png",
    },
    questionId: {
      type: String,
    },
    answerHash: {
      type: String,
    },
    isAgent: {
      type: String,
      required: true,
    },
    cipherCode: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create the model
const User = dynamoose.model("User", userSchema);

module.exports = User;
