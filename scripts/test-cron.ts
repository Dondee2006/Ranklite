import dotenv from "dotenv";
import path from "path";
import fetch from "node-fetch";

// Explicitly load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function testAuth() {
    console.log("Testing Process Endpoint Auth...");
    console.log("CRON_SECRET:", process.env.CRON_SECRET);

    const url = "http://localhost:3000/api/content-calendar/generate-bulk/process";

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.CRON_SECRET}`
            },
            body: JSON.stringify({ jobId: "test-job-id", month: 12, year: 2025 })
        });

        console.log("Response Status:", response.status);
        const data = await response.json();
        console.log("Response Data:", data);

        if (response.status === 401) {
            console.error("FAIL: Authorization refused.");
        } else if (response.status === 404 && data.error === "Job not found") {
            console.log("SUCCESS: Authorization passed (Job not found is expected).");
        } else {
            console.log("Unexpected response, but likely Auth passed.");
        }

    } catch (error) {
        console.error("Fetch error:", error);
    }
}

testAuth();
