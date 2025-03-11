const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

async function testDynamoDBAccess() {
    try {
        // Test scan operation
        console.log('Testing scan operation on dpnetsale table...');
        const scanResult = await dynamoDB.scan({
            TableName: 'dpnetsale'
        }).promise();
        console.log('Scan successful:', JSON.stringify(scanResult, null, 2));

        // Test put operation with required saleKey
        console.log('\nTesting put operation with saleKey...');
        const testId = 'test-' + Date.now();
        const putResult = await dynamoDB.put({
            TableName: 'dpnetsale',
            Item: {
                saleKey: testId,
                id: testId,
                timestamp: new Date().toISOString(),
                testData: 'This is a test entry'
            }
        }).promise();
        console.log('Put successful:', putResult);

        // Test get operation for the item we just put
        console.log('\nTesting get operation for the item we just created...');
        const getResult = await dynamoDB.get({
            TableName: 'dpnetsale',
            Key: {
                saleKey: testId
            }
        }).promise();
        console.log('Get successful:', JSON.stringify(getResult, null, 2));

        // Test delete operation to clean up
        console.log('\nTesting delete operation to clean up...');
        const deleteResult = await dynamoDB.delete({
            TableName: 'dpnetsale',
            Key: {
                saleKey: testId
            }
        }).promise();
        console.log('Delete successful:', deleteResult);

    } catch (error) {
        console.error('DynamoDB access error:', error);
    }
}

testDynamoDBAccess();
