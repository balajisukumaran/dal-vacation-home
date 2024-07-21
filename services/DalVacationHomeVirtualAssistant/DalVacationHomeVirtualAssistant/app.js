const AWS = require("aws-sdk");
const uuid = require("./layers/nodejs/node_modules/uuid/dist/index");
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
    let url = "https://dal-vacation-home-service-konfsid46q-ue.a.run.app";
    if (page === "Profile") url = url + "/account";
    else if (page === "Bookings") url = url + "/account/bookings";
    else if (page === "Accomodations") url = url + "/account/places";
    else url = url + "/";

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
            content: "Click here to navigate. " + url,
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

    const getItemParams = {
      TableName: "Booking",
      Key: { bookingId: bookingId },
    };

    try {
      const data = await dynamodb.get(getItemParams).promise();
      if (data.Item) {
        const item = data.Item;
        let userId = item.userId;
        let status = "open";

        const ticketId = uuid.v4(); // Generate a unique ticketId using UUID

        const params = {
          TableName: "Ticket",
          Item: {
            ticketId: ticketId,
            //agentId: null,
            bookingId: bookingId,
            //comments: null,
            concern: concern,
            status: status,
            userId: userId,
          },
        };

        await dynamodb.put(params).promise();

        //code to call pub sub.

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
