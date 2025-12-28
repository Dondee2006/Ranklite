const https = require('https');
const fs = require('fs');

async function main() {
    const token = 'ntn_F9011703468xGOt6hpzGkzmHGp2RJ2dvAYVzZ9KtoyT6v0';
    const dbId = '2d321923-aeac-8087-b744-d6f6d497b3b5';

    async function queryAll() {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.notion.com',
                path: `/v1/databases/${dbId}/query`,
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Notion-Version': '2022-06-28',
                    'Content-Type': 'application/json'
                }
            };

            const req = https.request(options, (res) => {
                let data = '';
                res.on('data', (chunk) => data += chunk);
                res.on('end', () => resolve(JSON.parse(data)));
            });

            req.on('error', reject);
            req.write(JSON.stringify({}));
            req.end();
        });
    }

    const data = await queryAll();
    const logPath = 'notion-debug.log';
    fs.writeFileSync(logPath, `Found ${data.results?.length || 0} pages.\n`);

    if (data.results) {
        data.results.forEach((page, i) => {
            const props = page.properties;
            let title = 'Untitled';
            for (const key in props) {
                if (props[key].type === 'title') {
                    title = props[key].title[0]?.plain_text || 'Untitled';
                    break;
                }
            }
            const hasCover = !!page.cover;
            const hasFiles = props['Files & media']?.files?.length > 0;
            const line = `${i + 1}. "${title}" | Cover: ${hasCover} | Files: ${hasFiles}\n`;
            fs.appendFileSync(logPath, line);
        });
    }
    console.log(`Debug results written to ${logPath}`);
}

main().catch(console.error);
