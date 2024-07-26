import json
import boto3

# Initialize the SNS client
sns = boto3.client('sns', region_name='us-east-1')

def lambda_handler(event, context):
    # Log the incoming event
    print('Received event:', json.dumps(event))
    
    # Parse the event body
    body = json.loads(event['body'])

    # Extract the email address from the request body
    email = body['email']
    message = 'Welcome to AirBNB!! User registration is confirmed. Hope you have a good experience.'
    sns_subject = 'Registration Successful'
    sns_topic = 'arn:aws:sns:us-east-1:590183799919:RegistrationSNS'

    # Check if the email address is provided
    if not email:
        print('Error: Email address is required')
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'Email address is required'})
        }

    try:
        # Subscribe the email to the SNS topic
        subscribe_response = subscribe_email_to_sns_topic(sns_topic, email)
        print('Subscription ARN:', subscribe_response.get('SubscriptionArn'))
        
        # Check if the subscription was successful
        if 'SubscriptionArn' in subscribe_response:
            # Publish the message to the SNS topic
            publish_response = publish_to_sns_topic(sns_topic, sns_subject, message)
            print('MessageID:', publish_response.get('MessageId'))

            return {
                'statusCode': 200,
                'body': json.dumps({'message': 'Email sent successfully'})
            }
        else:
            print('Error: Failed to subscribe to SNS topic')
            return {
                'statusCode': 500,
                'body': json.dumps({'message': 'Failed to subscribe to SNS topic'})
            }

    except Exception as e:
        # Log the error and return a failure response
        print('Error:', e)
        return {
            'statusCode': 500,
            'body': json.dumps({'message': 'Failed to send email', 'error': str(e)})
        }

def subscribe_email_to_sns_topic(topic_arn, email):
    # Subscribe the given email address to the specified SNS topic
    params = {
        'Protocol': 'email',
        'TopicArn': topic_arn,
        'Endpoint': email,
        'ReturnSubscriptionArn': True
    }
    return sns.subscribe(**params)

def publish_to_sns_topic(topic_arn, subject, message):
    # Publish a message to the specified SNS topic
    params = {
        'Message': message,
        'Subject': subject,
        'TopicArn': topic_arn
    }
    return sns.publish(**params)