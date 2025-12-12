import { supabaseServer } from "@/lib/supabaseServer";

export async function GET() {
  const {
    data: { user }
  } = await supabaseServer.auth.getUser();

  const { data } = await supabaseServer
    .from("articles")
    .select("*")
    .eq("user_id", user.id)
    .order("scheduled_date", { ascending: true });

  return Response.json(data);
}
