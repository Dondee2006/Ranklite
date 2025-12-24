import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { generateAndUploadImage, ImageStyle } from "@/lib/image-gen";

export async function POST(request: Request) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { style, brandColor } = body;

        console.log(`Testing image style: ${style} with brand color: ${brandColor}`);

        const publicUrl = await generateAndUploadImage({
            prompt: "A beautiful, futuristic landscape representing innovation and growth",
            style: (style as ImageStyle) || "cinematic",
            brandColor: brandColor || "#22C55E",
            size: "1024x1024"
        });

        if (!publicUrl) {
            return NextResponse.json({ error: "Failed to generate image" }, { status: 500 });
        }

        return NextResponse.json({ success: true, url: publicUrl });
    } catch (error: any) {
        console.error("Test image generation error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
