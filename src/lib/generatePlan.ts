import { supabaseServer } from "./supabaseServer";
import { generateTopics, generateArticle } from "./ai";

export async function generate30DayPlan(userId: string, siteId: string) {
  const topics = await generateTopics();
  const today = new Date();

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    const html = await generateArticle(topic);

    const scheduled = new Date(today);
    scheduled.setDate(today.getDate() + i);

    await supabaseServer.from("articles").insert({
      site_id: siteId,
      user_id: userId,
      title: topic,
      content: html,
      status: "scheduled",
      scheduled_date: scheduled.toISOString().split("T")[0]
    });
  }
}
