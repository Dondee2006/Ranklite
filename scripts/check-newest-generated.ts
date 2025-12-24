import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkNewestArticle() {
    const { data: article, error } = await supabase
        .from('articles')
        .select('id, title, content, html_content, status, created_at')
        .eq('status', 'generated')
        .order('updated_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('=== NEWEST GENERATED ARTICLE ===');
    console.log('Title:', article.title);
    console.log('Status:', article.status);
    console.log('Created:', article.created_at);

    console.log('\n--- CONTENT CHECK ---');
    console.log('Has content:', article.content ? 'YES ✅' : 'NO ❌');
    console.log('Has html_content:', article.html_content ? 'YES ✅' : 'NO ❌');
    console.log('Content length:', article.content?.length || 0);

    console.log('\n--- YOUTUBE CHECK ---');
    const hasYouTubeShortcode = article.content?.includes('[YOUTUBE:');
    const hasYouTubeEmbed = article.html_content?.includes('youtube.com/embed');

    console.log('Has [YOUTUBE:] shortcode:', hasYouTubeShortcode ? 'YES ✅' : 'NO ❌');
    console.log('Has youtube.com/embed:', hasYouTubeEmbed ? 'YES ✅' : 'NO ❌');

    if (hasYouTubeShortcode) {
        const match = article.content?.match(/\[YOUTUBE:([^\]]+)\]/);
        if (match) {
            console.log('Video ID:', match[1]);
            console.log('Full shortcode:', match[0]);
        }
    }

    console.log('\n--- FIRST 500 CHARS OF CONTENT ---');
    console.log(article.content?.substring(0, 500));
}

checkNewestArticle();
