import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkLatestArticle() {
    const { data: articles, error } = await supabase
        .from('articles')
        .select('id, title, content, html_content, created_at')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log('=== LATEST ARTICLE ===');
    console.log('Title:', articles.title);
    console.log('Created:', articles.created_at);
    console.log('\n--- CONTENT (first 1000 chars) ---');
    console.log(articles.content?.substring(0, 1000));
    console.log('\n--- HTML_CONTENT (first 1000 chars) ---');
    console.log(articles.html_content?.substring(0, 1000));

    console.log('\n--- CHECKS ---');
    console.log('Has [YOUTUBE:] in content:', articles.content?.includes('[YOUTUBE:') ? 'YES' : 'NO');
    console.log('Has [YOUTUBE:] in html_content:', articles.html_content?.includes('[YOUTUBE:') ? 'YES' : 'NO');
    console.log('Has youtube.com/embed:', articles.html_content?.includes('youtube.com/embed') ? 'YES' : 'NO');
}

checkLatestArticle();
