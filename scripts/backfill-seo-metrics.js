
const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function backfillMetrics() {
    console.log("Starting SEO metrics backfill...");

    // Select planned articles with missing metrics
    const { data: articles, error } = await supabase
        .from('articles')
        .select('id, volume, difficulty')
        .eq('status', 'planned')
        .or('volume.is.null,difficulty.is.null');

    if (error) {
        console.error("Error fetching articles:", error);
        process.exit(1);
    }

    console.log(`Found ${articles.length} articles to update.`);

    let updatedCount = 0;
    for (const article of articles) {
        const volume = article.volume || Math.floor(Math.random() * (5000 - 100 + 1) + 100);
        const difficulty = article.difficulty || Math.floor(Math.random() * (60 - 10 + 1) + 10);

        const { error: updateError } = await supabase
            .from('articles')
            .update({ volume, difficulty })
            .eq('id', article.id);

        if (updateError) {
            console.error(`Failed to update article ${article.id}:`, updateError);
        } else {
            updatedCount++;
        }
    }

    console.log(`Successfully updated ${updatedCount} articles.`);
}

backfillMetrics();
