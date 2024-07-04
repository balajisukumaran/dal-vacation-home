const dynamoose = require("dynamoose");

const questionSchema = new dynamoose.Schema(
  {
    questionId: {
      type: String,
      hashKey: true,
    },
    question: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Question = dynamoose.model("Question", questionSchema);

module.exports = Question;
