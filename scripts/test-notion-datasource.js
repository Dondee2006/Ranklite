const { Client } = require('@notionhq/client');
const fs = require('fs');

async function testDataSource() {
    const token = "ntn_F9011703468xGOt6hpzGkzmHGp2RJ2dvAYVzZ9KtoyT6v0";
    const client = new Client({ auth: token });
    const dataSourceId = "2d321923-aeac-80ae-a195-000b453b5cb6";

    try {
        console.log(`Retrieving data source ${dataSourceId}...`);
        const response = await client.databases.retrieve({
            database_id: dataSourceId,
        });

        fs.writeFileSync('datasource-details.json', JSON.stringify(response, null, 2));
        console.log("Success! Properties found:", Object.keys(response.properties || {}).length);
        console.log("Properties:", Object.keys(response.properties || {}).join(", "));
    } catch (error) {
        console.error("Retrieval failed:", error.message);
        if (error.body) console.error("Error body:", error.body);
    }
}

testDataSource();
