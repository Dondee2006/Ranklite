
import fetch from "node-fetch";

async function testCron() {
    console.log("Triggering Cron Endpoint...");

    // NOTE: In local dev, use http://localhost:3000
    // In production, this would be the live URL
    const response = await fetch("http://localhost:3000/api/cron/backlink-worker");

    console.log(`Status: ${response.status}`);

    if (response.ok) {
        const data = await response.json();
        console.log("Cron Result:", JSON.stringify(data, null, 2));
    } else {
        const text = await response.text();
        console.log("Error:", text);
    }
}

testCron().catch(console.error);
