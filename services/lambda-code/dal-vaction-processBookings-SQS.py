import boto3
import json
from datetime import datetime
from decimal import Decimal
import uuid
import logging

# Initialize the DynamoDB resource
dynamodb = boto3.resource('dynamodb')
# Reference the 'Booking' table in DynamoDB
table = dynamodb.Table('Booking')
# Initialize the SQS client
sqs = boto3.client('sqs')
# SQS Queue URL for room approval messages
room_approval_queue_url = 'https://sqs.us-east-1.amazonaws.com/590183799919/RoomsBookingApprovalSQS'
# Set up logging
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    
    logger.info(f"Received event: {json.dumps(event)}")
    
    # Iterate over each record in the event
    for record in event['Records']:
        
        body = json.loads(record['body'])
        
        
        logger.info(body)
        
        # Generate a unique booking ID
        bookingId = str(uuid.uuid4())
    
        # Extract the required fields from the request body
        checkIn = body['checkIn']
        checkOut = body['checkOut']
        name = body['name']
        numberOfGuests = body['numberOfGuests']
        phone = body['phone']
        placeId = body['placeId']
        price = body['price']
        status = 'pending'  # Initially set status to 'pending'
        userId = body['userId']
        email = body.get('email')  # Use get to avoid KeyError if 'email' is not provided
    
        # Insert booking details into the DynamoDB table
        table.put_item(Item={
            'bookingId': bookingId,
            'checkIn': checkIn,
            'checkOut': checkOut,
            'name': name,
            'numOfGuests': numberOfGuests,
            'phone': phone,
            'placeId': placeId,
            'price': Decimal(body['price']),
            'status': status,
            'userId': userId,
            'email': email 
        })
        
        # Send a message to the room approval SQS queue
        sqs.send_message(
            QueueUrl=room_approval_queue_url,
            MessageBody=json.dumps({
                'bookingId': bookingId, 
                'userId': userId, 
                'emailId': email,
                'placeId': placeId,
                'numberOfGuests': numberOfGuests,
                'checkIn': checkIn
            })
        ) 
    
    # Return a success response
    return {'statusCode': 200, 'body': 'Processed successfully'}