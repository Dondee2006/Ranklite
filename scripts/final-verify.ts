import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyFinal() {
    const SITE_ID = "4d593d19-f8bc-401d-a7b3-aceaefd484f3";
    const USER_ID = "2e893c56-66e4-44c5-bf00-7a50787fc09d";

    console.log("Verifying article storage with full metadata...");

    const dummyArticle = {
        site_id: SITE_ID,
        user_id: USER_ID,
        title: "Final Verification Article",
        slug: "final-verification-article",
        content: "# Final Test\nThis is a test of the new schema.",
        html_content: "<h1>Final Test</h1><p>This is a test of the new schema.</p>",
        meta_description: "A final test article to verify the schema fix.",
        keyword: "SEO Testing",
        article_type: "guide",
        search_intent: "informational",
        status: "draft",
        scheduled_date: "2025-12-31",
        outline: { sections: ["Introduction", "Main Content", "Conclusion"] },
        images: [{ url: "https://placehold.co/600x400", alt: "Test image" }]
    };

    const { data, error } = await supabase
        .from("articles")
        .insert(dummyArticle)
        .select()
        .single();

    if (error) {
        console.error("Verification FAILED:", error);
    } else {
        console.log("Verification SUCCEEDED! Article ID:", data.id);
        console.log("Successfully stored HTML Content and Outline.");
    }
}

verifyFinal();
