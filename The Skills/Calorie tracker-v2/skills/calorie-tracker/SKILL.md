---
name: "calorie-tracker"
description: Calorie tracker skill. Use whenever the user uploads a photo of food or a meal (even with no caption) to estimate portion size, calories, macros and micronutrients and save them to that person's account. Also use whenever the user says "result", "results", "show result", or asks how their day is going vs their goal. Trigger on any food photo, "log this", "I ate...", or "result".
---

# Calorie Tracker

Photos stay in this chat. You estimate the meal and save it with the Calorie Tracker connector, onto the email address that is connected. The website shows that same email after the person signs in.

Do not use a Supabase connector. Do not write local JSON files. Do not build an HTML report. Do not invent a saved meal if the connector is missing or not signed in.

A day follows the clock in Europe/Lisbon, which is what the website uses.

## Connector
Tools: `log_foods`, `day_summary`, `undo_last`, `set_goals`.

If a tool is missing, or it says the person is not connected, stop and tell them to add this connector in Claude:

`https://eurqqiebokwcrrhfbihg.supabase.co/functions/v1/calorie-mcp`

They sign in with the same email they use on the website. Then retry the save. Do not fall back to a local file.

## Diet
Do not assume a cooking fat, a type of milk, or an intolerance unless this person has said so in the chat, or the photo shows it. If they give a caption or a weight, trust that over your visual estimate.

## Mode 1: LOG (a food photo or "I ate...")
1. If it is not food, say so and stop.
2. Identify each food. Estimate the portion in grams from the plate, fork, hand, cup, packaging, or a caption. Note visible oil, sauce, and cheese.
3. Estimate nutrients for each food separately. Be realistic: restaurant and fried food usually has more fat and sodium than it looks.
4. Choose the meal from the Lisbon time of the photo: before 11:00 Breakfast, until 15:30 Lunch, until 18:30 Snack, otherwise Dinner. If the person names the meal, use that.
5. Call `log_foods` once for the whole photo. `eaten_at` is the current Lisbon time as ISO-8601. `items` has one object per food. Every nutrient field is required; use 0 when there is none.
6. Reply short, for a phone: what you think it is, the portion, then kcal and protein/carbs/fat for the meal, then the running total from the tool like `1,450 / 3,000 kcal · 1,550 left`. Mention confidence if oil or sauce is hidden, and invite a correction.
7. If they correct a meal, call `undo_last` for that Lisbon date, then call `log_foods` again.
8. Do not list every vitamin in the chat.

## Mode 2: RESULT (the person says "result")
1. Call `day_summary` for today in Lisbon.
2. In 2 or 3 lines: calories against their goal, the biggest macro gap, and the 1 or 2 nutrients most under target (or sodium, sugar, or saturated fat if those are over).
3. One practical suggestion for what to eat next. Never moralize.
4. Tell them the full day, week, and corrections are on the website.
5. Say once that the numbers are estimates, not medical advice.

## Changing the goal
If they give a new calorie goal or a new protein/carbs/fat split, call `set_goals`. The three percentages must add up to 100. The goal is saved on their account, so the website uses it too.
