/* David Tracker
   Calorie and macro goals are chosen on the Definitions page and saved on this device.
   The key in this file is the public publishable key. Never put the service_role key here.
*/
(() => {
  const SUPABASE_URL = "https://eurqqiebokwcrrhfbihg.supabase.co";
  const SUPABASE_KEY = "sb_publishable_IYwulskgj7ReZdjiyPa63A_pWxKYXn7";
  const TZ = "Europe/Lisbon";
  const THEME_KEY = "calorie-tracker-theme";
  const GOALS_KEY = "calorie-tracker-goals";
  const RECENT_KEY = "calorie-tracker-recent";
  const THEMES = [
    { id: "light", label: "Light", color: "#f6f5f2", swatch: "#f6f5f2" },
    { id: "dark", label: "Dark", color: "#121212", swatch: "#5c5c5c" },
    { id: "blue", label: "Dark blue", color: "#0b1220", swatch: "#60a5fa" },
    { id: "green", label: "Dark green", color: "#0c1410", swatch: "#34d399" },
    { id: "warm", label: "Warm", color: "#1a1410", swatch: "#f0a36b" },
  ];
  const DEFAULT_GOALS = { calories: 3000, protein: 24, carbs: 46, fat: 30 };
  const MEAL_TYPES = ["Breakfast", "Lunch", "Dinner", "Snack"];

  // type "goal" means aim to reach it. type "limit" means try to stay under it.
  const TARGETS = [
    { key: "calories", label: "Calories", unit: "kcal", target: 3000, type: "goal" },
    { key: "protein_g", label: "Protein", unit: "g", target: 180, type: "goal" },
    { key: "carbs_g", label: "Carbs", unit: "g", target: 350, type: "goal" },
    { key: "fat_g", label: "Fat", unit: "g", target: 100, type: "goal" },
    { key: "fiber_g", label: "Fiber", unit: "g", target: 38, type: "goal" },
    { key: "sugar_g", label: "Sugar", unit: "g", target: 50, type: "limit" },
    { key: "saturated_fat_g", label: "Saturated fat", unit: "g", target: 33, type: "limit" },
    { key: "sodium_mg", label: "Sodium", unit: "mg", target: 2300, type: "limit" },
    { key: "potassium_mg", label: "Potassium", unit: "mg", target: 3400, type: "goal" },
    { key: "calcium_mg", label: "Calcium", unit: "mg", target: 1000, type: "goal" },
    { key: "iron_mg", label: "Iron", unit: "mg", target: 8, type: "goal" },
    { key: "magnesium_mg", label: "Magnesium", unit: "mg", target: 420, type: "goal" },
    { key: "zinc_mg", label: "Zinc", unit: "mg", target: 11, type: "goal" },
    { key: "vit_a_mcg", label: "Vitamin A", unit: "mcg", target: 900, type: "goal" },
    { key: "vit_c_mg", label: "Vitamin C", unit: "mg", target: 90, type: "goal" },
    { key: "vit_d_mcg", label: "Vitamin D", unit: "mcg", target: 15, type: "goal" },
    { key: "vit_e_mg", label: "Vitamin E", unit: "mg", target: 15, type: "goal" },
    { key: "vit_k_mcg", label: "Vitamin K", unit: "mcg", target: 120, type: "goal" },
    { key: "vit_b12_mcg", label: "Vitamin B12", unit: "mcg", target: 2.4, type: "goal" },
    { key: "folate_mcg", label: "Folate", unit: "mcg", target: 400, type: "goal" },
    { key: "vit_b6_mg", label: "Vitamin B6", unit: "mg", target: 1.7, type: "goal" },
  ];

  const COLUMN_KEYS = new Set(["calories", "protein_g", "carbs_g", "fat_g", "fiber_g", "sugar_g", "saturated_fat_g"]);
  const TARGET_BY_KEY = Object.fromEntries(TARGETS.map((target) => [target.key, target]));
  const ICONS = {
    day: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 8v4l2.5 2" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    week: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 17l5-5 3.2 3.2L20 7" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    month: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M4 9h16M8 3.5v3M16 3.5v3" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    weight: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 8.2h8M12 8.2V12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><rect x="4.5" y="12" width="15" height="7.2" rx="2" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>',
    add: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    gear: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/><circle cx="8" cy="7" r="2.2" fill="var(--bg)" stroke="currentColor" stroke-width="1.8"/><circle cx="16" cy="12" r="2.2" fill="var(--bg)" stroke="currentColor" stroke-width="1.8"/><circle cx="10" cy="17" r="2.2" fill="var(--bg)" stroke="currentColor" stroke-width="1.8"/></svg>',
    sun: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5 5l1.8 1.8M17.2 17.2 19 19M19 5l-1.8 1.8M6.8 17.2 5 19" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
    moon: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 3.5A8 8 0 1 0 20.5 14 6.5 6.5 0 0 1 15 3.5Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"/></svg>',
    left: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14.5 5.5 8 12l6.5 6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    right: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9.5 5.5 16 12l-6.5 6.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>',
    close: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>',
  };

  const WEIGHT_SETTINGS_KEY = "calorie-tracker-weight-settings";

  function loadWeightSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem(WEIGHT_SETTINGS_KEY) || "null");
      return {
        objective: saved?.objective || "lose",
      };
    } catch {
      return { objective: "lose" };
    }
  }

  const initialWeightSettings = loadWeightSettings();
  const root = document.getElementById("app");
  const savedTheme = localStorage.getItem(THEME_KEY);
  const state = {
    booting: true,
    bootError: "",
    view: "day",
    theme: savedTheme || "light",
    dateKey: "",
    items: [],
    loading: false,
    error: "",
    toast: "",
    editingId: "",
    mealTimeGroup: "",
    confirm: null,
    saving: false,
    session: null,
    profile: null,
    authError: "",
    signingIn: false,
    period: {
      kind: "week",
      anchor: "",
      items: [],
      loading: false,
      error: "",
    },
    weight: {
      entries: [],
      loading: false,
      error: "",
      loaded: false,
      objective: initialWeightSettings.objective,
    },
    nutrientModal: null,
  };

  let client = null;
  let charts = [];
  let dayToken = 0;
  let trendToken = 0;
  let weightToken = 0;
  let addMealToken = 0;
  let toastTimer = 0;
  let paintedView = "";

  if (!window.supabase || typeof window.supabase.createClient !== "function") {
    root.innerHTML = '<p class="boot">Could not load the app. Check your connection and refresh.</p>';
    return;
  }

  try {
    client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
    });
  } catch {
    root.innerHTML = '<p class="boot">Could not start sign-in. Check your connection and refresh.</p>';
    return;
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[char]));
  }

  function isUuid(value) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(value || ""));
  }

  function userId() {
    const id = state.session?.user?.id || "";
    return isUuid(id) ? id : "";
  }

  function displayNameFrom(user) {
    const meta = user?.user_metadata || {};
    const raw = meta.full_name || meta.name || String(user?.email || "").split("@")[0] || "Me";
    return String(raw).trim().slice(0, 80) || "Me";
  }

  function firstName() {
    const name = state.profile?.display_name || displayNameFrom(state.session?.user);
    return name.split(/\s+/)[0] || "Tracker";
  }

  function recentStorageKey() {
    const id = userId();
    return id ? `${RECENT_KEY}:${id}` : RECENT_KEY;
  }

  function saveWeightSettings(updates) {
    const current = {
      objective: state.weight.objective,
      ...updates,
    };
    state.weight.objective = current.objective;
    try {
      localStorage.setItem(WEIGHT_SETTINGS_KEY, JSON.stringify(current));
    } catch {}
    const uid = userId();
    if (uid && client && updates.objective) {
      if (state.profile) state.profile.weight_objective = updates.objective;
      client.from("profiles").update({ weight_objective: updates.objective }).eq("id", uid).then(() => {}).catch(() => {});
    }
  }

  function num(value) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function fmtInt(value) {
    return Math.round(Number(value) || 0).toLocaleString("en-GB");
  }

  function fmtAmount(value) {
    const parsed = Number(value) || 0;
    if (Math.abs(parsed) >= 100) return Math.round(parsed).toLocaleString("en-GB");
    return (Math.round(parsed * 10) / 10).toLocaleString("en-GB", { maximumFractionDigits: 1 });
  }

  function displayNumber(value) {
    if (value == null || value === "") return "";
    const parsed = Number(value);
    return Number.isFinite(parsed) ? String(parsed) : "";
  }

  function parseOptionalNumber(raw) {
    let text = String(raw ?? "").trim().replace(/\s/g, "");
    if (!text) return null;
    if (text.includes(",") && text.includes(".")) {
      if (text.lastIndexOf(",") > text.lastIndexOf(".")) text = text.replace(/\./g, "").replace(",", ".");
      else text = text.replace(/,/g, "");
    } else if (text.includes(",")) {
      text = text.replace(",", ".");
    }
    const parsed = Number(text);
    return Number.isFinite(parsed) ? parsed : NaN;
  }

  function numberError(parsed) {
    if (Number.isNaN(parsed)) return "Check the numbers. Use a blank for unknown, or a number that is not negative. A comma or a dot is fine.";
    if (parsed != null && parsed < 0) return "Nutrients cannot be negative.";
    if (parsed != null && parsed > 100000) return "One of those numbers looks too big. Check it and try again.";
    return "";
  }

  function goals() {
    const profile = state.profile;
    if (profile) {
      const calories = Number(profile.calorie_goal);
      const protein = Number(profile.protein_pct);
      const carbs = Number(profile.carbs_pct);
      const fat = Number(profile.fat_pct);
      if (calories > 0 && protein >= 0 && carbs >= 0 && fat >= 0) return { calories, protein, carbs, fat };
    }
    return { ...DEFAULT_GOALS };
  }

  function deviceGoals() {
    try {
      const saved = JSON.parse(localStorage.getItem(GOALS_KEY) || "null");
      const calories = Number(saved?.calories);
      const protein = Number(saved?.protein);
      const carbs = Number(saved?.carbs);
      const fat = Number(saved?.fat);
      if (calories > 0 && protein >= 0 && carbs >= 0 && fat >= 0) return { calories, protein, carbs, fat };
    } catch { /* this phone has no saved goals */ }
    return null;
  }

  function macroGrams(goal = goals()) {
    return {
      protein_g: (goal.calories * goal.protein) / 100 / 4,
      carbs_g: (goal.calories * goal.carbs) / 100 / 4,
      fat_g: (goal.calories * goal.fat) / 100 / 9,
    };
  }

  function targetByKey(key) {
    const base = TARGET_BY_KEY[key];
    const goal = goals();
    const grams = macroGrams(goal);
    if (key === "calories") return { ...base, target: goal.calories };
    if (grams[key] != null) return { ...base, target: grams[key] };
    return base;
  }

  function knownMicroKeys() {
    return TARGETS.filter((target) => !COLUMN_KEYS.has(target.key)).map((target) => target.key);
  }

  function microsOf(item) {
    if (!item) return {};
    let micros = item.micros;
    if (typeof micros === "string") {
      try { micros = JSON.parse(micros); } catch { micros = {}; }
    }
    if (!micros || typeof micros !== "object" || Array.isArray(micros)) return {};
    return micros;
  }

  function valueOf(item, key) {
    if (COLUMN_KEYS.has(key)) return num(item[key]);
    return num(microsOf(item)[key]);
  }

  function sumItems(items, key) {
    if (!items || !items.length) return 0;
    return items.reduce((sum, item) => sum + valueOf(item, key), 0);
  }

  function lisbonParts(date) {
    const format = new Intl.DateTimeFormat("en-US", {
      timeZone: TZ,
      hourCycle: "h23",
      numberingSystem: "latn",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const parts = {};
    for (const part of format.formatToParts(date)) {
      if (part.type !== "literal") parts[part.type] = part.value;
    }
    if (parts.hour === "24") parts.hour = "00";
    return parts;
  }

  function wallClockMillis(date) {
    const parts = lisbonParts(date);
    return Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  }

  function lisbonWallToUtc(dateKey, time) {
    const date = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateKey || "");
    const clock = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(time || "");
    if (!date || !clock) return null;
    const year = +date[1];
    const month = +date[2];
    const day = +date[3];
    const hour = +clock[1];
    const minute = +clock[2];
    const second = +(clock[3] || 0);
    const wanted = Date.UTC(year, month - 1, day, hour, minute, second);
    let utc = wanted;
    for (let pass = 0; pass < 4; pass += 1) {
      const shown = wallClockMillis(new Date(utc));
      const diff = wanted - shown;
      if (diff === 0) {
        const parts = lisbonParts(new Date(utc));
        const gotKey = `${parts.year}-${parts.month}-${parts.day}`;
        const gotTime = `${parts.hour}:${parts.minute}:${parts.second}`;
        const wantTime = `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:${String(second).padStart(2, "0")}`;
        return gotKey === dateKey && gotTime === wantTime ? new Date(utc) : null;
      }
      utc += diff;
    }
    return null;
  }

  function addDays(dateKey, days) {
    const [year, month, day] = dateKey.split("-").map(Number);
    const date = new Date(Date.UTC(year, month - 1, day + days));
    return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
  }

  function parseTime(value) {
    if (value instanceof Date) return value;
    let text = String(value ?? "").trim();
    if (!text) return new Date(NaN);
    if (!text.includes("T")) text = text.replace(" ", "T");
    text = text.replace(/([+-]\d{2})$/, "$1:00").replace(/\+00:00$/, "Z");
    return new Date(text);
  }

  function dateKeyFromInstant(date) {
    const parts = lisbonParts(date);
    return `${parts.year}-${parts.month}-${parts.day}`;
  }

  function timeValueFromInstant(date) {
    const parts = lisbonParts(date);
    return `${parts.hour}:${parts.minute}`;
  }

  function todayKey() {
    return dateKeyFromInstant(new Date());
  }

  function formatWhen(dateKey, options) {
    const instant = lisbonWallToUtc(dateKey, "12:00:00");
    if (!instant) return dateKey;
    return new Intl.DateTimeFormat("en-GB", { timeZone: TZ, ...options }).format(instant);
  }

  function formatDayHeading(dateKey) {
    return formatWhen(dateKey, { weekday: "long", day: "numeric", month: "long" });
  }

  function formatShort(dateKey) {
    return formatWhen(dateKey, { day: "numeric", month: "short" });
  }

  function formatChartLabel(dateKey) {
    return formatWhen(dateKey, { weekday: "short", day: "numeric" });
  }

  function formatTableDate(dateKey) {
    return formatWhen(dateKey, { weekday: "short", day: "numeric", month: "short" });
  }

  function formatTime(value) {
    const date = parseTime(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat("en-GB", {
      timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23",
    }).format(date);
  }

  function mealTypeForTime(hhmm) {
    const [hour, minute] = String(hhmm || "00:00").split(":").map(Number);
    const mins = hour * 60 + minute;
    if (mins < 11 * 60) return "Breakfast";
    if (mins < 15 * 60 + 30) return "Lunch";
    if (mins < 18 * 60 + 30) return "Snack";
    return "Dinner";
  }

  function withSeconds(time) {
    return /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : time;
  }

  function eachDay(start, end) {
    const days = [];
    if (!start || !end || start > end) return days;
    for (let day = start; day <= end && days.length <= 366; day = addDays(day, 1)) days.push(day);
    return days;
  }

  function assertLisbonDays() {
    const summer = lisbonWallToUtc("2026-10-16", "00:00:00");
    const winter = lisbonWallToUtc("2026-01-15", "00:00:00");
    const gap = lisbonWallToUtc("2026-03-29", "01:30:00");
    const breakfast = lisbonParts(parseTime("2026-10-16T10:26:22.167815+00"));
    const ok = summer?.toISOString() === "2026-10-15T23:00:00.000Z"
      && winter?.toISOString() === "2026-01-15T00:00:00.000Z"
      && gap == null
      && breakfast.hour === "11"
      && breakfast.minute === "26"
      && breakfast.day === "16";
    if (!ok) console.warn("Lisbon clock check failed.");
  }

  function groupMeals(items) {
    const map = new Map();
    for (const item of items || []) {
      if (!map.has(item.meal_group_id)) map.set(item.meal_group_id, []);
      map.get(item.meal_group_id).push(item);
    }
    return [...map.values()].map((rows) => ({
      meal_group_id: rows[0].meal_group_id,
      meal_name: rows[0].meal_name,
      eaten_at: rows.map((row) => row.eaten_at).sort()[0],
      items: rows,
      created_at: rows.map((row) => row.created_at || "").sort().at(-1) || "",
    })).sort((a, b) => String(b.eaten_at).localeCompare(String(a.eaten_at)) || String(b.created_at).localeCompare(String(a.created_at)));
  }

  function bucket(items, days) {
    const map = new Map(days.map((day) => [day, []]));
    for (const item of items || []) {
      const key = dateKeyFromInstant(parseTime(item.eaten_at));
      if (map.has(key)) map.get(key).push(item);
    }
    return map;
  }

  function friendlyError(error, fallback) {
    const message = String(error?.message || error || "");
    if (/jwt|not authenticated|invalid claim/i.test(message)) return "Could not load your food. Check your connection and try again.";
    if (/failed to fetch|network|load failed/i.test(message)) return fallback;
    return fallback;
  }

  function normalizeTheme(theme) {
    if (THEMES.some((item) => item.id === theme)) return theme;
    if (theme === "system" && matchMedia("(prefers-color-scheme: dark)").matches) return "dark";
    return "light";
  }

  function applyTheme(theme) {
    const name = normalizeTheme(theme);
    document.documentElement.dataset.theme = name;
    const meta = document.querySelector('meta[name="theme-color"]');
    const chosen = THEMES.find((item) => item.id === name);
    if (meta && chosen) meta.content = chosen.color;
  }

  function setTheme(theme, skipDb = false) {
    const name = normalizeTheme(theme);
    state.theme = name;
    try { localStorage.setItem(THEME_KEY, name); } catch { /* storage may be blocked */ }
    applyTheme(name);
    document.querySelectorAll("[data-theme-choice]").forEach((button) => {
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === name));
    });
    if ((state.view === "week" || state.view === "month" || state.view === "weight") && !state.booting) render();
    const uid = userId();
    if (!skipDb && uid && client) {
      if (state.profile) state.profile.theme = name;
      client.from("profiles").update({ theme: name }).eq("id", uid).then(() => {}).catch(() => {});
    }
  }

  function flash(message) {
    state.toast = message;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      state.toast = "";
      document.querySelector(".toast")?.remove();
    }, 2800);
  }

  function setTitle() {
    const names = { week: "Week", month: "Month", weight: "Weight", add: "Add food", definitions: "Definitions", edit: "Edit food" };
    const who = state.session ? firstName() : "Tracker";
    document.title = `${names[state.view] || formatShort(state.dateKey) || "Sign in"} · ${who}`;
  }

  async function fetchAll(startISO, endISO) {
    const uid = userId();
    if (!uid) throw new Error("not authenticated");
    const pageSize = 1000;
    const all = [];
    for (let from = 0; from < 20000; from += pageSize) {
      const { data, error } = await client
        .from("food_items")
        .select("*")
        .eq("user_id", uid)
        .gte("eaten_at", startISO)
        .lt("eaten_at", endISO)
        .order("eaten_at", { ascending: true })
        .order("created_at", { ascending: true })
        .range(from, from + pageSize - 1);
      if (error) throw error;
      const rows = data || [];
      all.push(...rows.map(cleanItem));
      if (rows.length < pageSize) break;
    }
    return all;
  }

  async function fetchBetween(startKey, endKeyExclusive) {
    const start = lisbonWallToUtc(startKey, "00:00:00");
    const end = lisbonWallToUtc(endKeyExclusive, "00:00:00");
    if (!start || !end) throw new Error("bad-date");
    return fetchAll(start.toISOString(), end.toISOString());
  }

  async function loadDay() {
    const token = ++dayToken;
    const dateKey = state.dateKey || todayKey();
    state.dateKey = dateKey;
    state.view = "day";
    state.loading = true;
    state.error = "";
    state.items = [];
    render();
    try {
      const items = await fetchBetween(dateKey, addDays(dateKey, 1));
      if (token !== dayToken) return;
      state.items = items;
    } catch (error) {
      if (token !== dayToken) return;
      state.error = friendlyError(error, "Could not load your food. Check your connection and try again.");
    } finally {
      if (token === dayToken) {
        state.loading = false;
        render();
      }
    }
  }

  function cleanItem(row) {
    const item = { ...row, micros: {} };
    for (const key of COLUMN_KEYS) {
      if (row[key] == null || row[key] === "") item[key] = null;
      else {
        const parsed = Number(row[key]);
        item[key] = Number.isFinite(parsed) ? parsed : null;
      }
    }
    for (const [key, value] of Object.entries(microsOf(row))) {
      const parsed = Number(value);
      item.micros[key] = Number.isFinite(parsed) ? parsed : value;
    }
    return item;
  }

  function weekdayIndex(dateKey) {
    const instant = lisbonWallToUtc(dateKey, "12:00:00");
    const name = new Intl.DateTimeFormat("en-GB", { timeZone: TZ, weekday: "short" }).format(instant);
    return { Mon: 0, Tue: 1, Wed: 2, Thu: 3, Fri: 4, Sat: 5, Sun: 6 }[name] ?? 0;
  }

  function weekStart(dateKey) {
    return addDays(dateKey, -weekdayIndex(dateKey));
  }

  function monthEnd(dateKey) {
    const [year, month] = dateKey.split("-").map(Number);
    const last = new Date(Date.UTC(year, month, 0)).getUTCDate();
    return `${year}-${String(month).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
  }

  function periodBounds(kind, anchor) {
    const today = todayKey();
    const day = anchor || today;
    const start = kind === "month" ? `${day.slice(0, 8)}01` : weekStart(day);
    let end = kind === "month" ? monthEnd(day) : addDays(start, 6);
    if (end > today) end = today;
    if (start > end) return { start: end, end };
    return { start, end };
  }

  function loggedDays(items) {
    const map = new Map();
    for (const item of items || []) {
      const key = dateKeyFromInstant(parseTime(item.eaten_at));
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    }
    return [...map.keys()].sort().map((day) => [day, map.get(day)]);
  }

  async function loadPeriod() {
    const token = ++trendToken;
    const kind = state.period.kind === "month" ? "month" : "week";
    state.period.kind = kind;
    state.view = kind;
    if (!state.period.anchor) state.period.anchor = state.dateKey || todayKey();
    state.period.loading = true;
    state.period.error = "";
    render();
    const { start, end } = periodBounds(kind, state.period.anchor);
    try {
      const items = await fetchBetween(start, addDays(end, 1));
      if (token !== trendToken) return;
      state.period.items = items;
    } catch (error) {
      if (token !== trendToken) return;
      state.period.items = [];
      state.period.error = friendlyError(error, "Could not load your food. Check your connection and try again.");
    } finally {
      if (token === trendToken) {
        state.period.loading = false;
        render();
      }
    }
  }

  function destroyCharts() {
    for (const chart of charts) chart.destroy();
    charts = [];
  }

  function cssVar(name, fallback) {
    const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    return value || fallback;
  }

  function cleanTooltipOptions() {
    const cardBg = cssVar("--card", "#ffffff");
    const textColor = cssVar("--text", "#1c1917");
    const mutedColor = cssVar("--muted", "#78716c");
    const lineColor = cssVar("--line", "#e6dfd2");
    return {
      backgroundColor: cardBg,
      titleColor: mutedColor,
      bodyColor: textColor,
      borderColor: lineColor,
      borderWidth: 1,
      padding: { top: 8, bottom: 8, left: 12, right: 12 },
      cornerRadius: 10,
      displayColors: false,
      titleFont: { size: 12, weight: "bold", family: "system-ui, -apple-system, sans-serif" },
      bodyFont: { size: 14, weight: "800", family: "system-ui, -apple-system, sans-serif" },
      boxPadding: 4,
    };
  }

  function chartOptions(stacked, fromZero = true) {
    const text = cssVar("--muted", "#57534e");
    const grid = cssVar("--line", "#e6dfd2");
    return {
      responsive: true,
      maintainAspectRatio: false,
      animation: matchMedia("(prefers-reduced-motion: reduce)").matches ? false : { duration: 350 },
      plugins: {
        legend: { position: "bottom", labels: { color: text, boxWidth: 12 } },
        tooltip: {
          ...cleanTooltipOptions(),
          callbacks: { label: (ctx) => `${ctx.dataset.label}: ${fmtAmount(ctx.parsed.y)}` },
        },
      },
      scales: {
        x: { stacked, ticks: { color: text, maxRotation: 0, autoSkip: true }, grid: { display: false } },
        y: { stacked, beginAtZero: fromZero, grace: fromZero ? 0 : "12%", ticks: { color: text }, grid: { color: grid } },
      },
    };
  }

  function weeklyWeightAverages(entries) {
    if (!entries || !entries.length) return [];
    const ordered = [...entries].sort((a, b) => String(a.weighed_on).localeCompare(String(b.weighed_on)));
    const map = new Map();
    for (const entry of ordered) {
      const mon = weekStart(entry.weighed_on);
      if (!map.has(mon)) map.set(mon, []);
      map.get(mon).push(entry.weight_kg);
    }
    const weeks = [...map.keys()].sort();
    return weeks.map((start, idx) => {
      const list = map.get(start);
      const avg = list.reduce((a, b) => a + b, 0) / list.length;
      const end = addDays(start, 6);
      const roundedAvg = Math.round(avg * 100) / 100;
      const prevWeekAvg = idx > 0 ? (map.get(weeks[idx - 1]).reduce((a, b) => a + b, 0) / map.get(weeks[idx - 1]).length) : null;
      const diff = prevWeekAvg != null ? Math.round((roundedAvg - prevWeekAvg) * 100) / 100 : null;
      return {
        start,
        end,
        avg: roundedAvg,
        count: list.length,
        label: `${formatShort(start)} – ${formatShort(end)}`,
        diff,
      };
    });
  }

  function monthlyWeightData(entries, objective = "lose") {
    if (!entries || !entries.length) return [];
    const ordered = [...entries].sort((a, b) => String(a.weighed_on).localeCompare(String(b.weighed_on)));
    const firstEntry = ordered[0];
    const map = new Map();
    for (const entry of ordered) {
      const monthKey = entry.weighed_on.slice(0, 7);
      if (!map.has(monthKey)) map.set(monthKey, []);
      map.get(monthKey).push(entry);
    }
    const months = [...map.keys()].sort();
    const results = [];
    for (let i = 0; i < months.length; i++) {
      const mKey = months[i];
      const mEntries = map.get(mKey);
      const monthAvg = mEntries.reduce((s, e) => s + e.weight_kg, 0) / mEntries.length;
      const roundedAvg = Math.round(monthAvg * 100) / 100;

      let diff = 0;
      const isFirstMonth = (i === 0);
      if (isFirstMonth) {
        diff = Math.round((roundedAvg - firstEntry.weight_kg) * 100) / 100;
      } else {
        const prev = results[i - 1];
        diff = Math.round((roundedAvg - prev.monthAvg) * 100) / 100;
      }

      const [y, m] = mKey.split("-").map(Number);
      const date = new Date(Date.UTC(y, m - 1, 1));
      const monthLabel = date.toLocaleDateString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

      results.push({
        monthKey: mKey,
        monthLabel,
        entriesCount: mEntries.length,
        monthAvg: roundedAvg,
        diff,
        isFirstMonth,
        firstDayWeight: firstEntry.weight_kg,
        firstDayDate: firstEntry.weighed_on,
      });
    }
    return results;
  }

  function weightDiffColor(diff, objective = "lose") {
    if (Math.abs(diff) < 0.05) return "rgba(140, 140, 140, 0.6)";
    const up = diff > 0;
    if (objective === "gain") {
      return up ? "#10b981" : "#ef4444";
    }
    return up ? "#ef4444" : "#10b981";
  }

  function weightDiffBadge(diff, objective = "lose") {
    if (Math.abs(diff) < 0.05) return '<span class="delta-pill neutral">0.0 kg</span>';
    const up = diff > 0;
    const tone = (objective === "gain") ? (up ? "good" : "bad") : (up ? "bad" : "good");
    return `<span class="delta-pill ${tone}">${esc(signedKg(diff))}</span>`;
  }

  function mountWeightChart() {
    if (state.weight.loading || state.weight.error || !window.Chart) return;
    const entries = [...state.weight.entries].sort((a, b) => String(a.weighed_on).localeCompare(String(b.weighed_on)));
    if (!entries.length) return;

    const dailyCanvas = document.getElementById("chart-weight-daily");
    const weeklyCanvas = document.getElementById("chart-weight-weekly");
    const monthlyCanvas = document.getElementById("chart-weight-monthly");

    // 1. Daily Weight Line Chart with clean themed tooltip
    if (dailyCanvas) {
      const color = cssVar("--kcal", "#f25c2c");
      const options = chartOptions(false, false);
      options.plugins.legend.display = false;
      options.plugins.tooltip = {
        ...cleanTooltipOptions(),
        callbacks: {
          title: (items) => {
            const entry = entries[items[0].dataIndex];
            return entry ? formatTableDate(entry.weighed_on) : items[0].label;
          },
          label: (ctx) => `${fmtAmount(ctx.parsed.y)} kg`,
        },
      };
      charts.push(new window.Chart(dailyCanvas, {
        type: "line",
        data: {
          labels: entries.map((entry) => formatChartLabel(entry.weighed_on)),
          datasets: [{
            label: "Weight",
            data: entries.map((entry) => entry.weight_kg),
            borderColor: color,
            backgroundColor: "rgba(242, 92, 44, 0.18)",
            pointBackgroundColor: color,
            tension: 0.25,
            pointRadius: entries.length > 40 ? 0 : 4,
            pointHoverRadius: 6,
            fill: true,
          }],
        },
        options,
      }));
    }

    // 2. Weekly Average Line Chart with clean themed tooltip
    if (weeklyCanvas) {
      const weeks = weeklyWeightAverages(entries);
      if (weeks.length) {
        const color = cssVar("--accent", "#0f766e");
        const options = chartOptions(false, false);
        options.plugins.legend.display = false;
        options.plugins.tooltip = {
          ...cleanTooltipOptions(),
          callbacks: {
            title: (items) => weeks[items[0].dataIndex]?.label || items[0].label,
            label: (ctx) => {
              const w = weeks[ctx.dataIndex];
              return `${fmtAmount(ctx.parsed.y)} kg avg · ${w.count} weigh-in${w.count === 1 ? "" : "s"}`;
            },
          },
        };
        charts.push(new window.Chart(weeklyCanvas, {
          type: "line",
          data: {
            labels: weeks.map((w) => w.label),
            datasets: [{
              label: "Weekly Average",
              data: weeks.map((w) => w.avg),
              borderColor: color,
              backgroundColor: "rgba(15, 118, 110, 0.18)",
              pointBackgroundColor: color,
              pointRadius: weeks.length > 25 ? 2 : 5,
              pointHoverRadius: 7,
              tension: 0.25,
              fill: true,
            }],
          },
          options,
        }));
      }
    }

    // 3. Monthly Change Bar Chart with clean themed tooltip
    if (monthlyCanvas) {
      const objective = state.profile?.weight_objective || state.weight.objective || "lose";
      const monthly = monthlyWeightData(entries, objective);
      if (monthly.length) {
        const text = cssVar("--muted", "#57534e");
        const grid = cssVar("--line", "#e6dfd2");
        const bgColors = monthly.map((m) => weightDiffColor(m.diff, objective));

        charts.push(new window.Chart(monthlyCanvas, {
          type: "bar",
          data: {
            labels: monthly.map((m) => m.monthLabel),
            datasets: [{
              label: "Monthly Weight Change",
              data: monthly.map((m) => m.diff),
              backgroundColor: bgColors,
              borderRadius: 6,
              maxBarThickness: 42,
            }],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: matchMedia("(prefers-reduced-motion: reduce)").matches ? false : { duration: 350 },
            plugins: {
              legend: { display: false },
              tooltip: {
                ...cleanTooltipOptions(),
                callbacks: {
                  title: (items) => monthly[items[0].dataIndex]?.monthLabel || items[0].label,
                  label: (ctx) => {
                    const m = monthly[ctx.dataIndex];
                    if (m.isFirstMonth) {
                      return `${signedKg(m.diff)} vs first weigh-in (${fmtAmount(m.firstDayWeight)} kg)`;
                    }
                    return `${signedKg(m.diff)} vs previous month (${fmtAmount(m.monthAvg)} kg avg)`;
                  },
                },
              },
            },
            scales: {
              x: { grid: { display: false }, ticks: { color: text } },
              y: {
                beginAtZero: true,
                grace: "15%",
                ticks: {
                  color: text,
                  callback: (val) => signedKg(val),
                },
                grid: {
                  color: (ctx) => (ctx.tick.value === 0 ? text : grid),
                  lineWidth: (ctx) => (ctx.tick.value === 0 ? 1.5 : 1),
                },
              },
            },
          },
        }));
      }
    }
  }

  function mountCharts() {
    destroyCharts();
    if (state.view === "weight") {
      mountWeightChart();
      return;
    }
    if ((state.view !== "week" && state.view !== "month") || state.period.loading || state.period.error || !window.Chart) return;
    const used = loggedDays(state.period.items);
    if (!used.length) return;
    const labels = used.map(([day]) => formatChartLabel(day));
    const pointRadius = used.length > 20 ? 0 : 3;
    const calories = document.getElementById("chart-calories");
    const macros = document.getElementById("chart-macros");
    const accent = cssVar("--accent", "#0f766e");
    const muted = cssVar("--muted", "#57534e");
    if (calories) {
      charts.push(new window.Chart(calories, {
        type: "line",
        data: {
          labels,
          datasets: [
            { label: "Calories", data: used.map(([, items]) => sumItems(items, "calories")), borderColor: accent, backgroundColor: accent, tension: 0.25, pointRadius, fill: false },
            { label: "Goal", data: used.map(() => targetByKey("calories").target), borderColor: muted, borderDash: [6, 4], pointRadius: 0, fill: false },
          ],
        },
        options: chartOptions(false),
      }));
    }
    if (macros) {
      charts.push(new window.Chart(macros, {
        type: "bar",
        data: {
          labels,
          datasets: [
            { label: "Protein", data: used.map(([, items]) => sumItems(items, "protein_g")), backgroundColor: "#3b82f6", stack: "m", borderWidth: 0, maxBarThickness: 28 },
            { label: "Carbs", data: used.map(([, items]) => sumItems(items, "carbs_g")), backgroundColor: "#f59e0b", stack: "m", borderWidth: 0, maxBarThickness: 28 },
            { label: "Fat", data: used.map(([, items]) => sumItems(items, "fat_g")), backgroundColor: "#ec4899", stack: "m", borderWidth: 0, maxBarThickness: 28 },
          ],
        },
        options: chartOptions(true),
      }));
    }
  }

  const DOT = { protein_g: "protein", carbs_g: "carbs", fat_g: "fat" };

  function toneFor(percent, type) {
    if (type === "limit") return percent > 100 ? "bad" : "good";
    if (percent >= 90) return "good";
    if (percent >= 50) return "mid";
    return "low";
  }

  function barHtml(key, customItems) {
    const items = Array.isArray(customItems) ? customItems : state.items;
    const meta = targetByKey(key);
    const value = sumItems(items, key);
    const percent = meta.target ? (value / meta.target) * 100 : 0;
    const width = Math.max(0, Math.min(percent, 100));
    return `<div class="nutrient clickable" data-action="view-nutrient" data-key="${esc(key)}" role="button" tabindex="0" title="Click to see food sources">
      <div class="nutrient-label"><span>${DOT[key] ? `<i class="swatch ${DOT[key]}" aria-hidden="true"></i> ` : ""}${esc(meta.label)} <svg class="chevron-inline" viewBox="0 0 24 24" width="12" height="12" aria-hidden="true"><path d="M9 18l6-6-6-6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span><span class="num">${esc(fmtAmount(value))} / ${esc(key === "calories" ? fmtInt(meta.target) : fmtAmount(meta.target))} ${esc(meta.unit)}</span></div>
      <div class="track" role="meter" aria-label="${esc(meta.label)}" aria-valuemin="0" aria-valuemax="${meta.target}" aria-valuenow="${Math.round(value)}"><span class="${DOT[key] || toneFor(percent, meta.type)}" style="width:${width}%"></span></div>
    </div>`;
  }

  function ringHtml(calories) {
    const goal = targetByKey("calories").target;
    const percent = goal ? (calories / goal) * 100 : 0;
    const visual = Math.max(0, Math.min(percent, 100));
    const radius = 52;
    const circ = 2 * Math.PI * radius;
    const offset = circ * (1 - visual / 100);
    const left = Math.round(goal - calories);
    const status = left >= 0 ? `${fmtInt(left)} kcal left` : `${fmtInt(Math.abs(left))} kcal over`;
    return `<div class="ring-wrap">
      <svg class="ring-svg" viewBox="0 0 120 120" aria-hidden="true">
        <circle class="ring-track" cx="60" cy="60" r="52"></circle>
        <circle class="ring-value${percent > 105 ? " over" : ""}" cx="60" cy="60" r="52" stroke-linecap="${visual > 0 ? "round" : "butt"}" stroke-dasharray="${circ}" stroke-dashoffset="${offset}" transform="rotate(-90 60 60)"></circle>
      </svg>
      <div class="ring-copy">
        <div class="ring-kcal num">${esc(fmtInt(calories))}</div>
        <div class="ring-unit">kcal</div>
        <div class="ring-status${left < 0 ? " over" : ""}">${esc(status)}</div>
      </div>
    </div>
    <p class="hint">Goal ${esc(fmtInt(goal))} kcal</p>`;
  }

  function splitHtml() {
    const protein = sumItems(state.items, "protein_g") * 4;
    const carbs = sumItems(state.items, "carbs_g") * 4;
    const fat = sumItems(state.items, "fat_g") * 9;
    const total = protein + carbs + fat;
    if (total <= 0) return '<div class="split-block"><h3>Where the calories come from</h3><p class="hint">No protein, carbs, or fat logged yet.</p></div>';
    return `<div class="split-block">
      <h3>Where the calories come from</h3>
      <div class="split" role="img" aria-label="Protein ${fmtInt(protein)} kcal, carbs ${fmtInt(carbs)} kcal, fat ${fmtInt(fat)} kcal">
        <span class="protein" style="width:${(protein / total) * 100}%"></span>
        <span class="carbs" style="width:${(carbs / total) * 100}%"></span>
        <span class="fat" style="width:${(fat / total) * 100}%"></span>
      </div>
      <div class="legend">
        <span><i class="swatch protein" aria-hidden="true"></i>Protein ${esc(fmtInt(protein))}</span>
        <span><i class="swatch carbs" aria-hidden="true"></i>Carbs ${esc(fmtInt(carbs))}</span>
        <span><i class="swatch fat" aria-hidden="true"></i>Fat ${esc(fmtInt(fat))}</span>
      </div>
    </div>`;
  }

  function kcalLabel(value) {
    if (value == null || value === "") return "— kcal";
    const parsed = Number(value);
    return Number.isFinite(parsed) ? `${fmtInt(parsed)} kcal` : "— kcal";
  }

  function mealOptions(selected) {
    const types = MEAL_TYPES.includes(selected) || !selected ? MEAL_TYPES : [selected, ...MEAL_TYPES];
    return types.map((type) => `<option value="${esc(type)}"${type === selected ? " selected" : ""}>${esc(type)}</option>`).join("");
  }

  function mealHtml(meal) {
    const editing = state.mealTimeGroup === meal.meal_group_id;
    const items = meal.items.map((item) => `<button type="button" class="item-btn" data-action="edit-item" data-id="${esc(item.id)}">
      <span class="item-name">${esc(item.item_name)}</span>
      ${item.portion ? `<span class="item-portion">${esc(item.portion)}</span>` : ""}
      <span class="item-kcal num">${esc(kcalLabel(item.calories))}</span>
    </button>`).join("");
    const timeEditor = editing ? `<form class="meal-time" data-form="meal-time">
      <label class="field"><span>Date</span><input type="date" name="meal_date" value="${esc(dateKeyFromInstant(parseTime(meal.eaten_at)))}"></label>
      <label class="field"><span>Time in Lisbon</span><input type="time" name="meal_time" value="${esc(timeValueFromInstant(parseTime(meal.eaten_at)))}"></label>
      <div class="row-actions">
        <button type="button" class="secondary" data-action="cancel-meal-time">Cancel</button>
        <button type="button" class="primary" data-action="save-meal-time" data-group="${esc(meal.meal_group_id)}">Save time</button>
      </div>
    </form>` : "";
    return `<article class="card meal">
      <div class="meal-head">
        <label class="sr-only" for="meal-${esc(meal.meal_group_id)}">Meal type</label>
        <select id="meal-${esc(meal.meal_group_id)}" class="meal-type" data-action="meal-type" data-group="${esc(meal.meal_group_id)}">${mealOptions(meal.meal_name)}</select>
        <div class="meal-total">
          <strong class="num">${esc(fmtInt(sumItems(meal.items, "calories")))} kcal</strong>
          <span class="hint">P ${esc(fmtAmount(sumItems(meal.items, "protein_g")))} · C ${esc(fmtAmount(sumItems(meal.items, "carbs_g")))} · F ${esc(fmtAmount(sumItems(meal.items, "fat_g")))}</span>
        </div>
      </div>
      <time class="hint" datetime="${esc(meal.eaten_at)}">${esc(formatTime(meal.eaten_at))} Lisbon time</time>
      <div>${items}</div>
      ${timeEditor}
      ${editing ? "" : `<div class="meal-actions">
        <button type="button" class="text-btn" data-action="edit-meal-time" data-group="${esc(meal.meal_group_id)}">Change time</button>
        <button type="button" class="danger-text" data-action="ask-delete-meal" data-group="${esc(meal.meal_group_id)}">Delete meal</button>
      </div>`}
    </article>`;
  }

  function dayHtml() {
    const isToday = state.dateKey === todayKey();
    const head = `<section class="day-head">
      <div class="date-row">
        <button type="button" class="icon-btn" data-action="prev-day" aria-label="Previous day">${ICONS.left}</button>
        <h1>${esc(formatDayHeading(state.dateKey))}</h1>
        <button type="button" class="icon-btn" data-action="next-day" aria-label="Next day">${ICONS.right}</button>
      </div>
      <label class="date-jump"><span class="sr-only">Choose a date</span><input id="day-picker" type="date" value="${esc(state.dateKey)}"></label>
      <button type="button" class="text-btn" data-action="today">${isToday ? "Reload today" : "Today"}</button>
    </section>`;
    if (state.loading) return `${head}<p class="hint">Loading your day…</p>`;
    if (state.error) return `${head}<p class="error" role="alert">${esc(state.error)}</p><button type="button" class="secondary" data-action="reload-day">Try again</button>`;
    const meals = groupMeals(state.items);
    const mealBlock = meals.length
      ? `<section class="meals">${meals.map(mealHtml).join("")}<button type="button" class="secondary" data-action="nav" data-view="add">Add food</button></section>`
      : `<section class="card empty"><h2>Nothing logged yet</h2><p>Add a meal here, or send a food photo to Claude.</p><button type="button" class="primary" data-action="nav" data-view="add">Add food</button></section>`;
    return `${head}
      <div class="day-top">
        <section class="card ring-card clickable" data-action="view-nutrient" data-key="calories" role="button" tabindex="0" title="Click to see calorie sources">${ringHtml(sumItems(state.items, "calories"))}<span class="ring-hint">Tap to see sources →</span></section>
        <section class="card"><h2>Protein, carbs and fat</h2>${barHtml("protein_g")}${barHtml("carbs_g")}${barHtml("fat_g")}${splitHtml()}</section>
      </div>
      <section class="card"><h2>Fiber and limits</h2>${barHtml("fiber_g")}${barHtml("sugar_g")}${barHtml("saturated_fat_g")}</section>
      <details class="card micros"><summary>Vitamins and minerals</summary>${knownMicroKeys().map(barHtml).join("")}</details>
      ${mealBlock}`;
  }

  function field(label, name, value, inputmode) {
    const mode = inputmode ? ` inputmode="${inputmode}"` : "";
    return `<label class="field"><span>${esc(label)}</span><input name="${esc(name)}" type="text"${mode} autocomplete="off" value="${esc(value ?? "")}"></label>`;
  }

  function numField(label, name, value) {
    return field(label, name, displayNumber(value), "decimal");
  }

  function notesField(value) {
    return `<label class="field"><span>Notes</span><textarea name="notes" rows="3">${esc(value ?? "")}</textarea></label>`;
  }

  function microFields(item) {
    const micros = microsOf(item);
    return `<div class="micro-grid">${knownMicroKeys().map((key) => {
      const meta = targetByKey(key);
      return numField(`${meta.label} (${meta.unit})`, `micro_${key}`, micros[key] == null ? "" : micros[key]);
    }).join("")}</div>`;
  }

  function itemFields(item, full) {
    const main = `${field("Name", "item_name", item.item_name || "")}
      ${field("Portion", "portion", item.portion || "")}
      ${numField("Calories", "calories", item.calories)}
      <div class="trio">
        ${numField("Protein (g)", "protein_g", item.protein_g)}
        ${numField("Carbs (g)", "carbs_g", item.carbs_g)}
        ${numField("Fat (g)", "fat_g", item.fat_g)}
      </div>`;
    const extra = `<div class="trio">
        ${numField("Fiber (g)", "fiber_g", item.fiber_g)}
        ${numField("Sugar (g)", "sugar_g", item.sugar_g)}
        ${numField("Saturated fat (g)", "saturated_fat_g", item.saturated_fat_g)}
      </div>${microFields(item)}${notesField(item.notes || "")}`;
    if (full) return `${main}${extra}`;
    return `${main}<details><summary>More nutrients</summary>${extra}</details>`;
  }

  function itemRowHtml(item) {
    return `<div class="card stack item-form" data-item-row>
      <div class="item-form-head"><h3>Food</h3><button type="button" class="text-btn" data-action="remove-row">Remove</button></div>
      ${itemFields(item || {}, false)}
    </div>`;
  }

  function editHtml() {
    const item = state.items.find((row) => row.id === state.editingId);
    if (!item) return '<section class="card stack"><h1>Edit food</h1><p>That food is not on this day.</p><button type="button" class="secondary" data-action="back">Back</button></section>';
    return `<form class="card stack" data-form="edit" autocomplete="off">
      <button type="button" class="text-btn" data-action="back">Back</button>
      <h1>Edit food</h1>
      <p class="hint">Part of ${esc(item.meal_name)} at ${esc(formatTime(item.eaten_at))}. Change the meal type or time from the day screen.</p>
      ${itemFields(item, true)}
      <p class="form-error" role="alert"></p>
      <div class="row-actions">
        <button type="button" class="danger" data-action="ask-delete-item" data-id="${esc(item.id)}">Delete food</button>
        <button type="submit" class="primary">Save</button>
      </div>
    </form>`;
  }

  function addHtml() {
    const dateKey = state.dateKey || todayKey();
    const time = timeValueFromInstant(new Date());
    const recent = readRecent();
    const chips = recent.length
      ? `<section class="card stack"><h2>Recent</h2><div class="chips">${recent.map((item, index) => `<button type="button" class="chip" data-action="use-recent" data-index="${index}">${esc(item.item_name)}</button>`).join("")}</div></section>`
      : "";
    return `<form id="add-form" class="stack" data-form="add" autocomplete="off">
      <h1>Add food</h1>
      <p class="hint">Cooking fat is olive oil. Milk is lactose-free semi-skimmed. Times are in Lisbon.</p>
      <section class="card stack">
        <label class="field"><span>Date</span><input type="date" name="eaten_date" value="${esc(dateKey)}"></label>
        <div class="radios">
          <label><input type="radio" name="add-mode" value="new" checked> New meal</label>
          <label><input type="radio" name="add-mode" value="existing"> Add to a meal already logged</label>
        </div>
        <div id="new-meal-fields" class="stack">
          <label class="field"><span>Time</span><input type="time" name="eaten_time" value="${esc(time)}"></label>
          <label class="field"><span>Meal</span><select name="meal_name">${mealOptions(mealTypeForTime(time))}</select></label>
        </div>
        <div id="existing-meal-fields" class="stack" hidden>
          <label class="field"><span>Meal</span><select id="existing-meal"><option value="">Loading meals…</option></select></label>
          <p id="existing-meal-note" class="hint"></p>
        </div>
      </section>
      ${chips}
      <div id="item-rows" class="stack">${itemRowHtml({})}</div>
      <button type="button" class="secondary" data-action="add-row">Add another food</button>
      <p class="form-error" role="alert"></p>
      <button type="submit" class="primary">Save meal</button>
    </form>`;
  }

  function periodHtml() {
    const kind = state.period.kind === "month" ? "month" : "week";
    const anchor = state.period.anchor || todayKey();
    const { start, end } = periodBounds(kind, anchor);
    const title = kind === "week" ? "Week" : "Month";
    const range = start === end ? formatTableDate(start) : `${formatShort(start)} – ${formatShort(end)}`;
    const nextStart = kind === "month" ? addDays(monthEnd(anchor), 1) : addDays(weekStart(anchor), 7);
    const head = `<section class="day-head">
      <div class="date-row">
        <button type="button" class="icon-btn" data-action="prev-period" aria-label="Previous ${title.toLowerCase()}">${ICONS.left}</button>
        <div>
          <h1>${title}</h1>
          <p class="hint">${esc(range)}</p>
        </div>
        <button type="button" class="icon-btn" data-action="next-period" aria-label="Next ${title.toLowerCase()}"${nextStart > todayKey() ? " disabled" : ""}>${ICONS.right}</button>
      </div>
    </section>`;
    if (state.period.loading) return `${head}<p class="hint">Loading…</p>`;
    if (state.period.error) return `${head}<p class="error" role="alert">${esc(state.period.error)}</p><button type="button" class="secondary" data-action="reload-period">Try again</button>`;
    const used = loggedDays(state.period.items);
    if (!used.length) return `${head}<section class="card empty"><h2>Nothing logged yet</h2><p>This ${kind} only shows days that have food.</p></section>`;
    const count = used.length;
    const average = (key) => used.reduce((sum, [, items]) => sum + sumItems(items, key), 0) / count;
    const cards = [
      ["calories", "Avg calories"],
      ["protein_g", "Avg protein"],
      ["carbs_g", "Avg carbs"],
      ["fat_g", "Avg fat"],
    ].map(([key, label]) => {
      const meta = targetByKey(key);
      const value = key === "calories" ? fmtInt(average(key)) : fmtAmount(average(key));
      return `<article class="card stat clickable" data-action="view-nutrient" data-key="${esc(key)}" role="button" tabindex="0" title="Click to see sources for this ${kind}"><span>${label}</span><strong class="num">${esc(value)} ${esc(meta.unit)}</strong></article>`;
    }).join("");
    const rows = [...used].reverse().map(([day, items]) => `<tr class="${day === todayKey() ? "today" : ""}">
      <td>${esc(formatTableDate(day))}</td>
      <td class="num">${esc(fmtInt(sumItems(items, "calories")))}</td>
      <td class="num">${esc(fmtAmount(sumItems(items, "protein_g")))}</td>
      <td class="num">${esc(fmtAmount(sumItems(items, "carbs_g")))}</td>
      <td class="num">${esc(fmtAmount(sumItems(items, "fat_g")))}</td>
    </tr>`).join("");
    const dayWord = count === 1 ? "day" : "days";
    return `${head}
      <p class="hint">Based on ${count} ${dayWord} with food. Empty days are left out.</p>
      <section class="stats">${cards}</section>
      <section class="card chart-card"><h2>Calories</h2><div class="chart-box"><canvas id="chart-calories"></canvas></div></section>
      <section class="card chart-card"><h2>Protein, carbs and fat</h2><div class="chart-box"><canvas id="chart-macros"></canvas></div></section>
      <section class="card">
        <h2>Days with food</h2>
        <div class="table-scroll"><table>
          <thead><tr><th>Date</th><th class="num">kcal</th><th class="num">Protein</th><th class="num">Carbs</th><th class="num">Fat</th></tr></thead>
          <tbody>${rows}</tbody>
        </table></div>
      </section>`;
  }

  function signedKg(diff) {
    const rounded = Math.round(diff * 10) / 10;
    if (rounded > 0) return `+${fmtAmount(rounded)} kg`;
    if (rounded < 0) return `−${fmtAmount(Math.abs(rounded))} kg`;
    return "0 kg";
  }

  function weightHtml() {
    const entries = [...state.weight.entries].sort((a, b) => String(b.weighed_on).localeCompare(String(a.weighed_on)));
    const today = todayKey();
    const todayEntry = state.weight.entries.find((entry) => entry.weighed_on === today);
    const ordered = [...state.weight.entries].sort((a, b) => String(a.weighed_on).localeCompare(String(b.weighed_on)));
    const latest = ordered[ordered.length - 1];
    const previous = ordered.length > 1 ? ordered[ordered.length - 2] : null;
    const first = ordered[0];

    const objective = state.profile?.weight_objective || state.weight.objective || "lose";

    const weeklyAverages = weeklyWeightAverages(ordered);
    const latestWeek = weeklyAverages[weeklyAverages.length - 1];

    const monthlyData = monthlyWeightData(ordered, objective);
    const latestMonth = monthlyData[monthlyData.length - 1];
    const prevMonth = monthlyData.length > 1 ? monthlyData[monthlyData.length - 2] : null;

    const stats = latest ? `<section class="stats">
      <article class="card stat"><span>Latest weight</span><strong class="num">${esc(fmtAmount(latest.weight_kg))} kg</strong><span>${esc(formatTableDate(latest.weighed_on))}</span></article>
      ${previous ? `<article class="card stat"><span>Since last</span><strong class="num">${esc(signedKg(latest.weight_kg - previous.weight_kg))}</strong><span>${esc(formatShort(previous.weighed_on))}</span></article>` : ""}
      ${latestWeek ? `<article class="card stat"><span>Weekly avg</span><strong class="num">${esc(fmtAmount(latestWeek.avg))} kg</strong><span>${latestWeek.diff != null ? weightDiffBadge(latestWeek.diff, objective) : esc(latestWeek.label)}</span></article>` : ""}
      ${latestMonth ? `<article class="card stat"><span>Monthly change</span><strong class="num">${weightDiffBadge(latestMonth.diff, objective)}</strong><span>${latestMonth.isFirstMonth ? "vs start" : `vs ${prevMonth ? esc(prevMonth.monthLabel) : "prior"}`}</span></article>` : (first && first !== latest ? `<article class="card stat"><span>Since first</span><strong class="num">${esc(signedKg(latest.weight_kg - first.weight_kg))}</strong><span>${esc(formatShort(first.weighed_on))}</span></article>` : "")}
    </section>` : "";

    const form = `<form class="card stack" data-form="weight" autocomplete="off">
      <h2>Log weight</h2>
      <div class="pair">
        <label class="field"><span>Date</span><input type="date" name="weighed_on" max="${esc(today)}" value="${esc(today)}"></label>
        <label class="field"><span>Kilograms</span><input name="weight_kg" type="text" inputmode="decimal" autocomplete="off" value="${esc(todayEntry ? displayNumber(todayEntry.weight_kg) : "")}" placeholder="74.2"></label>
      </div>
      <p class="hint">Saving the same day again replaces that weight.</p>
      <p class="form-error" role="alert"></p>
      <button type="submit" class="primary">Save weight</button>
    </form>`;

    if (state.weight.loading && !state.weight.loaded) return `<h1>Weight</h1>${form}<p class="hint">Loading weight…</p>`;
    if (state.weight.error && !entries.length) return `<h1>Weight</h1>${form}<p class="error" role="alert">${esc(state.weight.error)}</p><button type="button" class="secondary" data-action="reload-weight">Try again</button>`;

    let chartsBlock = "";
    if (!entries.length) {
      chartsBlock = `<section class="card empty"><h2>No weight yet</h2><p>Log a weight and the graphs will show up here.</p></section>`;
    } else if (!window.Chart) {
      chartsBlock = `<p class="error">Could not load the charts. Check your connection and refresh.</p>`;
    } else {
      chartsBlock = `<div class="weight-charts-grid">
        <section class="card chart-card full-span">
          <h2>Daily weight</h2>
          <div class="chart-box"><canvas id="chart-weight-daily"></canvas></div>
        </section>

        <section class="card chart-card">
          <h2>Weekly average</h2>
          <div class="chart-box"><canvas id="chart-weight-weekly"></canvas></div>
        </section>

        <section class="card chart-card">
          <h2>Monthly change</h2>
          <div class="chart-box"><canvas id="chart-weight-monthly"></canvas></div>
        </section>
      </div>`;
    }

    const rows = entries.map((entry) => `<div class="weight-row">
      <span>${esc(formatTableDate(entry.weighed_on))}</span>
      <strong class="num">${esc(fmtAmount(entry.weight_kg))} kg</strong>
      <button type="button" class="danger-text" data-action="ask-delete-weight" data-id="${esc(entry.id)}">Delete</button>
    </div>`).join("");
    const list = entries.length ? `<section class="card"><h2>Log</h2><div class="weight-list">${rows}</div></section>` : "";
    const error = state.weight.error ? `<p class="error" role="alert">${esc(state.weight.error)}</p>` : "";

    return `<h1>Weight</h1>${error}${form}${stats}${chartsBlock}${list}`;
  }

  async function loadWeight() {
    const token = ++weightToken;
    state.view = "weight";
    if (!state.weight.loaded) {
      state.weight.loading = true;
      state.weight.error = "";
      render();
    }
    try {
      const uid = userId();
      if (!uid) throw new Error("not authenticated");
      const { data, error } = await client
        .from("weight_logs")
        .select("id, weighed_on, weight_kg")
        .eq("user_id", uid)
        .order("weighed_on", { ascending: true });
      if (token !== weightToken) return;
      if (error) throw error;
      state.weight.entries = (data || []).map((row) => ({
        id: row.id,
        weighed_on: row.weighed_on,
        weight_kg: Number(row.weight_kg),
      })).filter((row) => isUuid(row.id) && /^\d{4}-\d{2}-\d{2}$/.test(row.weighed_on) && Number.isFinite(row.weight_kg));
      state.weight.loaded = true;
      state.weight.error = "";
    } catch (error) {
      if (token !== weightToken) return;
      state.weight.error = friendlyError(error, "Could not load your weight. Check your connection and try again.");
    } finally {
      if (token === weightToken) {
        state.weight.loading = false;
        render();
      }
    }
  }

  async function submitWeight(form) {
    const button = form.querySelector('button[type="submit"]');
    const dateKey = form.weighed_on.value;
    const parsed = parseOptionalNumber(form.weight_kg.value);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey) || dateKey > todayKey()) return failForm(form, null, "", "Choose today or an earlier day.");
    if (parsed == null || Number.isNaN(parsed) || parsed <= 0 || parsed >= 500) return failForm(form, null, "", "Enter a weight in kilograms.");
    const kg = Math.round(parsed * 100) / 100;
    const uid = userId();
    if (!uid) return failForm(form, null, "", "Sign in again, then save this weight.");
    button.disabled = true;
    button.textContent = "Saving…";
    try {
      const { data, error } = await client
        .from("weight_logs")
        .upsert({ user_id: uid, weighed_on: dateKey, weight_kg: kg }, { onConflict: "user_id,weighed_on" })
        .select("id, weighed_on, weight_kg");
      if (error || !data || data.length !== 1) {
        failForm(form, button, "Save weight", friendlyError(error, "Could not save that weight. Check your connection and try again."));
        return;
      }
      const saved = { id: data[0].id, weighed_on: data[0].weighed_on, weight_kg: Number(data[0].weight_kg) };
      const index = state.weight.entries.findIndex((entry) => entry.weighed_on === saved.weighed_on || entry.id === saved.id);
      if (index >= 0) state.weight.entries[index] = saved;
      else state.weight.entries.push(saved);
      state.weight.loaded = true;
      state.weight.error = "";
      flash("Weight saved");
      render();
    } catch (error) {
      failForm(form, button, "Save weight", friendlyError(error, "Could not save that weight. Check your connection and try again."));
    }
  }

  async function deleteWeight(id) {
    const uid = userId();
    if (!isUuid(id) || !uid) return "Could not delete that weight.";
    const { data, error } = await client.from("weight_logs").delete().eq("id", id).eq("user_id", uid).select("id");
    if (error || !data || data.length !== 1) return friendlyError(error, "Could not delete that weight. Check your connection and try again.");
    state.weight.entries = state.weight.entries.filter((entry) => entry.id !== id);
    return "";
  }

  function goalPreviewHtml(goal) {
    const grams = macroGrams(goal);
    const sum = goal.protein + goal.carbs + goal.fat;
    const note = Math.abs(sum - 100) > 0.51 ? "These three numbers need to add up to 100." : `Protein ${fmtAmount(grams.protein_g)} g · Carbs ${fmtAmount(grams.carbs_g)} g · Fat ${fmtAmount(grams.fat_g)} g`;
    return `<div class="split" aria-hidden="true">
        <span class="protein" style="width:${Math.max(goal.protein, 0)}%"></span>
        <span class="carbs" style="width:${Math.max(goal.carbs, 0)}%"></span>
        <span class="fat" style="width:${Math.max(goal.fat, 0)}%"></span>
      </div>
      <p id="goal-preview" class="hint">${esc(note)}</p>`;
  }

  function definitionsHtml() {
    const goal = goals();
    const choices = THEMES.map((theme) => `<button type="button" data-action="theme" data-theme-choice="${theme.id}" aria-pressed="${normalizeTheme(state.theme) === theme.id}"><i class="theme-dot" style="background:${theme.swatch}"></i>${esc(theme.label)}</button>`).join("");
    return `<form id="goals-form" class="stack" data-form="goals" autocomplete="off">
      <h1>Definitions</h1>
      <section class="card stack">
        <h2>Daily calories</h2>
        <label class="field"><span>Goal (kcal)</span><input name="calories" inputmode="decimal" value="${esc(String(goal.calories))}"></label>
        <h2>Macro split</h2>
        <p class="hint">How the calories are divided. Protein, carbs and fat need to add up to 100.</p>
        <div class="trio">
          <label class="field"><span>Protein %</span><input name="protein" inputmode="decimal" value="${esc(String(goal.protein))}"></label>
          <label class="field"><span>Carbs %</span><input name="carbs" inputmode="decimal" value="${esc(String(goal.carbs))}"></label>
          <label class="field"><span>Fat %</span><input name="fat" inputmode="decimal" value="${esc(String(goal.fat))}"></label>
        </div>
        ${goalPreviewHtml(goal)}
        <p class="form-error" role="alert"></p>
        <button class="primary" type="submit">Save goals</button>
      </section>
      <section class="card stack">
        <h2>Weight objective</h2>
        <label class="field">
          <span>Objective</span>
          <select name="weight_objective">
            <option value="lose"${(state.profile?.weight_objective || state.weight.objective) === "lose" ? " selected" : ""}>Lose weight</option>
            <option value="gain"${(state.profile?.weight_objective || state.weight.objective) === "gain" ? " selected" : ""}>Gain weight</option>
          </select>
        </label>
        <p class="hint">Sets whether weight drops are green (losing weight) or weight gains are green (gaining weight).</p>
      </section>
      <section class="card stack">
        <h2>Colours</h2>
        <div class="themes" role="group" aria-label="Colours">${choices}</div>
      </section>
      <section class="card stack">
        <p class="hint">Days follow the clock in Lisbon. Photos stay in your Claude chat. This site shows the meals that chat saved for your username.</p>
      </section>
    </form>`;
  }

  function nutrientModalHtml() {
    if (!state.nutrientModal) return "";
    const key = state.nutrientModal;
    const meta = targetByKey(key);
    const isPeriod = (state.view === "week" || state.view === "month");
    const sourceItems = isPeriod ? (state.period.items || []) : (state.items || []);

    const list = [];
    for (const item of sourceItems) {
      const val = valueOf(item, key);
      if (val > 0) {
        list.push({
          id: item.id,
          name: item.item_name || "Food",
          meal: item.meal_name || "Meal",
          portion: item.portion || "",
          eatenAt: item.eaten_at,
          val,
        });
      }
    }

    list.sort((a, b) => b.val - a.val);
    const total = list.reduce((s, x) => s + x.val, 0);
    const target = meta.target;
    const pctOfGoal = target ? Math.round((total / target) * 100) : null;
    const timeLabel = isPeriod ? (state.view === "week" ? "This week" : "This month") : (state.dateKey === todayKey() ? "Today" : formatTableDate(state.dateKey));

    const content = !list.length
      ? `<div class="empty-sources-box"><p class="hint">No logged foods provided ${esc(meta.label.toLowerCase())} ${timeLabel.toLowerCase()}.</p></div>`
      : `<div class="sources-list">${list.map((c, idx) => {
          const pct = total > 0 ? Math.round((c.val / total) * 100) : 0;
          const barWidth = Math.max(2, Math.min(pct, 100));
          const dateSub = isPeriod ? ` · ${esc(formatShort(dateKeyFromInstant(parseTime(c.eatenAt))))}` : "";
          return `<div class="source-item">
            <div class="source-item-head">
              <span class="source-rank">#${idx + 1}</span>
              <div class="source-details">
                <strong class="source-food-name">${esc(c.name)}</strong>
                <span class="source-meal-portion">${esc(c.meal)}${c.portion ? ` · ${esc(c.portion)}` : ""}${dateSub}</span>
              </div>
              <div class="source-amount">
                <strong class="num">${esc(key === 'calories' ? fmtInt(c.val) : fmtAmount(c.val))} ${esc(meta.unit)}</strong>
                <span class="source-pct">${pct}% of total</span>
              </div>
            </div>
            <div class="track" style="height: 5px; margin-top: 6px;"><span class="${DOT[key] || 'good'}" style="width: ${barWidth}%;"></span></div>
          </div>`;
        }).join("")}</div>`;

    return `<div class="modal-back" data-action="close-nutrient-modal">
      <div class="modal-card nutrient-modal" role="dialog" aria-modal="true" aria-labelledby="nutrient-modal-title" data-action="stop">
        <div class="nutrient-modal-header">
          <div>
            <h2 id="nutrient-modal-title">${esc(meta.label)} sources</h2>
            <p class="hint">${esc(timeLabel)}: <strong class="num">${esc(key === 'calories' ? fmtInt(total) : fmtAmount(total))} ${esc(meta.unit)}</strong>${target ? ` · ${pctOfGoal}% of ${esc(key === 'calories' ? fmtInt(target) : fmtAmount(target))} ${esc(meta.unit)} goal` : ""}</p>
          </div>
          <button type="button" class="icon-btn" data-action="close-nutrient-modal" aria-label="Close">${ICONS.close}</button>
        </div>
        ${content}
        <div class="nutrient-modal-footer">
          <button type="button" class="primary" data-action="close-nutrient-modal">Done</button>
        </div>
      </div>
    </div>`;
  }

  function confirmHtml() {
    if (!state.confirm) return "";
    return `<div class="modal-back" data-action="confirm-no">
      <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="confirm-title" data-action="stop">
        <h2 id="confirm-title">${esc(state.confirm.title)}</h2>
        <p>${esc(state.confirm.body)}</p>
        <div class="row-actions">
          <button type="button" class="secondary" id="confirm-cancel" data-action="confirm-no">Cancel</button>
          <button type="button" class="danger" data-action="confirm-yes">${esc(state.confirm.confirmLabel || "Delete")}</button>
        </div>
      </div>
    </div>`;
  }

  function tab(view, label, icon) {
    const current = state.view === view || (view === "day" && state.view === "edit");
    return `<button type="button" data-action="nav" data-view="${view}"${current ? ' aria-current="page"' : ""}>${icon}<span>${label}</span></button>`;
  }

  function shell(content) {
    const isModalOpen = Boolean(state.confirm || state.nutrientModal);
    return `<div class="app-shell"${isModalOpen ? " inert" : ""}>
      <header class="top"><div class="top-inner">
        <button type="button" class="brand" data-action="nav" data-view="day"><img class="logo" src="icons/Logo.png" alt="" width="40" height="40"><span class="brand-name">${esc(firstName())}</span></button>
        <nav class="tabbar" aria-label="Main">${tab("day", "Day", ICONS.day)}${tab("week", "Week", ICONS.week)}${tab("month", "Month", ICONS.month)}${tab("weight", "Weight", ICONS.weight)}</nav>
        <div class="header-actions">
          <button type="button" class="text-btn" data-action="sign-out">Sign out</button>
          <button type="button" class="icon-btn" data-action="nav" data-view="definitions" aria-label="Definitions"${state.view === "definitions" ? ' aria-current="page"' : ""}>${ICONS.gear}</button>
        </div>
      </div></header>
      <main>${content}</main>
    </div>
    ${nutrientModalHtml()}
    ${confirmHtml()}
    ${state.toast ? `<div class="toast" role="status">${esc(state.toast)}</div>` : ""}`;
  }

  function viewHtml() {
    if (state.view === "week" || state.view === "month") return window.Chart ? periodHtml() : '<p class="error">Could not load the charts. Check your connection and refresh.</p>';
    if (state.view === "weight") return weightHtml();
    if (state.view === "add") return addHtml();
    if (state.view === "edit") return editHtml();
    if (state.view === "definitions") return definitionsHtml();
    return dayHtml();
  }

  function render() {
    destroyCharts();
    setTitle();
    if (state.booting) {
      root.innerHTML = '<p class="boot">Loading…</p>';
      return;
    }
    if (!state.session) {
      root.innerHTML = loginHtml();
      paintedView = "login";
      return;
    }
    root.innerHTML = shell(viewHtml());
    if (state.view === "add") loadAddMeals(document.querySelector('[name="eaten_date"]')?.value || state.dateKey);
    mountCharts();
    if (state.view !== paintedView) {
      window.scrollTo(0, 0);
      paintedView = state.view;
    }
  }

  function openConfirm(options) {
    state.confirm = options;
    if (document.querySelector(".app-shell") && !document.querySelector(".modal-back")) {
      document.querySelector(".app-shell").setAttribute("inert", "");
      root.insertAdjacentHTML("beforeend", confirmHtml());
      document.getElementById("confirm-cancel")?.focus();
      return;
    }
    render();
    document.getElementById("confirm-cancel")?.focus();
  }

  function closeConfirm() {
    state.confirm = null;
    document.querySelector(".modal-back")?.remove();
    document.querySelector(".app-shell")?.removeAttribute("inert");
  }

  async function runConfirm() {
    const pending = state.confirm;
    if (!pending || state.saving) return;
    state.saving = true;
    const yes = document.querySelector('[data-action="confirm-yes"]');
    if (yes) {
      yes.disabled = true;
      yes.textContent = "Deleting…";
    }
    let message = "";
    try {
      message = await pending.run();
    } catch (error) {
      message = friendlyError(error, "Could not delete that. Check your connection and try again.");
    }
    state.saving = false;
    closeConfirm();
    if (message) state.error = message;
    else {
      state.error = "";
      flash("Deleted");
    }
    render();
  }

  async function deleteItem(id) {
    const uid = userId();
    if (!isUuid(id) || !uid) return "Could not delete that food.";
    const { data, error } = await client.from("food_items").delete().eq("id", id).eq("user_id", uid).select("id");
    if (error || !data || data.length !== 1) return friendlyError(error, "Could not delete that food. Check your connection and try again.");
    state.items = state.items.filter((item) => item.id !== id);
    if (state.editingId === id) {
      state.editingId = "";
      state.view = "day";
    }
    return "";
  }

  async function deleteMeal(groupId) {
    const uid = userId();
    if (!isUuid(groupId) || !uid) return "Could not delete that meal.";
    const { data, error } = await client.from("food_items").delete().eq("meal_group_id", groupId).eq("user_id", uid).select("id");
    if (error || !data || !data.length) return friendlyError(error, "Could not delete that meal. Check your connection and try again.");
    state.items = state.items.filter((item) => item.meal_group_id !== groupId);
    state.mealTimeGroup = "";
    return "";
  }

  async function saveMealType(select) {
    const groupId = select.dataset.group;
    const mealName = select.value;
    const uid = userId();
    if (!isUuid(groupId) || !mealName || !uid) return;
    select.disabled = true;
    try {
      const { data, error } = await client.from("food_items").update({ meal_name: mealName }).eq("meal_group_id", groupId).eq("user_id", uid).select("id");
      if (error || !data || !data.length) {
        state.error = friendlyError(error, "Could not change that meal. Check your connection and try again.");
        render();
        return;
      }
      state.items.forEach((item) => { if (item.meal_group_id === groupId) item.meal_name = mealName; });
      state.error = "";
      flash("Meal updated");
      render();
    } catch (error) {
      state.error = friendlyError(error, "Could not change that meal. Check your connection and try again.");
      render();
    }
  }

  async function saveMealTime(button) {
    const groupId = button.dataset.group;
    const card = button.closest(".meal");
    const dateKey = card?.querySelector('[name="meal_date"]')?.value || "";
    const time = card?.querySelector('[name="meal_time"]')?.value || "";
    const uid = userId();
    if (!isUuid(groupId) || !uid) return;
    const when = lisbonWallToUtc(dateKey, withSeconds(time));
    if (!when) {
      state.error = "That time does not exist in Lisbon (the clocks skip forward). Choose another time.";
      render();
      return;
    }
    button.disabled = true;
    const iso = when.toISOString();
    try {
      const { data, error } = await client.from("food_items").update({ eaten_at: iso }).eq("meal_group_id", groupId).eq("user_id", uid).select("id");
      if (error || !data || !data.length) {
        state.error = friendlyError(error, "Could not change the time. Check your connection and try again.");
        render();
        return;
      }
      state.mealTimeGroup = "";
      state.error = "";
      if (dateKeyFromInstant(when) !== state.dateKey) {
        state.items = state.items.filter((item) => item.meal_group_id !== groupId);
        flash(`Meal moved to ${formatDayHeading(dateKey)}`);
      } else {
        state.items.forEach((item) => { if (item.meal_group_id === groupId) item.eaten_at = iso; });
        flash("Meal time saved");
      }
      render();
    } catch (error) {
      state.error = friendlyError(error, "Could not change the time. Check your connection and try again.");
      render();
    }
  }

  function collectNumbers(scope) {
    const values = {};
    for (const key of COLUMN_KEYS) {
      const input = scope.querySelector(`[name="${key}"]`);
      if (!input) continue;
      const parsed = parseOptionalNumber(input.value);
      const problem = numberError(parsed);
      if (problem) return { error: problem };
      values[key] = parsed;
    }
    return { values };
  }

  function collectMicros(scope, existing) {
    const micros = {};
    for (const [key, value] of Object.entries(microsOf(existing))) {
      if (!knownMicroKeys().includes(key)) micros[key] = value;
    }
    for (const key of knownMicroKeys()) {
      const input = scope.querySelector(`[name="micro_${key}"]`);
      if (!input) continue;
      const parsed = parseOptionalNumber(input.value);
      const problem = numberError(parsed);
      if (problem) return { error: problem };
      if (parsed != null) micros[key] = parsed;
    }
    return { micros };
  }

  function readItem(scope, existing) {
    const itemName = scope.querySelector('[name="item_name"]')?.value.trim() || "";
    if (!itemName) return { error: "Give this food a name." };
    const numbers = collectNumbers(scope);
    if (numbers.error) return numbers;
    const micros = collectMicros(scope, existing);
    if (micros.error) return micros;
    const portion = scope.querySelector('[name="portion"]')?.value.trim() || "";
    const notes = scope.querySelector('[name="notes"]')?.value.trim() || "";
    return {
      item: {
        item_name: itemName,
        portion: portion || null,
        notes: notes || null,
        calories: numbers.values.calories ?? null,
        protein_g: numbers.values.protein_g ?? null,
        carbs_g: numbers.values.carbs_g ?? null,
        fat_g: numbers.values.fat_g ?? null,
        fiber_g: numbers.values.fiber_g ?? null,
        sugar_g: numbers.values.sugar_g ?? null,
        saturated_fat_g: numbers.values.saturated_fat_g ?? null,
        micros: micros.micros,
      },
    };
  }

  function rowIsBlank(row) {
    return [...row.querySelectorAll("input, textarea")].every((input) => input.value.trim() === "");
  }

  function readAddRows(form) {
    const items = [];
    for (const row of form.querySelectorAll("[data-item-row]")) {
      if (rowIsBlank(row)) continue;
      const parsed = readItem(row, null);
      if (parsed.error) return parsed;
      items.push(parsed.item);
    }
    if (!items.length) return { error: "Add at least one food." };
    return { items };
  }

  function readRecent() {
    try {
      const parsed = JSON.parse(localStorage.getItem(recentStorageKey()) || "[]");
      if (!Array.isArray(parsed)) return [];
      return parsed.map(sanitizeRecent).filter(Boolean).slice(0, 10);
    } catch {
      return [];
    }
  }

  function sanitizeRecent(entry) {
    if (!entry || typeof entry.item_name !== "string" || !entry.item_name.trim()) return null;
    const item = { item_name: entry.item_name.slice(0, 200), portion: typeof entry.portion === "string" ? entry.portion.slice(0, 80) : "", notes: "", micros: {} };
    for (const key of COLUMN_KEYS) {
      const parsed = Number(entry[key]);
      item[key] = Number.isFinite(parsed) ? parsed : null;
    }
    const micros = entry.micros && typeof entry.micros === "object" ? entry.micros : {};
    for (const key of knownMicroKeys()) {
      const parsed = Number(micros[key]);
      if (Number.isFinite(parsed)) item.micros[key] = parsed;
    }
    return item;
  }

  function rememberItems(items) {
    const recent = readRecent();
    for (const item of items) {
      const saved = sanitizeRecent(item);
      if (!saved) continue;
      const index = recent.findIndex((entry) => entry.item_name.toLowerCase() === saved.item_name.toLowerCase());
      if (index >= 0) recent.splice(index, 1);
      recent.unshift(saved);
    }
    try { localStorage.setItem(recentStorageKey(), JSON.stringify(recent.slice(0, 10))); } catch { /* ignore */ }
  }

  function useRecent(index) {
    const item = readRecent()[index];
    if (!item) return;
    const rows = [...document.querySelectorAll("[data-item-row]")];
    const empty = rows.find(rowIsBlank);
    const html = itemRowHtml(item);
    if (empty) empty.outerHTML = html;
    else document.getElementById("item-rows")?.insertAdjacentHTML("beforeend", html);
  }

  function clearRow(row) {
    row.querySelectorAll("input, textarea").forEach((input) => { input.value = ""; });
  }

  async function loadAddMeals(dateKey) {
    const select = document.getElementById("existing-meal");
    const note = document.getElementById("existing-meal-note");
    if (!select) return;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey || "")) {
      select.innerHTML = '<option value="">Choose a date first</option>';
      return;
    }
    const token = ++addMealToken;
    select.innerHTML = '<option value="">Loading meals…</option>';
    try {
      const items = await fetchBetween(dateKey, addDays(dateKey, 1));
      if (token !== addMealToken || !select.isConnected) return;
      const meals = groupMeals(items);
      if (!meals.length) {
        select.innerHTML = '<option value="">No meals on this day yet</option>';
        if (note) note.textContent = "Log a new meal, or pick another day.";
        return;
      }
      if (note) note.textContent = "";
      select.innerHTML = meals.map((meal) => {
        const label = `${meal.meal_name} · ${formatTime(meal.eaten_at)} · ${fmtInt(sumItems(meal.items, "calories"))} kcal`;
        return `<option value="${esc(meal.meal_group_id)}" data-eaten-at="${esc(meal.eaten_at)}" data-meal-name="${esc(meal.meal_name)}">${esc(label)}</option>`;
      }).join("");
    } catch {
      if (token !== addMealToken) return;
      select.innerHTML = '<option value="">Could not load meals</option>';
      if (note) note.textContent = "Check your connection, or log a new meal instead.";
    }
  }

  function syncAddMode() {
    const form = document.getElementById("add-form");
    if (!form) return;
    const mode = form.querySelector('input[name="add-mode"]:checked')?.value || "new";
    form.querySelector("#new-meal-fields").hidden = mode !== "new";
    form.querySelector("#existing-meal-fields").hidden = mode !== "existing";
  }

  function failForm(form, button, label, message) {
    const error = form.querySelector(".form-error");
    if (error) error.textContent = message;
    if (button) {
      button.disabled = false;
      button.textContent = label;
    }
  }

  async function submitAdd(form) {
    const button = form.querySelector('button[type="submit"]');
    const parsed = readAddRows(form);
    if (parsed.error) return failForm(form, null, "", parsed.error);
    const dateKey = form.eaten_date.value;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return failForm(form, null, "", "Choose a date.");
    const mode = form.querySelector('input[name="add-mode"]:checked')?.value || "new";
    let mealGroupId = "";
    let eatenAt = "";
    let mealName = "";
    if (mode === "existing") {
      const select = form.querySelector("#existing-meal");
      const option = select?.selectedOptions?.[0];
      mealGroupId = select?.value || "";
      eatenAt = option?.getAttribute("data-eaten-at") || "";
      mealName = option?.getAttribute("data-meal-name") || "";
      if (!isUuid(mealGroupId) || !eatenAt || !mealName) return failForm(form, null, "", "Choose the meal to add to, or log a new meal.");
    } else {
      mealName = form.meal_name.value;
      const time = form.eaten_time.value;
      if (!MEAL_TYPES.includes(mealName)) return failForm(form, null, "", "Choose breakfast, lunch, dinner or snack.");
      const when = lisbonWallToUtc(dateKey, withSeconds(time));
      if (!when) return failForm(form, null, "", "That time does not exist in Lisbon (the clocks skip forward). Choose another time.");
      if (!crypto.randomUUID) return failForm(form, null, "", "Adding a meal needs a secure page (https). Open the hosted site and try again.");
      mealGroupId = crypto.randomUUID();
      eatenAt = when.toISOString();
    }
    const uid = userId();
    if (!uid) return failForm(form, null, "", "Sign in again, then save this meal.");
    const rows = parsed.items.map((item) => ({ ...item, user_id: uid, meal_group_id: mealGroupId, eaten_at: eatenAt, meal_name: mealName }));
    button.disabled = true;
    button.textContent = "Saving…";
    try {
      const { data, error } = await client.from("food_items").insert(rows).select("id");
      if (error || !data || data.length !== rows.length) {
        failForm(form, button, "Save meal", friendlyError(error, "Could not save. Check your connection and try again."));
        return;
      }
      rememberItems(parsed.items);
      state.dateKey = mode === "existing" ? dateKeyFromInstant(parseTime(eatenAt)) : dateKey;
      state.view = "day";
      flash("Meal saved");
      loadDay();
    } catch (error) {
      failForm(form, button, "Save meal", friendlyError(error, "Could not save. Check your connection and try again."));
    }
  }

  async function submitEdit(form) {
    const button = form.querySelector('button[type="submit"]');
    const id = state.editingId;
    const existing = state.items.find((item) => item.id === id);
    const uid = userId();
    if (!isUuid(id) || !existing || !uid) return failForm(form, null, "", "That food is no longer on this day.");
    const parsed = readItem(form, existing);
    if (parsed.error) return failForm(form, null, "", parsed.error);
    button.disabled = true;
    button.textContent = "Saving…";
    try {
      const { data, error } = await client.from("food_items").update(parsed.item).eq("id", id).eq("user_id", uid).select("id");
      if (error || !data || data.length !== 1) {
        failForm(form, button, "Save", friendlyError(error, "Could not save. Check your connection and try again."));
        return;
      }
      state.editingId = "";
      state.view = "day";
      flash("Saved");
      loadDay();
    } catch (error) {
      failForm(form, button, "Save", friendlyError(error, "Could not save. Check your connection and try again."));
    }
  }

  function readGoalFields(form) {
    const calories = parseOptionalNumber(form.calories.value);
    const protein = parseOptionalNumber(form.protein.value);
    const carbs = parseOptionalNumber(form.carbs.value);
    const fat = parseOptionalNumber(form.fat.value);
    if ([calories, protein, carbs, fat].some((value) => value == null || Number.isNaN(value) || value < 0)) {
      return { error: "Use numbers for the calorie goal and the three percentages." };
    }
    if (calories <= 0) return { error: "The calorie goal needs to be more than zero." };
    if (Math.abs(protein + carbs + fat - 100) > 0.51) return { error: "Protein, carbs and fat need to add up to 100." };
    return { goal: { calories, protein, carbs, fat } };
  }

  function updateGoalPreview(form) {
    const box = form.querySelector("#goal-preview");
    const split = form.querySelector(".split");
    if (!box || !split) return;
    const goal = {
      calories: num(form.calories.value),
      protein: num(form.protein.value),
      carbs: num(form.carbs.value),
      fat: num(form.fat.value),
    };
    const grams = macroGrams(goal);
    box.textContent = Math.abs(goal.protein + goal.carbs + goal.fat - 100) > 0.51
      ? "These three numbers need to add up to 100."
      : `Protein ${fmtAmount(grams.protein_g)} g · Carbs ${fmtAmount(grams.carbs_g)} g · Fat ${fmtAmount(grams.fat_g)} g`;
    ["protein", "carbs", "fat"].forEach((name, index) => {
      const part = split.children[index];
      if (part) part.style.width = `${Math.max(goal[name], 0)}%`;
    });
  }

  async function saveGoals(form) {
    const parsed = readGoalFields(form);
    if (parsed.error) {
      failForm(form, null, "", parsed.error);
      return;
    }
    const uid = userId();
    const button = form.querySelector('button[type="submit"]');
    if (!uid) return failForm(form, null, "", "Sign in again, then save your goals.");
    if (button) {
      button.disabled = true;
      button.textContent = "Saving…";
    }
    const wObj = form.querySelector('[name="weight_objective"]')?.value;
    const updates = {
      calorie_goal: Math.round(parsed.goal.calories),
      protein_pct: parsed.goal.protein,
      carbs_pct: parsed.goal.carbs,
      fat_pct: parsed.goal.fat,
    };
    if (wObj) updates.weight_objective = wObj;
    const { error } = await client.from("profiles").update(updates).eq("id", uid);
    if (error) return failForm(form, button, "Save goals", "Could not save your goals. Check your connection and try again.");
    if (wObj) saveWeightSettings({ objective: wObj });
    state.profile = {
      ...state.profile,
      ...updates,
    };
    flash("Goals saved");
    render();
  }

  function loginHtml() {
    return `<div class="login">
      <form class="card login-card" data-form="sign-in" autocomplete="on">
        <img class="logo" src="icons/Logo.png" alt="" width="40" height="40">
        <h1>Tracker</h1>
        <p>Type your username. Claude saves meals onto that same username, and this site shows them.</p>
        <label class="field"><span>Username</span><input name="username" type="text" autocomplete="username" autocapitalize="none" spellcheck="false" required></label>
        <button type="submit" class="primary"${state.signingIn ? " disabled" : ""}>${state.signingIn ? "One moment…" : "Open"}</button>
        <p class="hint">Anyone who knows this username can open these stats. Pick one you will remember.</p>
        ${state.authError ? `<p class="error" role="alert">${esc(state.authError)}</p>` : ""}
      </form>
    </div>`;
  }

  let authEpoch = 0;

  function showSignedOut() {
    authEpoch += 1;
    state.session = null;
    state.profile = null;
    state.items = [];
    state.weight.entries = [];
    state.weight.loaded = false;
    state.weight.error = "";
    state.view = "day";
    state.editingId = "";
    state.mealTimeGroup = "";
    state.confirm = null;
    state.booting = false;
    state.signingIn = false;
    state.error = "";
    render();
  }

  async function loadProfile(session) {
    const uid = session.user.id;
    let { data, error } = await client
      .from("profiles")
      .select("id, display_name, calorie_goal, protein_pct, carbs_pct, fat_pct, theme, weight_objective")
      .eq("id", uid)
      .maybeSingle();
    if (error) throw error;
    if (!data) {
      const created = await client.from("profiles").insert({
        id: uid,
        display_name: displayNameFrom(session.user),
      }).select("id, display_name, calorie_goal, protein_pct, carbs_pct, fat_pct, theme, weight_objective").single();
      if (created.error) throw created.error;
      data = created.data;
    }
    state.profile = {
      id: data.id,
      display_name: data.display_name || displayNameFrom(session.user),
      calorie_goal: Number(data.calorie_goal) || DEFAULT_GOALS.calories,
      protein_pct: Number(data.protein_pct),
      carbs_pct: Number(data.carbs_pct),
      fat_pct: Number(data.fat_pct),
      theme: data.theme || state.theme || "light",
      weight_objective: data.weight_objective || state.weight.objective || "lose",
    };
    if (data.theme) {
      setTheme(data.theme, true);
    } else if (state.theme) {
      client.from("profiles").update({ theme: state.theme }).eq("id", uid).then(() => {}).catch(() => {});
    }
    if (data.weight_objective) {
      state.weight.objective = data.weight_objective;
    }
    const onDevice = deviceGoals();
    const stillDefault = state.profile.calorie_goal === DEFAULT_GOALS.calories
      && state.profile.protein_pct === DEFAULT_GOALS.protein
      && state.profile.carbs_pct === DEFAULT_GOALS.carbs
      && state.profile.fat_pct === DEFAULT_GOALS.fat;
    const deviceDiffers = onDevice && (
      onDevice.calories !== DEFAULT_GOALS.calories
      || onDevice.protein !== DEFAULT_GOALS.protein
      || onDevice.carbs !== DEFAULT_GOALS.carbs
      || onDevice.fat !== DEFAULT_GOALS.fat
    );
    if (stillDefault && deviceDiffers) {
      const updated = await client.from("profiles").update({
        calorie_goal: Math.round(onDevice.calories),
        protein_pct: onDevice.protein,
        carbs_pct: onDevice.carbs,
        fat_pct: onDevice.fat,
      }).eq("id", uid);
      if (!updated.error) {
        state.profile.calorie_goal = Math.round(onDevice.calories);
        state.profile.protein_pct = onDevice.protein;
        state.profile.carbs_pct = onDevice.carbs;
        state.profile.fat_pct = onDevice.fat;
      }
    }
  }

  async function afterSignIn(session) {
    const epoch = ++authEpoch;
    state.session = session;
    state.authError = "";
    state.signingIn = false;
    try {
      await loadProfile(session);
      if (epoch !== authEpoch) return;
      const claimed = await client.rpc("claim_unowned_meals");
      if (epoch !== authEpoch) return;
      if (!claimed.error && Number(claimed.data) > 0) state.toast = "Your earlier meals are on your account now.";
    } catch (error) {
      if (epoch !== authEpoch) return;
      state.error = friendlyError(error, "Could not open your account. Check your connection and try again.");
    }
    if (epoch !== authEpoch) return;
    state.booting = false;
    if (!state.dateKey) state.dateKey = todayKey();
    loadDay();
  }

  async function openWord(word) {
    let response;
    try {
      response = await fetch(`${SUPABASE_URL}/functions/v1/codename-auth`, {
        method: "POST",
        headers: { "content-type": "application/json", apikey: SUPABASE_KEY },
        body: JSON.stringify({ username: word }),
      });
    } catch {
      throw new Error("Could not reach sign-in. Check your connection and try again.");
    }
    const body = await response.json().catch(() => ({}));
    if (!response.ok || !body.access_token || !body.refresh_token) {
      throw new Error(body.message || "Could not open that username. Try again.");
    }
    const { data, error } = await client.auth.setSession({
      access_token: body.access_token,
      refresh_token: body.refresh_token,
    });
    if (error || !data.session) throw new Error("Could not open that username. Try again.");
    return data.session;
  }

  async function signIn(word) {
    const typed = String(word || "").trim();
    if (!/^[A-Za-z][A-Za-z0-9]{2,31}$/.test(typed)) {
      state.authError = "Use a username of 3 to 32 letters or numbers, starting with a letter.";
      render();
      return;
    }
    state.signingIn = true;
    state.authError = "";
    render();
    try {
      const session = await openWord(typed);
      await afterSignIn(session);
    } catch (error) {
      state.signingIn = false;
      state.authError = error instanceof Error && error.message
        ? error.message
        : "Could not open that username. Try again.";
      render();
    }
  }

  async function signOut() {
    const { error } = await client.auth.signOut();
    if (error) {
      state.error = "Could not sign out. Check your connection and try again.";
      render();
      return;
    }
    showSignedOut();
  }

  function shiftPeriod(direction) {
    const kind = state.period.kind === "month" ? "month" : "week";
    const anchor = state.period.anchor || todayKey();
    if (direction < 0) {
      const { start } = periodBounds(kind, anchor);
      state.period.anchor = addDays(start, -1);
    } else {
      const next = kind === "month" ? addDays(monthEnd(anchor), 1) : addDays(weekStart(anchor), 7);
      if (next > todayKey()) return;
      state.period.anchor = next;
    }
    loadPeriod();
  }

  function navigate(view) {
    state.confirm = null;
    if (view === "day") {
      state.editingId = "";
      state.mealTimeGroup = "";
      if (state.view === "day") {
        render();
        window.scrollTo(0, 0);
        return;
      }
      loadDay();
      return;
    }
    if (view === "weight") {
      loadWeight();
      return;
    }
    if (view === "week" || view === "month") {
      if (state.view === "day" || state.view === "edit" || state.view === "add" || !state.period.anchor) {
        state.period.anchor = state.dateKey || todayKey();
      }
      state.period.kind = view;
      loadPeriod();
      return;
    }
    if (view === "add") {
      if (state.view === "add") return;
      state.view = "add";
      render();
      return;
    }
    if (view === "definitions") {
      state.view = "definitions";
      render();
    }
  }

  function onClick(event) {
    const button = event.target.closest("[data-action]");
    if (!button || !root.contains(button)) return;
    const action = button.dataset.action;
    if (action === "stop") return;
    if (action === "confirm-no") {
      closeConfirm();
      return;
    }
    if (action === "confirm-yes") {
      runConfirm();
      return;
    }
    if (action === "sign-out") {
      signOut();
      return;
    }

    if (action === "view-nutrient") {
      state.nutrientModal = button.dataset.key;
      render();
      return;
    }
    if (action === "close-nutrient-modal") {
      state.nutrientModal = null;
      render();
      return;
    }
    if (action === "nav") navigate(button.dataset.view);
    else if (action === "prev-day") {
      state.dateKey = addDays(state.dateKey, -1);
      state.mealTimeGroup = "";
      loadDay();
    } else if (action === "next-day") {
      state.dateKey = addDays(state.dateKey, 1);
      state.mealTimeGroup = "";
      loadDay();
    } else if (action === "today") {
      state.dateKey = todayKey();
      state.mealTimeGroup = "";
      loadDay();
    }     else if (action === "reload-day") loadDay();
    else if (action === "reload-period") loadPeriod();
    else if (action === "reload-weight") loadWeight();
    else if (action === "prev-period") shiftPeriod(-1);
    else if (action === "next-period") shiftPeriod(1);
    else if (action === "back") {
      state.view = "day";
      state.editingId = "";
      render();
    } else if (action === "edit-item") {
      state.editingId = button.dataset.id;
      state.view = "edit";
      render();
    } else if (action === "edit-meal-time") {
      state.mealTimeGroup = button.dataset.group;
      render();
    } else if (action === "cancel-meal-time") {
      state.mealTimeGroup = "";
      render();
    } else if (action === "save-meal-time") saveMealTime(button);
    else if (action === "ask-delete-item") {
      const item = state.items.find((row) => row.id === button.dataset.id);
      if (!item) return;
      openConfirm({
        title: "Delete this food?",
        body: `${item.item_name} will be removed. This cannot be undone.`,
        confirmLabel: "Delete",
        run: () => deleteItem(item.id),
      });
    } else if (action === "ask-delete-weight") {
      const entry = state.weight.entries.find((row) => row.id === button.dataset.id);
      if (!entry) return;
      openConfirm({
        title: "Delete this weight?",
        body: `${fmtAmount(entry.weight_kg)} kg on ${formatTableDate(entry.weighed_on)} will be removed.`,
        confirmLabel: "Delete",
        run: () => deleteWeight(entry.id),
      });
    } else if (action === "ask-delete-meal") {
      const meal = groupMeals(state.items).find((row) => row.meal_group_id === button.dataset.group);
      if (!meal) return;
      openConfirm({
        title: `Delete this ${meal.meal_name}?`,
        body: "Every food in this meal will be removed. This cannot be undone.",
        confirmLabel: "Delete",
        run: () => deleteMeal(meal.meal_group_id),
      });
    } else if (action === "add-row") document.getElementById("item-rows")?.insertAdjacentHTML("beforeend", itemRowHtml({}));
    else if (action === "remove-row") {
      const row = button.closest("[data-item-row]");
      if (!row) return;
      if (document.querySelectorAll("[data-item-row]").length <= 1) clearRow(row);
      else row.remove();
    } else if (action === "use-recent") useRecent(Number(button.dataset.index));
    else if (action === "theme") setTheme(button.dataset.themeChoice);
    else if (action === "reload") location.reload();
  }

  function onSubmit(event) {
    const form = event.target;
    if (!(form instanceof HTMLFormElement) || !root.contains(form)) return;
    event.preventDefault();
    if (form.dataset.form === "sign-in") signIn(form.username.value);
    else if (form.dataset.form === "add") submitAdd(form);
    else if (form.dataset.form === "edit") submitEdit(form);
    else if (form.dataset.form === "weight") submitWeight(form);
    else if (form.dataset.form === "goals") saveGoals(form);
    else if (form.dataset.form === "meal-time") {
      const button = form.querySelector('[data-action="save-meal-time"]');
      if (button) saveMealTime(button);
    }
  }

  function onChange(event) {
    const target = event.target;
    if (target.name === "weight_objective") {
      saveWeightSettings({ objective: target.value });
      return;
    }

    if (target.dataset?.action === "meal-type") {
      saveMealType(target);
      return;
    }
    if (target.id === "day-picker" && /^\d{4}-\d{2}-\d{2}$/.test(target.value)) {
      state.dateKey = target.value;
      state.mealTimeGroup = "";
      loadDay();
      return;
    }
    if (target.name === "add-mode") {
      syncAddMode();
      return;
    }
    if (target.name === "eaten_time" && target.form?.dataset.form === "add") {
      const meal = target.form.querySelector('[name="meal_name"]');
      if (meal && meal.dataset.touched !== "1") meal.value = mealTypeForTime(target.value);
      return;
    }
    if (target.name === "meal_name" && target.form?.dataset.form === "add") {
      target.dataset.touched = "1";
      return;
    }
    if (target.name === "eaten_date" && target.form?.dataset.form === "add") {
      loadAddMeals(target.value);
      return;
    }
    if (target.name === "weighed_on" && target.form?.dataset.form === "weight") {
      const entry = state.weight.entries.find((row) => row.weighed_on === target.value);
      const input = target.form.querySelector('[name="weight_kg"]');
      if (input) input.value = entry ? displayNumber(entry.weight_kg) : "";
    }
  }

  root.addEventListener("click", onClick);
  root.addEventListener("submit", onSubmit);
  root.addEventListener("change", onChange);
  root.addEventListener("input", (event) => {
    if (event.target.form?.dataset.form === "goals") updateGoalPreview(event.target.form);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      if (state.nutrientModal) {
        state.nutrientModal = null;
        render();
        return;
      }
      if (state.confirm) closeConfirm();
    }
  });
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState !== "visible" || state.booting || !state.session || state.confirm || state.saving) return;
    if (state.view === "day") loadDay();
    if (state.view === "week" || state.view === "month") loadPeriod();
    if (state.view === "weight") loadWeight();
  });

  applyTheme(state.theme);
  assertLisbonDays();
  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }

  client.auth.onAuthStateChange((event) => {
    if (event === "SIGNED_OUT") queueMicrotask(() => showSignedOut());
  });

  client.auth.getSession().then(({ data, error }) => {
    if (error || !data.session) {
      state.booting = false;
      state.session = null;
      render();
      return;
    }
    afterSignIn(data.session);
  }).catch(() => {
    state.booting = false;
    state.session = null;
    state.authError = "Could not start sign-in. Check your connection and refresh.";
    render();
  });
})();
