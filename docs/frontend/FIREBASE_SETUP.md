# Firebase Google Authentication Setup Guide

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Sign in with your Gmail account: **syntaxisreaper@gmail.com**
3. Click "Create a project" or "Add project"
4. Enter project name: `voice-clone-platform`
5. Optionally disable Google Analytics (unless you want it)
6. Click "Create project"

## Step 2: Enable Authentication

1. In your Firebase project, go to **Authentication** in the sidebar
2. Click "Get started"
3. Go to the **Sign-in method** tab
4. Enable **Google** provider:
   - Click on Google
   - Toggle the switch to "Enable"
   - Add your support email: `syntaxisreaper@gmail.com`
   - Click "Save"

## Step 3: Get Configuration Keys

1. Go to **Project Settings** (gear icon in sidebar)
2. Scroll down to **Your apps** section
3. Click the web icon `</>`
4. Register your app:
   - App nickname: `Voice Clone Platform Web`
   - Check "Also set up Firebase Hosting" (optional)
   - Click "Register app"

## Step 4: Copy Configuration

Copy the Firebase configuration object and create a `.env.local` file:

```bash
# In your frontend folder, create .env.local
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=voice-clone-platform.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=voice-clone-platform
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=voice-clone-platform.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

## Step 5: Configure Authorized Domains

1. In Firebase Console, go to **Authentication** > **Settings**
2. In the **Authorized domains** tab, add your domains:
   - `localhost` (for development)
   - Your production domain when you deploy

## Step 6: Test the Integration

1. Start your development server: `npm run dev`
2. Go to `/login` or `/signup`
3. Click "Sign in with Google" button
4. It should open a Google OAuth popup
5. Select your account and authorize the app
6. You should be redirected to `/dashboard`

## Troubleshooting

### Common Issues:

1. **"This app isn't verified"** warning:
   - This is normal during development
   - Click "Advanced" → "Go to your-app (unsafe)"

2. **"Popup was blocked"**:
   - Enable popups in your browser for localhost

3. **"Invalid configuration"**:
   - Double-check your environment variables
   - Make sure `.env.local` is in the root of your frontend folder

4. **"Network error"**:
   - Check your internet connection
   - Verify Firebase project settings

### Security Notes:

- Never commit `.env.local` to version control
- For production, use your actual domain in authorized domains
- Consider adding additional security rules in Firebase Security Rules

## Next Steps

After successful setup:

1. **User Management**: View authenticated users in Firebase Console > Authentication > Users
2. **Database Integration**: Connect authenticated users with your backend API
3. **Additional Providers**: Add more sign-in methods if needed (Facebook, Twitter, etc.)
4. **Custom Claims**: Add user roles and permissions using Firebase Auth Custom Claims

## Production Deployment

When deploying to production:

1. Add your production domain to Firebase Authorized Domains
2. Update environment variables in your hosting platform
3. Test authentication on the live site
4. Monitor authentication logs in Firebase Console