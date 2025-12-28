import fs from 'fs';
import path from 'path';

function loadEnv() {
    try {
        const envPath = path.resolve(process.cwd(), '.env.local');
        const envContent = fs.readFileSync(envPath, 'utf8');
        const lines = envContent.split('\n');
        for (const line of lines) {
            const match = line.match(/^\s*([^#\s=]+)\s*=\s*(.*)$/);
            if (match) {
                const key = match[1];
                let value = match[2].trim();
                if (value.startsWith('"') && value.endsWith('"')) value = value.slice(1, -1);
                if (value.startsWith("'") && value.endsWith("'")) value = value.slice(1, -1);
                process.env[key] = value;
            }
        }
    } catch (e) {
        console.error("Could not load .env.local");
    }
}

async function debugImages() {
    loadEnv();
    const token = process.env.NOTION_ACCESS_TOKEN;
    const dbId = process.env.NOTION_DATABASE_ID;

    if (!token || !dbId) {
        console.error("Missing NOTION_ACCESS_TOKEN or NOTION_DATABASE_ID in .env.local");
        return;
    }

    console.log(`Querying Database: ${dbId}`);

    const response = await fetch(`https://api.notion.com/v1/databases/${dbId}/query`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Notion-Version': '2022-06-28',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            filter: {
                or: [
                    {
                        property: "Slug",
                        rich_text: {
                            equals: "transform-your-seo-writing-with-artificial-intelligence"
                        }
                    },
                    {
                        property: "Slug",
                        rich_text: {
                            equals: "top-choices-for-small-enterprises-ai-driven-seo-solutions"
                        }
                    }
                ]
            }
        })
    });

    if (!response.ok) {
        console.error("Fetch failed:", await response.text());
        return;
    }

    const data = await response.json();
    console.log(`Found ${data.results.length} matching posts.`);

    data.results.forEach((page: any, index: number) => {
        const title = page.properties.Title?.title[0]?.plain_text || page.properties.Name?.title[0]?.plain_text || "Untitled";
        console.log(`\n--- Post: "${title}" ---`);
        console.log(`ID: ${page.id}`);

        // Log the root 'cover' object
        console.log("Root 'cover' field:", JSON.stringify(page.cover, null, 2));

        // Log all property names for inspection
        console.log("Property names:", Object.keys(page.properties));

        // Specifically look for anything image-related in properties
        const imageProps = Object.keys(page.properties).filter(k =>
            k.toLowerCase().includes('image') ||
            k.toLowerCase().includes('cover') ||
            k.toLowerCase().includes('file') ||
            k.toLowerCase().includes('media')
        );

        imageProps.forEach(prop => {
            console.log(`Property '${prop}':`, JSON.stringify(page.properties[prop], null, 2));
        });
    });
}

debugImages();
