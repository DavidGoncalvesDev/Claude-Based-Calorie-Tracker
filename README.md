# David Tracker

A website for your meals. Each person signs in with their email and sees only the meals on their account, including meals their own Claude chat saved from a photo. It works in a phone browser and on a computer, and you can put it on your phone's home screen.

The site does not look at photos and it does not store photos. Keep sending food photos to Claude. Claude saves the estimate, and this site is where you check and correct it.

Days and times follow the clock in Lisbon.

## Run it on your computer

1. Install Node.js from [https://nodejs.org](https://nodejs.org) if you do not have it. The long-term version is fine.
2. Open a terminal in this folder.
3. Run `npm install`.
4. Run `npm start`.
5. Open [http://localhost:4173](http://localhost:4173).

There is no build step. The pages are the files themselves. `npm start` only opens them in a small local server.

## Before you use it

Open the site and enter your email. Use `daviddionisiogoncalves2@gmail.com` for the meals already saved, including breakfast on **16 October 2026**. Open the link in that inbox on the same device. Do not put the secret `service_role` key in these files.

## Put the site on the internet (free)

Use Netlify. It is free for a site like this.

1. Go to [https://app.netlify.com](https://app.netlify.com) and create a free account. Choose **Sign up with GitHub** if you can.
2. Click **Add new site**, then **Import an existing project**.
3. Choose **GitHub**, then choose this project (`Claude-Based-Calorie-Tracker`).
4. If it asks for a build command, leave that box empty. There is no build.
5. If it asks for a publish directory, enter a single dot: `.`
6. Click **Deploy**.
7. Wait until it says the site is live. Copy the address. It ends in `.netlify.app`.

You can rename that address later in Netlify under **Site configuration**, then **Change site name**.

### If you cannot connect GitHub

Go to [https://app.netlify.com/drop](https://app.netlify.com/drop) and drag this whole folder onto the page. That also gives you a free address. If you change the files later, drag the folder up again.

## Add it to your phone

Open the Netlify address in the phone's browser.

**iPhone (Safari)**  
Tap the Share button, then **Add to Home Screen**.

**Android (Chrome)**  
Tap the browser menu (three dots), then **Install app** or **Add to Home screen**.

The icon is the steak picture, kept as a PNG with a transparent background. After that, it opens like a small app. Your food is always loaded fresh. The icon and pages can be saved on the phone so the screen still opens with a poor connection, but the meals themselves are not stored on the phone.

## How to use it

- **Day** is today in Lisbon. Use the arrows or the date to look at another day. **Today** jumps back. The name and the steak icon in the corner also jump back to the day you were looking at.
- The ring is calories eaten against the goal. The ring is orange, and it turns red above 105% of the goal.
- Protein stays blue, carbs stay amber, and fat stays pink, however full the bar is. Fiber, sugar, saturated fat, vitamins and minerals still change colour with progress: green means you are close to a goal (90% or more), amber is halfway, orange is under halfway. Sugar, saturated fat and sodium stay green until you go over the limit, then they turn red.
- Vitamins and minerals sit above the meals. Meals are newest first.
- Tap a food to correct it. **Delete food** asks you first.
- On a meal, the dropdown changes Breakfast, Lunch, Dinner or Snack for the whole meal. **Change time** moves the whole meal. **Delete meal** removes every food in it, after you confirm.
- **Add** logs food yourself. The meal type starts from the time: before 11:00 breakfast, until 15:30 lunch, until 18:30 snack, then dinner. You can add several foods to one meal, or add a food to a meal that is already there.
- Foods you have typed before appear under **Recent** on this phone or computer, so you can tap them again.
- **Week** and **Month** show calories and macros for the days that actually have food. A week with three logged days uses those three days, not seven empty ones. Use the arrows to look at an earlier week or month.
- **Weight** is where you log kilograms. One weight per day: saving the same day again replaces it. The line shows how that weight has moved, and **Delete** removes a day after you confirm.
- The sliders icon opens **Definitions**, where you set the calorie goal, how protein, carbs and fat share those calories, and the colour of the site.

## Change the daily goals

Open the site and tap the sliders icon. That page is called Definitions.

- **Daily calories** is the number in the ring.
- **Macro split** is how those calories are shared between protein, carbs and fat. The three percentages need to add up to 100. The site turns them into grams for you.
- **Colours** has five looks: Light, Dark, Dark blue, Dark green and Warm. Pick one and the whole site changes.

The calorie goal is saved on the email account. Colours stay on this phone or computer. These are ordinary goals, not medical advice.

If Netlify is connected to GitHub, the site updates itself a minute or two after the new file is on GitHub. Refresh the page. If the phone still shows the old page, close the home-screen app and open it again.

## If something goes wrong

- **"Could not load your food."** Check the internet connection, then tap **Try again**.
- **The phone shows an old version.** Close the app completely and open it again.

## What stays out of the files

Never paste the secret `service_role` key, or the database password, into these files. The key already in `app.js` is the public one, and it is supposed to be there. Meals are readable only by the signed-in account.
