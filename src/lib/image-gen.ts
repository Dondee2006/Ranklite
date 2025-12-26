import OpenAI from "openai";
import { createClient } from "@/lib/supabase/server";
import { v4 as uuidv4 } from "uuid";

const getOpenAIClient = () => {
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
        return null;
    }
    return new OpenAI({
        apiKey: apiKey,
    });
};

export type ImageStyle = "brand-text" | "watercolor" | "cinematic" | "illustration" | "sketch";

interface GenerateImageOptions {
    prompt: string;
    style: ImageStyle;
    brandColor?: string;
    size?: "1024x1024" | "1024x1792" | "1792x1024";
}

export async function generateAndUploadImage(options: GenerateImageOptions) {
    const { prompt, style, brandColor = "#22C55E", size = "1792x1024" } = options;

    const openai = getOpenAIClient();
    if (!openai) {
        console.warn("OPENAI_API_KEY is missing, skipping image generation.");
        return null;
    }

    // 1. Refine prompt based on style
    let refinedPrompt = prompt;
    const styleDescriptions: Record<ImageStyle, string> = {
        "brand-text": `A professional, modern graphic with clean typography. Incorporate a background accent in color ${brandColor}. High-end corporate aesthetic.`,
        "watercolor": `A beautiful, artistic watercolor painting. Soft edges, visible paper texture, delicate color washes. Artistic and hand-painted feel. Use ${brandColor} as a primary accent color.`,
        "cinematic": `Highly detailed cinematic shot, dramatic lighting, 8k resolution, photorealistic, depth of field, wide-angle lens. Professional movie-still quality. Subtle use of ${brandColor} in lighting or elements.`,
        "illustration": `Modern flat vector illustration, clean lines, vibrant colors, minimalist design. High-quality digital art style. ${brandColor} should be a major brand color in the illustration.`,
        "sketch": `A hand-drawn pencil and charcoal sketch. Artistic shading, cross-hatching, high contrast. Rough but professional hand-drawn aesthetic. Accent with ${brandColor} ink strokes.`,
    };

    refinedPrompt = `${prompt}. Style: ${styleDescriptions[style]}. Ensure the composition is professional and suitable for a high-quality blog post.`;

    try {
        // 2. Generate image via OpenAI
        const response = await openai.images.generate({
            model: "dall-e-3",
            prompt: refinedPrompt,
            n: 1,
            size: size,
            response_format: "url",
        });

        const imageUrl = response.data[0].url;
        if (!imageUrl) throw new Error("No image URL returned from OpenAI");

        // 3. Download image
        const imageRes = await fetch(imageUrl);
        const arrayBuffer = await imageRes.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // 4. Upload to Supabase Storage
        const supabase = await createClient();
        const fileName = `${uuidv4()}.png`;
        const filePath = `article-images/${fileName}`;

        // Ensure bucket exists (or fallback to public URL if upload fails)
        const { data, error: uploadError } = await supabase.storage
            .from("article-images")
            .upload(filePath, buffer, {
                contentType: "image/png",
                cacheControl: "3600",
                upsert: false,
            });

        if (uploadError) {
            console.error("Supabase storage upload error:", uploadError);
            // If upload fails, return the OpenAI URL (temporary fallback)
            return imageUrl;
        }

        // 5. Get Public URL
        const { data: { publicUrl } } = supabase.storage
            .from("article-images")
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (error) {
        console.error("Image generation/upload failed:", error);
        return null;
    }
}
