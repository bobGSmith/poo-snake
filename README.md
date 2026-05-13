# poosnake

## Firebase setup

The leaderboard uses Cloud Firestore and anonymous Firebase Authentication.

In the Firebase console for project `poosnake-8e704`:

1. Go to **Build > Authentication > Sign-in method** and enable **Anonymous**.
2. Go to **Build > Firestore Database** and create a Cloud Firestore database if it does not exist.
3. In **Firestore Database > Rules**, paste the rules from `firestore.rules` and publish them.
4. The app writes scores to the `leaderboard` collection. Firestore creates the collection automatically when the first score is submitted.

The current app config is in `index.html`.
