(function () {
  if (typeof window.supabase === "undefined") return;
  const config = window.NEW_HOME_CONFIG || {};
  if (!config.supabaseUrl || !config.supabaseAnonKey) return;

  const { createClient } = window.supabase;
  window.sb = createClient(
    config.supabaseUrl,
    config.supabaseAnonKey,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    }
  );
})();
