async function main() {
  const secret = "super-secret-cron-key-123";
  const url = "http://localhost:3000/api/autopilot/run";
  
  console.log(`Triggering autopilot run at ${url}...`);
  
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${secret}`
      }
    });
    
    const data = await response.json();
    console.log("Response:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error triggering autopilot:", error);
  }
}

main();
