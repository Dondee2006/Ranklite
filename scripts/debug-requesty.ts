
async function test() {
  const apiKey = "rqsty-sk-fVztxJJqRZqenrA9RJjvBxNYiq8myfuuMufFS0szzot/b8/2l14p8FJRaHZZfLAIyqz1cX+lgBvKF3bKuQuB3ZBZ7u8Pq2bPO5+bh3tzDwM=";
  const response = await fetch("https://router.requesty.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: "Hello" }],
      max_tokens: 5
    })
  });
  
  const data = await response.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
