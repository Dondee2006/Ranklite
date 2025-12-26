
const fetch = require('node-fetch');

async function publishArticles() {
  const articles = [
    { id: '40278fa3-a6dc-4781-99d7-913a899d85cf', title: 'Mastering Best SEO' },
    { id: '7d0eed30-530c-4a8d-bbe2-17311194443f', title: '15 Best SEO marketing' },
    { id: '5a35d26b-14f7-4315-8337-95928d063182', title: 'Best Ranklite' },
    { id: 'cb73625c-dc06-49e6-9c39-32c9ba53ced8', title: 'The SEO marketing guide' },
    { id: '1989e468-35b1-4bff-8c58-0a88dca438a5', title: 'The 2025 Ultimate Guide' }
  ];

  const integrationId = 'e77e62a2-bd9d-4920-a6d7-0a02d922190d'; // The integration I just created for User B

  for (const article of articles) {
    console.log(`Publishing: ${article.title}...`);
    try {
      const response = await fetch('http://localhost:3000/api/cms/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId: article.id,
          platform: 'notion',
          integrationId: integrationId
        })
      });
      const data = await response.json();
      console.log(`Result for ${article.title}:`, data);
    } catch (error) {
      console.error(`Error publishing ${article.title}:`, error);
    }
  }
}

publishArticles();
