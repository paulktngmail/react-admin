const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient({ region: 'us-east-2' });

async function testDynamoDBWhitelist() {
    try {
        // Check if whitelist table exists
        console.log('Testing access to dpnet-whitelist table...');
        try {
            const scanResult = await dynamoDB.scan({
                TableName: 'dpnet-whitelist',
                Limit: 5
            }).promise();
            console.log('Whitelist table scan successful:', JSON.stringify(scanResult, null, 2));
            console.log(`Found ${scanResult.Count} items in the whitelist table.`);
        } catch (error) {
            console.error('Error scanning whitelist table:', error);
            
            // If the table doesn't exist, try to create it
            if (error.code === 'ResourceNotFoundException') {
                console.log('\nWhitelist table does not exist. Creating it...');
                
                // We need to use the regular DynamoDB client to create tables
                const dynamoDBClient = new AWS.DynamoDB({ region: 'us-east-2' });
                
                try {
                    const createResult = await dynamoDBClient.createTable({
                        TableName: 'dpnet-whitelist',
                        KeySchema: [
                            { AttributeName: 'address', KeyType: 'HASH' }
                        ],
                        AttributeDefinitions: [
                            { AttributeName: 'address', AttributeType: 'S' }
                        ],
                        ProvisionedThroughput: {
                            ReadCapacityUnits: 5,
                            WriteCapacityUnits: 5
                        }
                    }).promise();
                    
                    console.log('Table creation initiated:', JSON.stringify(createResult, null, 2));
                    console.log('Waiting for table to be created (this may take a minute)...');
                    
                    // Wait for the table to be created
                    await dynamoDBClient.waitFor('tableExists', {
                        TableName: 'dpnet-whitelist'
                    }).promise();
                    
                    console.log('Table created successfully!');
                } catch (createError) {
                    console.error('Error creating whitelist table:', createError);
                    return;
                }
            } else {
                return;
            }
        }

        // Test adding a whitelist entry
        console.log('\nTesting adding a whitelist entry...');
        const testId = 'test-' + Date.now();
        const putResult = await dynamoDB.put({
            TableName: 'dpnet-whitelist',
            Item: {
                id: testId,
                email: 'test@example.com',
                allocation: 1000,
                walletAddress: 'test' + Date.now(),
                dateAdded: new Date().toISOString(),
                status: 'Active'
            }
        }).promise();
        console.log('Put successful:', putResult);

        // Test getting the whitelist entry
        console.log('\nTesting getting the whitelist entry...');
        const getResult = await dynamoDB.get({
            TableName: 'dpnet-whitelist',
            Key: {
                id: testId
            }
        }).promise();
        console.log('Get successful:', JSON.stringify(getResult, null, 2));

        // Test deleting the whitelist entry
        console.log('\nTesting deleting the whitelist entry...');
        const deleteResult = await dynamoDB.delete({
            TableName: 'dpnet-whitelist',
            Key: {
                id: testId
            }
        }).promise();
        console.log('Delete successful:', deleteResult);

    } catch (error) {
        console.error('DynamoDB whitelist test error:', error);
    }
}

testDynamoDBWhitelist();
