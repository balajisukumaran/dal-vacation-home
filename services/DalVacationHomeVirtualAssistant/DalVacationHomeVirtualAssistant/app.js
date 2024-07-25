const AWS = require("aws-sdk");
const uuid = require("./layers/nodejs/node_modules/uuid/dist/index");
const {
  PubSub,
} = require("./layers/nodejs/node_modules/@google-cloud/pubsub/build/src/index");
const path = require("path");

// service account key
const serviceAccountKeyPath = path.join(
  __dirname,
  "serverless-housing-message.json"
);

// Initializing the PubSub client with the service account key
const pubsub = new PubSub({
  keyFilename: serviceAccountKeyPath,
});
const topicName = "dal-housing-messaging";
const dynamodb = new AWS.DynamoDB.DocumentClient();

exports.lambdaHandler = async (event, context) => {
  console.log(event);
  const intent = event.sessionState.intent.name;
  const slots = event.sessionState.intent.slots;
  let response = {};

  if (intent === "BookingDetails") response = await BookingDetails(event);
  else if (intent === "RaiseConcern") response = await RaiseConcern(event);
  else if (intent === "Navigation") response = await Navigation(event);
  else
    response = {
      sessionState: {
        dialogAction: {
          type: "Close",
        },
        intent: {
          name: event.sessionState.intent.name,
          slots: slots,
          state: "Fulfilled",
        },
      },
      messages: [
        {
          contentType: "ImageResponseCard",
          imageResponseCard: {
            title: "Hello, how may I assist you today?",
            buttons: [
              {
                text: "Help navigating the site",
                value: "Navigation",
              },
              {
                text: "View booking details",
                value: "View booking details",
              },
              {
                text: "Raise a concern",
                value: "Raise a concern",
              },
            ],
          },
        },
      ],
    };
  return response;
};

async function Navigation(event) {
  const slots = event.sessionState.intent.slots;
  const invocationSource = event.invocationSource;

  if (
    slots.Page !== null &&
    slots.Page.value.originalValue !== null &&
    slots.Page.value.originalValue !== ""
  ) {
    const page = slots.Page.value.originalValue;
    let comment = "";
    if (page === "Profile") {
      comment =
        "To access your profile, Click the profile icon located in the top right corner of the page.";
    } else if (page === "Bookings") {
      comment =
        "Please note that the Bookings page is accessible only to customers.\nFollow these steps to view your bookings:\n1. Click the profile icon located in the top right corner of the page.\n2. Select the 'My Bookings' option to view all your bookings.\n3. Click on a specific booking to view its details or to provide feedback.";
    } else if (page === "Accommodations") {
      comment =
        "Please note that the Accommodations page is accessible only to property agents.\nFollow these steps to view accommodations:\n1. Click the profile icon located in the top right corner of the page.\n2. Select the 'My Accommodations' option to view all your properties.\n3. Click on a specific accommodation to view its details.";
    } else if (page === "Analysis") {
      comment =
        "To access analysis, Click the profile icon located in the top right corner of the page and scroll down. Please note that the analysis is accessible only to property agents.";
    } else if (page === "Concerns") {
      comment =
        "Follow these steps to view concerns status:\n1. Click the profile icon located in the top right corner of the page.\n2. Select the 'Concerns' option to view all your concerns.\n3. If you're a property agent you will be able to view comment on the concerns assigned to you.";
    } else {
      comment =
        "To return to the homepage, click the Dal vacation home icon located in the top left corner of the page.";
    }

    try {
      return {
        sessionState: {
          dialogAction: {
            type: "Close",
          },
          intent: {
            name: event.sessionState.intent.name,
            slots: slots,
            state: "Fulfilled",
          },
        },
        messages: [
          {
            contentType: "PlainText",
            content: comment,
          },
        ],
      };
    } catch (err) {
      console.error(err);
      throw new Error("Error occurred.");
    }
  } else
    return {
      sessionState: {
        dialogAction: {
          type: "Delegate",
        },
        intent: {
          name: event.sessionState.intent.name,
          slots: slots,
        },
      },
    };
}

