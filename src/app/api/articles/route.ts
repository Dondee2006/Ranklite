import { NextResponse } from "next/server";

// Mock data - replace with real implementation
export async function GET(request: Request) {
  return NextResponse.json({ articles: [] });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ 
    article: { 
      id: Date.now().toString(), 
      ...body 
    } 
  });
}
