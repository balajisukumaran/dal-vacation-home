import json
import boto3
from boto3.dynamodb.conditions import Key, Attr
from decimal import Decimal

class DecimalEncoder(json.JSONEncoder):
    def default(self, o):
        if isinstance(o, Decimal):
            return float(o)
        return super(DecimalEncoder, self).default(o)

def lambda_handler(event, context):
    # Initialize a session using Amazon DynamoDB
    dynamodb = boto3.resource('dynamodb')
    
    # Specify the DynamoDB table name
    table_name = 'User'
    table = dynamodb.Table(table_name)
    
    try:
        # Initialize the scan operation
        response = table.scan()
        items = response['Items']
        
        # Continue scanning if there are more items (pagination)
        while 'LastEvaluatedKey' in response:
            response = table.scan(ExclusiveStartKey=response['LastEvaluatedKey'])
            items.extend(response['Items'])
        
        return {
            'statusCode': 200,
            'body': json.dumps(items, cls=DecimalEncoder)
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps(str(e))
        }