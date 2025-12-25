import { notion } from '@/lib/cms/notion';

export default function DebugNotion() {
    // Access the private property via any cast for debugging
    const dbId = (notion as any).databaseId;

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>Notion Client Debug</h1>
            <p>Database ID being used: <strong>{dbId || 'UNDEFINED'}</strong></p>
            <p>Expected: 2d321923aeac8087b744d6f6d497b3b5</p>
            <p>Match: {dbId === '2d321923aeac8087b744d6f6d497b3b5' ? '✅ YES' : '❌ NO'}</p>
        </div>
    );
}
