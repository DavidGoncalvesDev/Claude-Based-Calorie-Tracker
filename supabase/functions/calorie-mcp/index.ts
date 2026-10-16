import { createClient } from "npm:@supabase/supabase-js@2.118.0";

const BASE = "https://eurqqiebokwcrrhfbihg.supabase.co/functions/v1/calorie-mcp";
const CONNECT = "https://davidpersonaltracker.netlify.app/connect.html";
const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];
const COLUMN_KEYS = ["calories", "protein_g", "carbs_g", "fat_g", "fiber_g", "sugar_g", "saturated_fat_g"];
const MICRO_KEYS = [
  "sodium_mg", "potassium_mg", "calcium_mg", "iron_mg", "magnesium_mg", "zinc_mg",
  "vit_a_mcg", "vit_c_mg", "vit_d_mcg", "vit_e_mg", "vit_k_mcg", "vit_b12_mcg",
  "folate_mcg", "vit_b6_mg",
];

const admin = createClient(
  Deno.env.get("SUPABASE_URL") ?? "https://eurqqiebokwcrrhfbihg.supabase.co",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
  { auth: { persistSession: false, autoRefreshToken: false } },
);

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const route = pathAfter(url.pathname);
  if (req.method === "OPTIONS") return cors(new Response(null, { status: 204 }));

  if (route === "/oauth-protected-resource" && req.method === "GET") {
    return json({
      resource: BASE,
      authorization_servers: [BASE],
      scopes_supported: ["meals"],
      bearer_methods_supported: ["header"],
    });
  }
  if ((route === "/.well-known/oauth-authorization-server" || route === "/.well-known/openid-configuration") && req.method === "GET") {
    return json(authMetadata());
  }
  if (route === "/register" && req.method === "POST") return register(req);
  if (route === "/authorize" && req.method === "GET") return authorize(url);
  if (route === "/callback" && req.method === "GET") {
    return Response.redirect(`${CONNECT}${url.search}`, 302);
  }
  if (route === "/mint" && req.method === "POST") return mint(req);
  if (route === "/token" && req.method === "POST") return token(req);
  if ((route === "/" || route === "/mcp") && req.method === "POST") return mcp(req);
  return unauthorized();
});

function pathAfter(pathname: string): string {
  const marker = "/calorie-mcp";
  const index = pathname.indexOf(marker);
  const rest = index >= 0 ? pathname.slice(index + marker.length) : pathname;
  return rest || "/";
}

function authMetadata() {
  return {
    issuer: BASE,
    authorization_endpoint: `${BASE}/authorize`,
    token_endpoint: `${BASE}/token`,
    registration_endpoint: `${BASE}/register`,
    response_types_supported: ["code"],
    grant_types_supported: ["authorization_code", "refresh_token"],
    code_challenge_methods_supported: ["S256"],
    token_endpoint_auth_methods_supported: ["none"],
    scopes_supported: ["meals", "offline_access"],
  };
}

function json(body: unknown, status = 200, extra: HeadersInit = {}): Response {
  return cors(new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", ...extra },
  }));
}

function page(message: string): Response {
  const target = new URL(CONNECT);
  target.searchParams.set("message", message);
  return Response.redirect(target.toString(), 302);
}

function cors(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", "*");
  headers.set("access-control-allow-headers", "authorization, content-type, accept");
  headers.set("access-control-allow-methods", "GET, POST, OPTIONS");
  return new Response(response.body, { status: response.status, headers });
}

function unauthorized(): Response {
  return json({ error: "sign_in_required" }, 401, {
    "www-authenticate": `Bearer resource_metadata="${BASE}/oauth-protected-resource"`,
  });
}

async function register(req: Request): Promise<Response> {
  const body = await req.json().catch(() => null) as { redirect_uris?: string[]; client_name?: string } | null;
  const redirects = Array.isArray(body?.redirect_uris) ? body.redirect_uris.filter((uri) => allowedRedirect(uri)) : [];
  if (!redirects.length) return json({ error: "invalid_redirect_uri" }, 400);
  const clientId = randomToken();
  const { error } = await admin.from("mcp_clients").insert({
    client_id: clientId,
    redirect_uris: redirects,
    client_name: String(body?.client_name || "Claude").slice(0, 120),
  });
  if (error) return json({ error: "server_error" }, 500);
  return json({
    client_id: clientId,
    client_id_issued_at: Math.floor(Date.now() / 1000),
    redirect_uris: redirects,
    token_endpoint_auth_method: "none",
    grant_types: ["authorization_code", "refresh_token"],
    response_types: ["code"],
  }, 201);
}

