# Calorie Tracker

A small tracker for a few people. Each person uses their own username and sees only their meals.

Photos never go on the website. You send a food photo in your own Claude chat. Claude estimates the meal and saves the numbers. This site is where you check that day, correct a food, or log something yourself.

## How a meal is saved

1. You send a photo in your own Claude chat.
2. A shared skill tells Claude to estimate each food and save it through one connector.
3. The connector stores the numbers on the username you connected in Claude.
4. The website shows that day after you type the same username.

The skill can be shared. It has no database password in it. Claude asks for your username the first time it connects, and later meals stay on that username. A friend uses the same skill and their own username, and they only see their own meals.

## What the site shows

Days and times follow the clock in Lisbon. A day view lists meals, calories, and macros against your goal. Week and month views use the days that actually have food. You can change a food, move a meal, delete one, or add food without a photo. Weight is a separate log, one entry per day.

The calorie goal and the split between protein, carbs, and fat are saved on that username. Colours stay on the phone or computer you are using.

## What stays private

The site stores numbers, not photos. Photos stay in each person's Claude chat. Opening an account is the username itself, so anyone who knows the username can see those meals. One username cannot read or change another username's meals.
