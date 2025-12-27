import { notion } from '@/lib/cms/notion';

export const dynamic = 'force-dynamic';

export default async function NotionDebugPage() {
    let posts = [];
    let error = null;
    let rawResponse = null;

    try {
        // Get the raw response
        const client = (notion as any).client;
        const dbId = (notion as any).databaseId;

        rawResponse = await (client.databases as any).query({
            database_id: dbId,
            sorts: [
                {
                    property: 'Published Date',
                    direction: 'descending',
                },
            ],
        });

        // Get transformed posts
        posts = await notion.getBlogPosts();
    } catch (e: any) {
        error = e.message;
    }

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>Notion Blog Debug</h1>

            <div style={{ marginBottom: '30px', padding: '15px', background: '#f5f5f5', borderRadius: '8px' }}>
                <h2>Database Info</h2>
                <p><strong>Database ID:</strong> {(notion as any).databaseId}</p>
                <p><strong>Token Set:</strong> {!!(notion as any).client ? '✅ Yes' : '❌ No'}</p>
            </div>

            {error && (
                <div style={{ marginBottom: '30px', padding: '15px', background: '#fee', borderRadius: '8px', color: '#c00' }}>
                    <h2>❌ Error</h2>
                    <pre>{error}</pre>
                </div>
            )}

            <div style={{ marginBottom: '30px', padding: '15px', background: '#eff', borderRadius: '8px' }}>
                <h2>Raw Notion Response</h2>
                <p><strong>Total Pages Found:</strong> {rawResponse?.results?.length || 0}</p>
                {rawResponse?.results && rawResponse.results.length > 0 && (
                    <div>
                        <h3>First Page Properties:</h3>
                        <pre style={{ background: '#fff', padding: '10px', overflow: 'auto', maxHeight: '300px' }}>
                            {JSON.stringify(Object.keys(rawResponse.results[0].properties || {}), null, 2)}
                        </pre>
                        <h3>First Page Full Data:</h3>
                        <pre style={{ background: '#fff', padding: '10px', overflow: 'auto', maxHeight: '400px' }}>
                            {JSON.stringify(rawResponse.results[0], null, 2)}
                        </pre>
                    </div>
                )}
            </div>

            <div style={{ marginBottom: '30px', padding: '15px', background: '#efe', borderRadius: '8px' }}>
                <h2>Transformed Blog Posts</h2>
                <p><strong>Total Posts:</strong> {posts.length}</p>
                {posts.length > 0 ? (
                    <div>
                        {posts.map((post: any, i: number) => (
                            <div key={i} style={{ marginBottom: '15px', padding: '10px', background: '#fff', borderRadius: '4px' }}>
                                <h3>{post.title}</h3>
                                <p><strong>Slug:</strong> {post.slug || '❌ MISSING'}</p>
                                <p><strong>Excerpt:</strong> {post.excerpt || '(none)'}</p>
                                <p><strong>Date:</strong> {post.date}</p>
                                <p><strong>Category:</strong> {post.category}</p>
                                <p><strong>Status:</strong> {post.status}</p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p style={{ color: '#c00' }}>❌ No posts found after transformation</p>
                )}
            </div>
        </div>
    );
}