async function authorize(url: URL): Promise<Response> {
  const clientId = url.searchParams.get("client_id") || "";
  const redirectUri = url.searchParams.get("redirect_uri") || "";
  const challenge = url.searchParams.get("code_challenge") || "";
  const method = url.searchParams.get("code_challenge_method") || "";
  const state = url.searchParams.get("state") || "";
  if (!clientId || !allowedRedirect(redirectUri) || !challenge || method !== "S256" || !state) {
    return page("This connection request is missing a sign-in detail. Close this page and connect again from Claude.");
  }
  if (!(await clientAllows(clientId, redirectUri))) {
    return page("This Claude connection is not recognised. Remove it in Claude and add it again.");
  }
  const { data, error } = await admin.from("mcp_requests").insert({
    client_id: clientId,
    redirect_uri: redirectUri,
    code_challenge: challenge,
    state,
    expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
  }).select("id").single();
  if (error || !data) return page("Could not start sign-in. Close this page and try again.");
  return Response.redirect(`${CONNECT}?request=${data.id}`, 302);
}

async function mint(req: Request): Promise<Response> {
  const body = await req.json().catch(() => null) as { access_token?: string; request_id?: string } | null;
  const accessToken = body?.access_token || "";
  const requestId = body?.request_id || "";
  if (!accessToken || !requestId) return json({ message: "Sign in again from Claude." }, 400);
  const { data: userData, error: userError } = await admin.auth.getUser(accessToken);
  if (userError || !userData.user) return json({ message: "That sign-in expired. Connect again from Claude." }, 401);
  const { data: request } = await admin.from("mcp_requests").select("id, redirect_uri, state, expires_at").eq("id", requestId).maybeSingle();
  if (!request || new Date(request.expires_at).getTime() < Date.now()) {
    return json({ message: "This connection expired. Connect again from Claude." }, 400);
  }
  const code = randomToken();
  const { error } = await admin.from("mcp_codes").insert({
    code_hash: await sha256(code),
    request_id: request.id,
    user_id: userData.user.id,
    expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString(),
  });
  if (error) return json({ message: "Could not finish connecting. Try again from Claude." }, 500);
  const redirect = new URL(request.redirect_uri);
  redirect.searchParams.set("code", code);
  redirect.searchParams.set("state", request.state);
  return json({ redirect: redirect.toString() });
}

async function token(req: Request): Promise<Response> {
  const form = new URLSearchParams(await req.text());
  const grant = form.get("grant_type");
  if (grant === "refresh_token") return refresh(form.get("refresh_token") || "");
  if (grant !== "authorization_code") return json({ error: "unsupported_grant_type" }, 400);
  const code = form.get("code") || "";
  const verifier = form.get("code_verifier") || "";
  const redirectUri = form.get("redirect_uri") || "";
  if (!code || !verifier) return json({ error: "invalid_request" }, 400);
  const { data: row } = await admin.from("mcp_codes").select("code_hash, request_id, user_id, expires_at, used_at").eq("code_hash", await sha256(code)).maybeSingle();
  if (!row || row.used_at || new Date(row.expires_at).getTime() < Date.now()) return json({ error: "invalid_grant" }, 400);
  const { data: request } = await admin.from("mcp_requests").select("redirect_uri, code_challenge").eq("id", row.request_id).maybeSingle();
  if (!request || (redirectUri && request.redirect_uri !== redirectUri)) return json({ error: "invalid_grant" }, 400);
  if (await pkce(verifier) !== request.code_challenge) return json({ error: "invalid_grant" }, 400);
  await admin.from("mcp_codes").update({ used_at: new Date().toISOString() }).eq("code_hash", row.code_hash);
  return json(await issueTokens(row.user_id));
}

async function refresh(refreshToken: string): Promise<Response> {
  if (!refreshToken) return json({ error: "invalid_grant" }, 400);
  const hash = await sha256(refreshToken);
  const { data: row } = await admin.from("mcp_tokens").select("token_hash, user_id, kind, expires_at, replaced_by").eq("token_hash", hash).maybeSingle();
  if (!row || row.kind !== "refresh" || row.replaced_by || new Date(row.expires_at).getTime() < Date.now()) {
    return json({ error: "invalid_grant" }, 400);
  }
  const issued = await issueTokens(row.user_id);
  await admin.from("mcp_tokens").update({ replaced_by: await sha256(issued.refresh_token) }).eq("token_hash", hash);
  return json(issued);
}

