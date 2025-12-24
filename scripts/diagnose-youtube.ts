import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function diagnose() {
    console.log('=== YouTube Video Diagnostic ===\n');

    // Check YouTube API Key
    console.log('1. YouTube API Key:', process.env.YOUTUBE_API_KEY ? '✅ Present' : '❌ Missing');

    // Check article settings
    const { data: settings, error: settingsError } = await supabase
        .from('article_settings')
        .select('*')
        .limit(1)
        .single();

    if (settingsError) {
        console.log('2. Article Settings:', '❌ Not found or error:', settingsError.message);
    } else {
        console.log('2. Article Settings:', '✅ Found');
        console.log('   - youtube_video enabled:', settings?.youtube_video ? '✅ YES' : '❌ NO');
        console.log('   - Settings:', JSON.stringify(settings, null, 2));
    }

    // Check recent articles
    const { data: articles, error: articlesError } = await supabase
        .from('articles')
        .select('id, title, content, html_content, created_at')
        .order('created_at', { ascending: false })
        .limit(3);

    if (articlesError) {
        console.log('\n3. Recent Articles:', '❌ Error:', articlesError.message);
    } else {
        console.log('\n3. Recent Articles:', articles?.length || 0, 'found');
        articles?.forEach((article, i) => {
            console.log(`\n   Article ${i + 1}: ${article.title}`);
            console.log('   - Created:', article.created_at);

            const hasShortcode = article.content?.includes('[YOUTUBE:') || article.html_content?.includes('[YOUTUBE:');
            const hasEmbed = article.html_content?.includes('youtube.com/embed/');
            const hasIframe = article.html_content?.includes('<iframe');

            console.log('   - Has [YOUTUBE:] shortcode:', hasShortcode ? '✅ YES' : '❌ NO');
            console.log('   - Has youtube.com/embed:', hasEmbed ? '✅ YES' : '❌ NO');
            console.log('   - Has <iframe>:', hasIframe ? '✅ YES' : '❌ NO');

            if (hasShortcode) {
                const match = (article.content || article.html_content)?.match(/\[YOUTUBE:([^\]]+)\]/);
                if (match) {
                    console.log('   - Video ID:', match[1]);
                }
            }
        });
    }

    console.log('\n=== End Diagnostic ===');
}

diagnose().catch(console.error);
