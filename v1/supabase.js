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
        // The admin page consumes password-recovery links from the URL.
        detectSessionInUrl: document.documentElement.dataset.authRedirect === "on",
      },
    }
  );
})();