async function issueTokens(userId: string) {
  const access = randomToken();
  const refreshToken = randomToken();
  const now = Date.now();
  const { error } = await admin.from("mcp_tokens").insert([
    { token_hash: await sha256(access), user_id: userId, kind: "access", expires_at: new Date(now + 60 * 60 * 1000).toISOString() },
    { token_hash: await sha256(refreshToken), user_id: userId, kind: "refresh", expires_at: new Date(now + 30 * 24 * 60 * 60 * 1000).toISOString() },
  ]);
  if (error) throw new Error("token");
  return { access_token: access, token_type: "Bearer", expires_in: 3600, refresh_token: refreshToken };
}

async function mcp(req: Request): Promise<Response> {
  const userId = await userIdFromAuth(req.headers.get("authorization"));
  if (!userId) return unauthorized();
  const message = await req.json().catch(() => null) as { id?: number | string; method?: string; params?: Record<string, unknown> } | null;
  if (!message?.method) return json({ jsonrpc: "2.0", id: null, error: { code: -32600, message: "Invalid request" } }, 400);
  if (message.id == null) return new Response(null, { status: 202 });
  try {
    const result = await toolCall(userId, message.method, message.params || {});
    return json({ jsonrpc: "2.0", id: message.id, result });
  } catch (error) {
    const text = error instanceof Error ? error.message : "Could not save that.";
    return json({
      jsonrpc: "2.0",
      id: message.id,
      result: { content: [{ type: "text", text }], isError: true },
    });
  }
}

async function toolCall(userId: string, method: string, params: Record<string, unknown>) {
  if (method === "initialize") {
    return {
      protocolVersion: "2025-03-26",
      capabilities: { tools: { listChanged: false } },
      serverInfo: { name: "calorie-tracker", version: "1.0.0" },
    };
  }
  if (method === "tools/list") return { tools: toolList() };
  if (method === "ping") return {};
  if (method !== "tools/call") throw new Error("Unknown request.");
  const name = String(params.name || "");
  const args = (params.arguments && typeof params.arguments === "object") ? params.arguments as Record<string, unknown> : {};
  let text = "";
  if (name === "log_foods") text = await logFoods(userId, args);
  else if (name === "day_summary") text = await daySummary(userId, args);
  else if (name === "undo_last") text = await undoLast(userId, args);
  else if (name === "set_goals") text = await setGoals(userId, args);
  else throw new Error("Unknown tool.");
  return { content: [{ type: "text", text }] };
}

function toolList() {
  const nutrientProps = Object.fromEntries([...COLUMN_KEYS, ...MICRO_KEYS].map((key) => [key, { type: "number" }]));
  return [
    {
      name: "log_foods",
      description: "Save each food in one meal onto the signed-in person's account. One item per food, not one combined blob.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["eaten_at", "meal_name", "items"],
        properties: {
          eaten_at: { type: "string", description: "ISO-8601 time, Europe/Lisbon." },
          meal_name: { type: "string", enum: MEAL_TYPES },
          items: {
            type: "array",
            minItems: 1,
            items: {
              type: "object",
              additionalProperties: false,
              required: ["item_name", ...COLUMN_KEYS, ...MICRO_KEYS],
              properties: {
                item_name: { type: "string" },
                portion: { type: "string" },
                notes: { type: "string" },
                ...nutrientProps,
              },
            },
          },
        },
      },
    },
    {
      name: "day_summary",
      description: "Read one Lisbon day for the signed-in person, including their goal.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: { date: { type: "string", description: "YYYY-MM-DD in Europe/Lisbon. Defaults to today." } },
      },
    },
    {
      name: "undo_last",
      description: "Delete the latest meal saved on a Lisbon day for the signed-in person.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        properties: { date: { type: "string", description: "YYYY-MM-DD in Europe/Lisbon. Defaults to today." } },
      },
    },
    {
      name: "set_goals",
      description: "Save the person's calorie goal and macro split. The three percentages must add up to 100.",
      inputSchema: {
        type: "object",
        additionalProperties: false,
        required: ["calories", "protein_pct", "carbs_pct", "fat_pct"],
        properties: {
          calories: { type: "number" },
          protein_pct: { type: "number" },
          carbs_pct: { type: "number" },
          fat_pct: { type: "number" },
        },
      },
    },
  ];
}

