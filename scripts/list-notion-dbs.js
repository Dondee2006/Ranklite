const { Client } = require('@notionhq/client');
const fs = require('fs');

async function listDatabases() {
    const token = "ntn_F9011703468xGOt6hpzGkzmHGp2RJ2dvAYVzZ9KtoyT6v0";
    const client = new Client({ auth: token });

    try {
        const response = await client.search();

        const results = response.results.map(db => {
            let title = "Untitled";
            if (db.title) {
                title = db.title[0]?.plain_text || "Untitled";
            } else if (db.properties?.title?.title) {
                title = db.properties.title.title[0]?.plain_text || "Untitled";
            } else if (db.properties?.Name?.title) {
                title = db.properties.Name.title[0]?.plain_text || "Untitled";
            }

            return {
                id: db.id,
                object: db.object,
                title: title,
                has_properties: !!db.properties,
                parent: db.parent,
                url: db.url
            };
        });

        fs.writeFileSync('databases-list.json', JSON.stringify(results, null, 2));
        console.log("Found databases:", results.length);
    } catch (error) {
        console.error("Search failed:", error);
    }
}

listDatabases();
