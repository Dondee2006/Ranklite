declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_SUPABASE_URL: string;
    NEXT_PUBLIC_SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    WIX_APP_ID?: string;
    WIX_APP_SECRET?: string;
    WEBFLOW_CLIENT_ID?: string;
    WEBFLOW_CLIENT_SECRET?: string;
  }
}