async function logFoods(userId: string, args: Record<string, unknown>): Promise<string> {
  const eatenAt = String(args.eaten_at || "");
  const mealName = String(args.meal_name || "");
  if (!MEAL_TYPES.includes(mealName)) throw new Error("meal_name must be Breakfast, Lunch, Dinner, or Snack.");
  const when = new Date(eatenAt);
  if (!eatenAt || Number.isNaN(when.getTime())) throw new Error("eaten_at must be an ISO time.");
  const items = Array.isArray(args.items) ? args.items : [];
  if (!items.length || items.length > 30) throw new Error("Send between 1 and 30 foods.");
  const groupId = crypto.randomUUID();
  const rows = items.map((raw) => readItem(raw, { userId, groupId, eatenAt: when.toISOString(), mealName }));
  const { error } = await admin.from("food_items").insert(rows);
  if (error) throw new Error("Could not save the meal.");
  return daySummary(userId, { date: lisbonDate(when) });
}

function readItem(raw: unknown, meal: { userId: string; groupId: string; eatenAt: string; mealName: string }) {
  if (!raw || typeof raw !== "object") throw new Error("Each food needs a name and nutrients.");
  const item = raw as Record<string, unknown>;
  const name = String(item.item_name || "").trim();
  if (!name) throw new Error("Each food needs a name.");
  const numbers: Record<string, number> = {};
  for (const key of [...COLUMN_KEYS, ...MICRO_KEYS]) numbers[key] = readNumber(item[key], key);
  const micros: Record<string, number> = {};
  for (const key of MICRO_KEYS) micros[key] = numbers[key];
  return {
    user_id: meal.userId,
    meal_group_id: meal.groupId,
    eaten_at: meal.eatenAt,
    meal_name: meal.mealName,
    item_name: name.slice(0, 200),
    portion: String(item.portion || "").trim().slice(0, 200) || null,
    notes: String(item.notes || "").trim().slice(0, 500) || null,
    calories: numbers.calories,
    protein_g: numbers.protein_g,
    carbs_g: numbers.carbs_g,
    fat_g: numbers.fat_g,
    fiber_g: numbers.fiber_g,
    sugar_g: numbers.sugar_g,
    saturated_fat_g: numbers.saturated_fat_g,
    micros,
  };
}

function readNumber(value: unknown, key: string): number {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100000) throw new Error(`${key} must be a number from 0 up.`);
  return parsed;
}

async function daySummary(userId: string, args: Record<string, unknown>): Promise<string> {
  const dateKey = /^\d{4}-\d{2}-\d{2}$/.test(String(args.date || "")) ? String(args.date) : lisbonDate(new Date());
  const bounds = dayBounds(dateKey);
  const [{ data: rows, error }, { data: profile }] = await Promise.all([
    admin.from("food_items").select("meal_name, item_name, portion, calories, protein_g, carbs_g, fat_g, fiber_g, sugar_g, saturated_fat_g, micros, eaten_at, meal_group_id, created_at").eq("user_id", userId).gte("eaten_at", bounds.start).lt("eaten_at", bounds.end).order("eaten_at"),
    admin.from("profiles").select("calorie_goal, protein_pct, carbs_pct, fat_pct, display_name").eq("id", userId).maybeSingle(),
  ]);
  if (error) throw new Error("Could not read this day.");
  const foods = rows || [];
  const sum = (key: string) => foods.reduce((total, row) => total + Number(row[key as keyof typeof row] || 0), 0);
  const goal = Number(profile?.calorie_goal) || 3000;
  const calories = sum("calories");
  return JSON.stringify({
    date: dateKey,
    timezone: "Europe/Lisbon",
    display_name: profile?.display_name || "",
    goal_kcal: goal,
    calories,
    remaining_kcal: Math.round(goal - calories),
    protein_g: round(sum("protein_g")),
    carbs_g: round(sum("carbs_g")),
    fat_g: round(sum("fat_g")),
    macro_split_pct: {
      protein: Number(profile?.protein_pct) || 24,
      carbs: Number(profile?.carbs_pct) || 46,
      fat: Number(profile?.fat_pct) || 30,
    },
    foods,
  });
}

async function undoLast(userId: string, args: Record<string, unknown>): Promise<string> {
  const dateKey = /^\d{4}-\d{2}-\d{2}$/.test(String(args.date || "")) ? String(args.date) : lisbonDate(new Date());
  const bounds = dayBounds(dateKey);
  const { data, error } = await admin.from("food_items").select("meal_group_id, created_at").eq("user_id", userId).gte("eaten_at", bounds.start).lt("eaten_at", bounds.end).order("created_at", { ascending: false }).limit(1);
  if (error) throw new Error("Could not undo that meal.");
  const groupId = data?.[0]?.meal_group_id;
  if (!groupId) throw new Error("Nothing is saved on that day.");
  const removed = await admin.from("food_items").delete().eq("user_id", userId).eq("meal_group_id", groupId);
  if (removed.error) throw new Error("Could not undo that meal.");
  return daySummary(userId, { date: dateKey });
}

