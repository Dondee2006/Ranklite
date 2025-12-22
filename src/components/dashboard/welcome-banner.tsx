"use client";

import { useEffect, useState } from "react";
import { Sparkles, LayoutDashboard } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type Site = {
    name: string;
    url: string;
};

export function WelcomeBanner() {
    const [site, setSite] = useState<Site | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadSite() {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data: sites } = await supabase
                    .from("sites")
                    .select("name, url")
                    .eq("user_id", user.id)
                    .order("created_at", { ascending: true })
                    .limit(1);

                if (sites && sites.length > 0) {
                    setSite(sites[0]);
                }
            } catch (error) {
                console.error("Failed to load site for welcome banner:", error);
            } finally {
                setLoading(false);
            }
        }
        loadSite();
    }, []);

    if (loading) return (
        <div className="h-32 w-full animate-pulse bg-slate-100 rounded-lg" />
    );

    return (
        <div className="relative overflow-hidden bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
            {/* Decorative background elements */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-emerald-900/10 rounded-full blur-3xl" />

            <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-semibold tracking-wider uppercase">
                        <Sparkles className="h-3 w-3" />
                        Autopilot Active
                    </div>
                    <h2 className="text-3xl font-bold tracking-tight">
                        Welcome back to Ranklite!
                    </h2>
                    <p className="text-emerald-50 text-lg max-w-2xl">
                        {site
                            ? `Your SEO autopilot is actively growing ${site.name}.`
                            : "Your SEO autopilot is working on your organic growth."
                        }
                    </p>
                </div>

                <div className="flex items-center gap-4 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
                    <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                        <LayoutDashboard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <div className="text-xs text-emerald-100 font-medium uppercase tracking-wider">Active Site</div>
                        <div className="font-bold text-lg">{site?.name || "Initializing..."}</div>
                    </div>
                </div>
            </div>
        </div>
    );
}
