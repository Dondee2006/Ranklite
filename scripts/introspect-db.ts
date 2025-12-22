import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function introspect(tableName: string) {
    console.log(`\nIntrospecting table: ${tableName}`);

    // This approach uses an empty insert to trigger a column mismatch error which lists columns, 
    // OR we can try to query an existing row and look at keys.
    const { data, error } = await supabase
        .from(tableName)
        .select("*")
        .limit(1);

    if (error) {
        console.error(`Error fetching from ${tableName}:`, error);
        return;
    }

    if (data && data.length > 0) {
        console.log("Found row. Columns:");
        const columns = Object.keys(data[0]);
        columns.sort().forEach(col => {
            console.log(`  - ${col} (Type estimated: ${typeof data[0][col]})`);
        });
    } else {
        console.log("No data found to introspect columns.");
    }
}

async function run() {
    await introspect("articles");
    await introspect("sites");
}

run();
