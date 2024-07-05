import boto3
import json
from datetime import datetime
from decimal import Decimal

sns = boto3.client('sns')

dynamodb = boto3.resource('dynamodb')
booking_table = dynamodb.Table('Booking')
room_table = dynamodb.Table('Place')

def lambda_handler(event, context):
    
    print(event)
    for record in event['Records']:
        booking = json.loads(record['body'])
        
        # booking_id = booking['bookingId']
        booking_id = booking.get('bookingId')
        user_email = booking['emailId']
        room_id = booking['placeId']
        number_of_guests = booking['numberOfGuests']
        
        # Retrieve the room details from roomTable
        response = room_table.get_item(Key={'placeId': room_id})
        room_details = response.get('Item')
        reason = ''
        
        if room_details:
            room_capacity = room_details['maxGuests']

            if number_of_guests <= room_capacity:
                status = 'approved'
            else:
                status = 'rejected'
                reason = 'Room has less capacity.'
        else:
            status = 'rejected'
            reason = 'Room is not available.'
        

        # Update the booking status in DynamoDB
        booking_table.update_item(
            Key={'bookingId': booking_id},
            UpdateExpression='SET #s = :val1',
            ExpressionAttributeNames={'#s': 'status'},
            ExpressionAttributeValues={':val1': status}
        )
        
        message = f"Your booking for room {room_id} has been {status}. Booking ID: {booking_id}"
    sns_subject = f"Bookings {status}"
    sns_topic = 'arn:aws:sns:us-east-1:590183799919:BookingsNotification' 

    if not user_email:
        raise ValueError('Email address is required')

    try:
        # Subscribe the email to the SNS topic
        subscribe_response = subscribe_email_to_sns_topic(sns_topic, user_email)
        print('Subscription ARN:', subscribe_response['SubscriptionArn'])
        

        if 'SubscriptionArn' in subscribe_response:  # Check if subscription successful
            # Publish the message to the SNS topic
            publish_response = publish_to_sns_topic(sns_topic, sns_subject, message)
            print('MessageID:', publish_response)

            return {
                'statusCode': 200,
                'body': json.dumps('Email sent successfully')
            }
        else:
            raise ValueError('Failed to subscribe to SNS topic')

    except Exception as e:
        print('Error:', e)
        return {
            'statusCode': 500,
            'body': json.dumps('Failed to send email')
        }

def subscribe_email_to_sns_topic(topic_arn, user_email):
    params = {
        'Protocol': 'email',
        'TopicArn': topic_arn,
        'Endpoint': user_email,
        'ReturnSubscriptionArn': True
    }
    return sns.subscribe(**params)

def publish_to_sns_topic(topic_arn, subject, message):
    params = {
        'Message': message,
        'Subject': subject,
        'TopicArn': topic_arn
    }
    return sns.publish(**params)