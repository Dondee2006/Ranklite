import { supabaseServer } from "@/lib/supabaseServer";
import { publishToBlog } from "@/lib/publisher";

export async function GET() {
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const currentTimeStr = now.toTimeString().split(" ")[0]; // "HH:MM:SS"

  const { data: articles } = await supabaseServer
    .from("articles")
    .select("*")
    .eq("status", "scheduled")
    .eq("scheduled_date", today)
    .or(`scheduled_time.is.null,scheduled_time.lte.${currentTimeStr}`);

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
