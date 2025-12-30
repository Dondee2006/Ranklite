import React from 'react';

export default function JsonLd() {
    const schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Ranklite",
        "operatingSystem": "Web",
        "applicationCategory": "SEO Software",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": "4.9",
            "ratingCount": "120"
        },
        "description": "AI-powered SEO automation platform. Get recommended by ChatGPT and rank on Google with automated blog posts and backlinks.",
        "publisher": {
            "@type": "Organization",
            "name": "Ranklite",
            "logo": {
                "@type": "ImageObject",
                "url": "https://ranklite.site/icon.png"
            }
        }
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
    );
}
