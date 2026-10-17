import { createClient } from "npm:@supabase/supabase-js@2.118.0";

const DOMAIN = "users.calorie-tracker.app";
const WINDOW_MS = 10 * 60 * 1000;
const MAX_ATTEMPTS = 12;

const url = Deno.env.get("SUPABASE_URL") ?? "";
const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";

const admin = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const anon = createClient(url, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return cors(new Response(null, { status: 204 }));
  if (req.method !== "POST") return json({ message: "Sign in from the site." }, 405);
  if (!url || !serviceKey || !anonKey) return json({ message: "Could not open that username. Try again." }, 500);

  const body = await req.json().catch(() => null) as { username?: string; codename?: string } | null;
  const typed = String(body?.username || body?.codename || "").trim();
  const word = typed.toLowerCase();
  if (!/^[a-z][a-z0-9]{2,31}$/.test(word)) {
    return json({ message: "Use a username of 3 to 32 letters or numbers, starting with a letter." }, 400);
  }

  const ip = clientIp(req);
  if (await limited(ip)) {
    return json({ message: "Too many tries. Wait a few minutes, then try that username again." }, 429);
  }
  await admin.from("codename_attempts").insert({ ip });
  await admin.from("codename_attempts").delete().lt("created_at", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  const email = `${word}@${DOMAIN}`;
  const password = await passwordFor(word);
  let session = await signIn(email, password);
  if (!session) {
    const created = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name: typed },
    });
    const already = created.error && /already|exists|registered/i.test(created.error.message);
    if (created.error && !already) {
      console.error("createUser", created.error.message);
      return json({ message: "Could not open that username. Try again." }, 500);
    }
    session = await signIn(email, password);
  }
  if (!session) return json({ message: "Could not open that username. Try again." }, 500);
  return json({ access_token: session.access_token, refresh_token: session.refresh_token });
});

async function signIn(email: string, password: string) {
  const { data, error } = await anon.auth.signInWithPassword({ email, password });
  if (error || !data.session) {
    if (error && !/invalid login credentials/i.test(error.message)) console.error("signIn", error.message);
    return null;
  }
  return data.session;
}

async function passwordFor(word: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(serviceKey),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(`codename:${word}`));
  return [...new Uint8Array(signature)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function limited(ip: string): Promise<boolean> {
  const since = new Date(Date.now() - WINDOW_MS).toISOString();
  const { count, error } = await admin
    .from("codename_attempts")
    .select("id", { count: "exact", head: true })
    .eq("ip", ip)
    .gte("created_at", since);
  if (error) {
    console.error("rate", error.message);
    return true;
  }
  return (count ?? 0) >= MAX_ATTEMPTS;
}

function clientIp(req: Request): string {
  const forwarded = req.headers.get("cf-connecting-ip")
    || req.headers.get("x-real-ip")
    || req.headers.get("x-forwarded-for")
    || "";
  const ip = forwarded.split(",")[0].trim();
  return ip.slice(0, 80) || "unknown";
}

function json(body: unknown, status = 200): Response {
  return cors(new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json" },
  }));
}

function cors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-headers", "authorization, content-type, apikey");
  headers.set("access-control-allow-methods", "POST, OPTIONS");
  return new Response(response.body, { status: response.status, headers });
}
