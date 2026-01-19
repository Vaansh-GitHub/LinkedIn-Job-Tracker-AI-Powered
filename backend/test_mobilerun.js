require('dotenv').config();
const { Mobilerun } = require('@mobilerun/sdk');

async function testMobileRun() {
    console.log('Testing MobileRun Connection...');
    console.log('API Key present:', !!process.env.MOBILERUN_API_KEY);

    if (!process.env.MOBILERUN_API_KEY) {
        console.error('ERROR: API Key is missing.');
        return;
    }

    const client = new Mobilerun({
        apiKey: process.env.MOBILERUN_API_KEY,
    });

    try {
        console.log('Sending test task...');
        const response = await client.tasks.run({
            llmModel: 'google/gemini-1.5-flash',
            task: 'open LinkedIn'
        });
        console.log('Success! Task ID:', response.id);
    } catch (error) {
        console.error('MobileRun Error:', JSON.stringify(error, null, 2));
    }
}

testMobileRun();
