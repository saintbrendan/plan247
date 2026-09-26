# plan247
task planner / time tracker

To deploy manually to Firebase:
```bash
npm install -g firebase-tools
firebase deploy --only hosting
```
The trick is you need to have a `firebase.json` file to tell firebase where to deploy to.

## Continuous Deployment (GitHub Actions)

A GitHub Actions workflow is configured in [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml) to automatically deploy to Firebase Hosting whenever you push to `master` or `main`.

### Setup Required in GitHub
Add your Firebase Service Account JSON key as a secret in your GitHub repository:
1. Go to your GitHub repository -> **Settings** -> **Secrets and variables** -> **Actions**.
2. Click **New repository secret**.
3. Name: `FIREBASE_SERVICE_ACCOUNT_PLANIT_48748` (or `FIREBASE_SERVICE_ACCOUNT`).
4. Value: Paste the JSON key contents of your Google Cloud / Firebase service account (with Firebase Hosting Admin permissions).