async function RaiseConcern(event) {
  const slots = event.sessionState.intent.slots;
  const invocationSource = event.invocationSource;

  if (invocationSource === "DialogCodeHook") {
    let validateBookingIdResult;
    let validateConcernResult;
    let resultBookingId;
    let resultConcern;

    if (slots.booking !== null) {
      validateBookingIdResult = await validateBookingId(slots);

      resultBookingId = await dialogCodeHookResult(
        event,
        validateBookingIdResult,
        slots
      );

      if (slots.concern === null) return resultBookingId;
    }
    if (slots.concern !== null) {
      validateConcernResult = await validateConcern(slots);

      resultConcern = await dialogCodeHookResult(
        event,
        validateBookingIdResult,
        slots
      );

      return resultConcern;
    }

    return resultBookingId;
  }

  if (invocationSource === "FulfillmentCodeHook") {
    const bookingId = slots.booking.value.originalValue;
    const concern = slots.concern.value.originalValue;

    try {
      // if (data.Item) {
      // const item = data.Item;
      // let userId = item.userId;
      // let status = "open";

      // const ticketId = uuid.v4(); // Generate a unique ticketId using UUID

      // const params = {
      //   TableName: "Ticket",
      //   Item: {
      //     ticketId: ticketId,
      //     //agentId: null,
      //     bookingId: bookingId,
      //     //comments: null,
      //     concern: concern,
      //     status: status,
      //     userId: userId,
      //   },
      // };

      // await dynamodb.put(params).promise();

      //code to call pub sub.

      try {
        // Create the data object
        const data = {
          bookingId,
          concern,
        };

        // Convert the message to a Buffer
        const dataBuffer = Buffer.from(JSON.stringify(data));

        // Publish the message to the Pub/Sub topic
        const messageId = await pubsub.topic(topicName).publish(dataBuffer);
        console.log(`Message ${messageId} published to topic ${topicName}`);

        // Return a successful response to Lex
        // return {
        //   dialogAction: {
        //     type: "Close",
        //     fulfillmentState: "Fulfilled",
        //     message: {
        //       contentType: "PlainText",
        //       content: `Your concern has been recorded with booking ID: ${bookingId}. Thank you!`,
        //     },
        //   },
        // };

        return {
          sessionState: {
            dialogAction: {
              type: "Close",
            },
            intent: {
              name: event.sessionState.intent.name,
              slots: slots,
              state: "Fulfilled",
            },
          },
          messages: [
            {
              contentType: "PlainText",
              content: "An agent has been assigned.",
            },
            {
              contentType: "PlainText",
              content:
                "Click here to view the status. https://dal-vacation-home-service-konfsid46q-ue.a.run.app/account",
            },
          ],
        };
      } catch (error) {
        // Handle errors and return an error response to Lex
        console.error(`Error publishing message to topic ${topicName}:`, error);
        return {
          dialogAction: {
            type: "Close",
            fulfillmentState: "Failed",
            message: {
              contentType: "PlainText",
              content: `There was an error recording your concern. Please try again later.`,
            },
          },
        };
      }
      // } else {
      //   return {
      //     sessionState: {
      //       dialogAction: {
      //         type: "Close",
      //       },
      //       intent: {
      //         name: event.sessionState.intent.name,
      //         slots: slots,
      //         state: "Failed",
      //       },
      //     },
      //     messages: [
      //       {
      //         contentType: "PlainText",
      //         content:
      //           "Sorry, I could not find the booking ID. Please check and try again.",
      //       },
      //     ],
      //   };
      // }
    } catch (err) {
      console.error(err);
      throw new Error("Error fetching booking details from DynamoDB");
    }
  }
}

async function dialogCodeHookResult(event, validationResult, slots) {
  if (!validationResult.isValid) {
    let response;
    if (validationResult.message) {
      response = {
        sessionState: {
          dialogAction: {
            slotToElicit: validationResult.violatedSlot,
            type: "ElicitSlot",
          },
          intent: {
            name: event.sessionState.intent.name,
            slots: slots,
          },
        },
        messages: [
          {
            contentType: "PlainText",
            content: validationResult.message,
          },
        ],
      };
    } else {
      response = {
        sessionState: {
          dialogAction: {
            slotToElicit: validationResult.violatedSlot,
            type: "ElicitSlot",
          },
          intent: {
            name: event.sessionState.intent.name,
            slots: slots,
          },
        },
      };
    }
    return response;
  } else {
    return {
      sessionState: {
        dialogAction: {
          type: "Delegate",
        },
        intent: {
          name: event.sessionState.intent.name,
          slots: slots,
        },
      },
    };
  }
}

