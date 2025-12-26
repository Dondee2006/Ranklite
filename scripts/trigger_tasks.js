const secret = "super-secret-cron-key-123";
const endpoints = [
  { url: "http://localhost:3000/api/autopilot/run", method: "POST" },
  { url: "http://localhost:3000/api/cron/backlink-worker", method: "GET" },
  { url: "http://localhost:3000/api/cms/cron/scheduled-publish", method: "POST" }
];

async function run() {
  for (const item of endpoints) {
    console.log(`Triggering ${item.url} using ${item.method}...`);
    try {
      const res = await fetch(item.url, {
        method: item.method,
        headers: { "Authorization": `Bearer ${secret}` }
      });
      const data = await res.text();
      console.log(`Response from ${item.url}: ${res.status} - ${data}`);
    } catch (e) {
      console.log(`Error triggering ${item.url}: ${e.message}`);
    }
  }
}
run();
