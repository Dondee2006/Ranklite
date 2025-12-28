import { supabaseAdmin } from './src/lib/supabase/admin';

async function main() {
    const { data: sites } = await supabaseAdmin.from('sites').select('id, domain, user_id');
    console.log('--- SITES ---');
    console.log(JSON.stringify(sites, null, 2));

    const { data: articles } = await supabaseAdmin.from('articles').select('id, title, user_id, status, site_id').eq('status', 'published');
    console.log('--- PUBLISHED ARTICLES ---');
    console.log(JSON.stringify(articles, null, 2));
}

main().catch(console.error);
