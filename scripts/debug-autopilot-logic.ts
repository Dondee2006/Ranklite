import fs from 'fs';
import path from 'path';

// 1. Load env before anything else
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
loadEnv();

// 2. Now import engine
import { AutopilotEngine } from "../src/lib/services/autopilot-engine";

async function debugAutopilot() {
    console.log('--- Debugging Autopilot Logic ---');
    const siteId = 'cd2703a5-2655-4162-a8e4-84e676b73a71';

    try {
        console.log(`Running autopilot for site: ${siteId}`);
        const result = await AutopilotEngine.runForSite(siteId, { force: true });
        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error('Autopilot failed:', error.message);
        if (error.stack) console.error(error.stack);
    }
}

debugAutopilot().catch(console.error);
