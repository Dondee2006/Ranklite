
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugPosts() {
    const token = process.env.NOTION_TOKEN;
    const dbId = process.env.NOTION_DATABASE_ID;

    console.log(`Querying Database: ${dbId}`);

    const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ page_size: 5 })
    });

    if (!response.ok) {
        console.error("Fetch failed:", await response.text());
        return;
    }

    const data = await response.json();
    console.log(`Found ${data.results.length} posts.`);

    data.results.forEach((page: any, index: number) => {
        console.log(`\n--- Post ${index + 1} ---`);
        console.log(`ID: ${page.id}`);
        // Log the root 'cover' object
        console.log("Root 'cover' field:", JSON.stringify(page.cover, null, 2));

        // Log the properties 'Cover Image' if it exists
        const props = page.properties;
        const coverPropKey = Object.keys(props).find(k => k.toLowerCase() === 'cover image' || k.toLowerCase() === 'cover');

        if (coverPropKey) {
            console.log(`Property '${coverPropKey}':`, JSON.stringify(props[coverPropKey], null, 2));
        } else {
            console.log("No specific 'Cover Image' property found in 'properties'.");
        }
    });

}

debugPosts();
