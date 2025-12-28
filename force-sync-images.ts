import { getArticleBySlug } from "./src/lib/cms/supabase-articles";

async function main() {
    const slugs = [
        "transform-your-seo-writing-with-artificial-intelligence",
        "top-choices-for-small-enterprises-ai-driven-seo-solutions"
    ];

    console.log("--- Starting Force Sync ---");
    for (const slug of slugs) {
        console.log(`Syncing ${slug}...`);
        const post = await getArticleBySlug(slug);
        if (post) {
            console.log(`Successfully synced ${slug}. Image URL: ${post.coverImage}`);
        } else {
            console.log(`Failed to find or sync ${slug}`);
        }
    }
    console.log("--- Force Sync Complete ---");
}

main().catch(console.error);
