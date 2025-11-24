# Deploying Firebase Security Rules

## Option 1: Using Firebase Console (Recommended for Quick Setup)

### Realtime Database Rules

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `chronos-725d2`
3. Navigate to **Realtime Database** → **Rules** tab
4. Copy the contents from `firebase-database.rules.json`
5. Paste into the rules editor
6. Click **Publish**

### Storage Rules

1. In Firebase Console, navigate to **Storage** → **Rules** tab
2. Copy the contents from `firebase-storage.rules`
3. Paste into the rules editor
4. Click **Publish**

## Option 2: Using Firebase CLI

### Prerequisites

```bash
npm install -g firebase-tools
firebase login
```

### Initialize Firebase (if not already done)

```bash
firebase init
```

Select:
- Realtime Database
- Storage
- Use existing project: `chronos-725d2`

### Deploy Rules

```bash
# Deploy database rules
firebase deploy --only database

# Deploy storage rules
firebase deploy --only storage

# Or deploy both at once
firebase deploy --only database,storage
```

## Verify Rules

After deploying, test your rules:

1. **Realtime Database**: Try accessing another user's data (should fail)
2. **Storage**: Try uploading a file to another user's folder (should fail)

## Current Rules Summary

### Realtime Database
- ✅ Users can only read/write their own data
- ✅ Capsules must have valid structure
- ✅ User ID must match authenticated user
- ✅ All other access denied

### Storage
- ✅ Users can only access their own files
- ✅ 10MB file size limit
- ✅ Only images, videos, and audio allowed
- ✅ All other access denied

