
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

async function createBucket() {
    console.log("Creating 'article-images' storage bucket...");

    const { data, error } = await supabase
        .storage
        .createBucket('article-images', {
            public: true,
            fileSizeLimit: 5242880, // 5MB
            allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
        });

    if (error) {
        if (error.message.includes('already exists')) {
            console.log("Bucket 'article-images' already exists.");
        } else {
            console.error("Error creating bucket:", error);
            process.exit(1);
        }
    } else {
        console.log("Bucket 'article-images' created successfully.");
    }

    // Verify access by listing buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
        console.error("Error listing buckets:", listError);
    } else {
        const exists = buckets.find(b => b.name === 'article-images');
        if (exists) {
            console.log("Verification: Bucket 'article-images' is present.");
        } else {
            console.error("Verification failed: Bucket not found in list.");
        }
    }
}

createBucket();
