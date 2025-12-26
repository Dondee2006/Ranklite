
async function testYouTube() {
  const apiKey = "AIzaSyBgEcWWLPByKjJQiL6sqEI8DSWQZ625vBw";
  const keyword = "SEO tutorial";
  const searchQuery = encodeURIComponent(`${keyword} tutorial guide`);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${searchQuery}&type=video&videoDuration=medium&videoDefinition=high&maxResults=1&key=${apiKey}`;
  
  console.log("Testing YouTube API...");
  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("YouTube Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("Fetch error:", err);
  }
}

testYouTube();
