import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function checkArticles() {
    console.log('Checking articles for YouTube shortcodes...\n');

    const { data: articles, error } = await supabase
        .from('articles')
        .select('id, title, html_content, content')
        .eq('status', 'generated')
        .limit(3);

    if (error) {
        console.error('Error:', error);
        return;
    }

    if (!articles || articles.length === 0) {
        console.log('No generated articles found.');
        return;
    }

    articles.forEach((article, index) => {
        console.log(`\n--- Article ${index + 1}: ${article.title} ---`);
        console.log('ID:', article.id);

        const htmlSnippet = article.html_content?.substring(0, 500) || 'No HTML content';
        console.log('\nHTML Content (first 500 chars):');
        console.log(htmlSnippet);

        const hasYouTubeShortcode = article.html_content?.includes('[YOUTUBE:') || article.content?.includes('[YOUTUBE:');
        const hasYouTubeEmbed = article.html_content?.includes('youtube.com/embed/');

        console.log('\n✓ Has [YOUTUBE:] shortcode:', hasYouTubeShortcode);
        console.log('✓ Has youtube.com/embed:', hasYouTubeEmbed);
    });
}

checkArticles();