async function setGoals(userId: string, args: Record<string, unknown>): Promise<string> {
  const calories = readNumber(args.calories, "calories");
  const protein = readNumber(args.protein_pct, "protein_pct");
  const carbs = readNumber(args.carbs_pct, "carbs_pct");
  const fat = readNumber(args.fat_pct, "fat_pct");
  if (calories <= 0 || calories > 20000) throw new Error("The calorie goal must be above 0.");
  if (protein > 100 || carbs > 100 || fat > 100 || Math.abs(protein + carbs + fat - 100) > 0.51) {
    throw new Error("Protein, carbs and fat percentages must add up to 100.");
  }
  const { error } = await admin.from("profiles").update({
    calorie_goal: Math.round(calories),
    protein_pct: protein,
    carbs_pct: carbs,
    fat_pct: fat,
  }).eq("id", userId);
  if (error) throw new Error("Could not save those goals.");
  return JSON.stringify({ calorie_goal: Math.round(calories), protein_pct: protein, carbs_pct: carbs, fat_pct: fat });
}

async function userIdFromAuth(header: string | null): Promise<string | null> {
  if (!header?.toLowerCase().startsWith("bearer ")) return null;
  const token = header.slice(7).trim();
  if (!token) return null;
  if (token.split(".").length === 3) {
    const { data, error } = await admin.auth.getUser(token);
    if (!error && data.user) return data.user.id;
  }
  const { data } = await admin.from("mcp_tokens").select("user_id, expires_at, kind").eq("token_hash", await sha256(token)).maybeSingle();
  if (!data || data.kind !== "access" || new Date(data.expires_at).getTime() < Date.now()) return null;
  return data.user_id;
}

async function clientAllows(clientId: string, redirectUri: string): Promise<boolean> {
  if (clientId.startsWith("https://")) return true;
  const { data } = await admin.from("mcp_clients").select("redirect_uris").eq("client_id", clientId).maybeSingle();
  return Array.isArray(data?.redirect_uris) && data.redirect_uris.includes(redirectUri);
}

function allowedRedirect(uri: string): boolean {
  if (uri === "https://claude.ai/api/mcp/auth_callback") return true;
  try {
    const url = new URL(uri);
    if (url.protocol !== "http:") return false;
    if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") return false;
    return url.pathname === "/callback";
  } catch {
    return false;
  }
}

function lisbonDate(date: Date): string {
  const parts = lisbonParts(date);
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function lisbonParts(date: Date): Record<string, string> {
  const format = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Lisbon",
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const part of format.formatToParts(date)) {
    if (part.type !== "literal") parts[part.type] = part.value;
  }
  if (parts.hour === "24") parts.hour = "00";
  return parts;
}

function dayBounds(dateKey: string): { start: string; end: string } {
  const start = lisbonWallToUtc(dateKey, "00:00:00");
  const [year, month, day] = dateKey.split("-").map(Number);
  const next = new Date(Date.UTC(year, month - 1, day + 1));
  const nextKey = `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, "0")}-${String(next.getUTCDate()).padStart(2, "0")}`;
  const end = lisbonWallToUtc(nextKey, "00:00:00");
  if (!start || !end) throw new Error("That date does not exist in Lisbon.");
  return { start: start.toISOString(), end: end.toISOString() };
}

function lisbonWallToUtc(dateKey: string, time: string): Date | null {
  const date = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey);
  const clock = /^(\d{2}):(\d{2}):(\d{2})$/.exec(time);
  if (!date || !clock) return null;
  const wanted = Date.UTC(+date[1], +date[2] - 1, +date[3], +clock[1], +clock[2], +clock[3]);
  let utc = wanted;
  for (let pass = 0; pass < 4; pass += 1) {
    const parts = lisbonParts(new Date(utc));
    const shown = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
    const diff = wanted - shown;
    if (diff === 0) return new Date(utc);
    utc += diff;
  }
  return null;
}

async function sha256(value: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return [...new Uint8Array(buf)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function pkce(verifier: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(verifier));
  return btoa(String.fromCharCode(...new Uint8Array(buf))).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function randomToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}
