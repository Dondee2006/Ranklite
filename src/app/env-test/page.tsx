// Test if env vars are loaded correctly
console.log('=== ENV TEST ===');
console.log('NOTION_TOKEN exists:', !!process.env.NOTION_TOKEN);
console.log('NOTION_TOKEN value:', process.env.NOTION_TOKEN?.substring(0, 20) + '...');
console.log('NOTION_DATABASE_ID:', process.env.NOTION_DATABASE_ID);
console.log('================');

export default function EnvTest() {
    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>Environment Variable Test</h1>
            <p>NOTION_TOKEN: {process.env.NOTION_TOKEN ? '✅ Set' : '❌ Missing'}</p>
            <p>NOTION_DATABASE_ID: {process.env.NOTION_DATABASE_ID || '❌ Missing'}</p>
        </div>
    );
}
