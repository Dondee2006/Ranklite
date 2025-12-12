import { supabaseServer } from "@/lib/supabaseServer";
import { publishToBlog } from "@/lib/publisher";

export async function GET() {
  const today = new Date().toISOString().split("T")[0];

  const { data: articles } = await supabaseServer
    .from("articles")
    .select("*")
    .eq("status", "scheduled")
    .eq("scheduled_date", today);

  if (!articles) return Response.json({ published: 0 });

  for (const article of articles) {
    await publishToBlog(article);

    await supabaseServer
      .from("articles")
      .update({ status: "published" })
      .eq("id", article.id);
  }

  return Response.json({ published: articles.length });
}