async function validateBookingId(slots) {
  const bookingIds = await getAllBookingIds("Booking");

  if (!slots.booking) {
    return {
      isValid: false,
      violatedSlot: "booking",
    };
  }

  const bookingId = slots.booking.value.originalValue;

  if (!bookingIds.includes(bookingId)) {
    return {
      isValid: false,
      violatedSlot: "booking",
      message: "Please enter a valid booking id.",
    };
  }

  return { isValid: true };
}

async function validateConcern(slots) {
  if (!slots.concern) {
    return {
      isValid: false,
      violatedSlot: "concern",
    };
  }

  const concern = slots.concern.value.originalValue;

  return { isValid: true };
}

async function BookingDetails(event) {
  const slots = event.sessionState.intent.slots;
  const invocationSource = event.invocationSource;

  const validationResult = await validateBooking(slots);

  if (invocationSource === "DialogCodeHook") {
    if (!validationResult.isValid) {
      let response;
      if (validationResult.message) {
        response = {
          sessionState: {
            dialogAction: {
              slotToElicit: validationResult.violatedSlot,
              type: "ElicitSlot",
            },
            intent: {
              name: event.sessionState.intent.name,
              slots: slots,
            },
          },
          messages: [
            {
              contentType: "PlainText",
              content: validationResult.message,
            },
          ],
        };
      } else {
        response = {
          sessionState: {
            dialogAction: {
              slotToElicit: validationResult.violatedSlot,
              type: "ElicitSlot",
            },
            intent: {
              name: event.sessionState.intent.name,
              slots: slots,
            },
          },
        };
      }
      return response;
    } else {
      return {
        sessionState: {
          dialogAction: {
            type: "Delegate",
          },
          intent: {
            name: event.sessionState.intent.name,
            slots: slots,
          },
        },
      };
    }
  }

  if (invocationSource === "FulfillmentCodeHook") {
    const bookingID = slots.BookingID.value.originalValue;
    const table = "Booking";

    const getItemParams = {
      TableName: table,
      Key: { bookingId: bookingID },
    };

    try {
      const data = await dynamodb.get(getItemParams).promise();
      if (data.Item) {
        const item = data.Item;

        const bookingDetails = `Your booking is confirmed! ${item.name} (${item.email}, ${item.phone}) will be staying from ${item.checkIn} to ${item.checkOut} for a total of ${item.numOfGuests} guest(s). The reservation is at place ID ${item.placeId}, with a total cost of $${item.price}. Current status: ${item.userId}.`;

        return {
          sessionState: {
            dialogAction: {
              type: "Close",
            },
            intent: {
              name: event.sessionState.intent.name,
              slots: slots,
              state: "Fulfilled",
            },
          },
          messages: [
            {
              contentType: "PlainText",
              content: bookingDetails,
            },
          ],
        };
      } else {
        return {
          sessionState: {
            dialogAction: {
              type: "Close",
            },
            intent: {
              name: event.sessionState.intent.name,
              slots: slots,
              state: "Failed",
            },
          },
          messages: [
            {
              contentType: "PlainText",
              content:
                "Sorry, I could not find the booking ID. Please check and try again.",
            },
          ],
        };
      }
    } catch (err) {
      console.error(err);
      throw new Error("Error fetching booking details from DynamoDB");
    }
  }
}

async function getAllBookingIds(tableName) {
  const params = {
    TableName: tableName,
    ProjectionExpression: "bookingId",
  };

  let bookingIds = [];
  let data;

  do {
    data = await dynamodb.scan(params).promise();
    bookingIds = bookingIds.concat(data.Items.map((item) => item.bookingId));
    params.ExclusiveStartKey = data.LastEvaluatedKey;
  } while (typeof data.LastEvaluatedKey !== "undefined");

  return bookingIds;
}

async function validateBooking(slots) {
  const bookingIds = await getAllBookingIds("Booking");

  if (!slots.BookingID) {
    return {
      isValid: false,
      violatedSlot: "BookingID",
    };
  }

  const bookingId = slots.BookingID.value.originalValue;

  if (!bookingIds.includes(bookingId)) {
    return {
      isValid: false,
      violatedSlot: "BookingID",
      message: "Please enter a valid booking id.",
    };
  }

  return { isValid: true };
}
