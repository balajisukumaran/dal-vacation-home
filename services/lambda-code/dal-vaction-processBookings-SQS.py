import boto3
import json
from datetime import datetime
from decimal import Decimal
import uuid
import logging

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Booking')
sqs = boto3.client('sqs')
room_approval_queue_url = 'https://sqs.us-east-1.amazonaws.com/590183799919/RoomsBookingApprovalSQS'
logger = logging.getLogger()
logger.setLevel(logging.INFO)

def lambda_handler(event, context):
    
    logger.info(f"Received event: {json.dumps(event)}")
    
    for record in event['Records']:
        body = json.loads(record['body'])
        
        logger.info(body);
        
        # Generate a unique booking ID
        bookingId = str(uuid.uuid4())
    
        # Extract the required fields from the request body
        checkIn = body['checkIn']
        checkOut = body['checkOut']
        createdAt = datetime.now().isoformat()  # Automatically set to current date and time
        name = body['name']
        numberOfGuests = body['numberOfGuests']
        phone = body['phone']
        placeId = body['placeId']
        price = body['price']
        status = 'pending'  # Initially set status to 'pending'
        userId = body['userId']
        email = body.get('email')
    
       # Process booking details
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
        # Send message to RoomApprovalQueue
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
    return {'statusCode': 200, 'body': 'Processed successfully'}