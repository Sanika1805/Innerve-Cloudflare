# AI Assistant - Smart Meeting Management

A modern AI-powered meeting management system built with Cloudflare Workers that helps you schedule meetings, create agendas, and manage your calendar efficiently.

## 🚀 Quick Deployment Guide

### Step 1: Clone and Setup
```bash
# Clone the repository (if you haven't already)
git clone "https://github.com/Sanika1805/Innerve-Cloudflare.git"
cd Innerve-Cloudflare

# Install dependencies
npm install
```

### Step 2: Configure Cloudflare
1. Create a Cloudflare account at https://dash.cloudflare.com/sign-up
2. Install Wrangler CLI:
```bash
npm install -g wrangler
```
3. Login to Cloudflare through Wrangler:
```bash
wrangler login
```

### Step 3: Update Configuration
1. Create a `wrangler.toml` file in your project root:
```toml
name = "ai-assistant"
main = "src/index.js"
compatibility_date = "2023-01-01"

[vars]
ENVIRONMENT = "production"
```

2. Set up your environment variables:
```bash
# Set your environment variables in Cloudflare
wrangler secret put GOOGLE_CLIENT_ID
wrangler secret put GOOGLE_CLIENT_SECRET
wrangler secret put JWT_SECRET
wrangler secret put OPENAI_API_KEY
```

### Step 4: Deploy
1. Deploy to Cloudflare Workers:
```bash
wrangler deploy
```

2. Your application will be available at: https://ai-assistant.bharadwajchavan0.workers.dev

### Step 5: Verify Deployment
1. Open your browser
2. Visit https://ai-assistant.bharadwajchavan0.workers.dev
3. You should see the meeting management interface
4. Test creating a new meeting using the "New Meeting" button

### Troubleshooting Deployment

If you encounter issues:

1. **Blank Page or 404 Error:**
```bash
# Verify your deployment
wrangler tail
```

2. **Worker Not Found:**
```bash
# Check worker status
wrangler status ai-assistant
```

3. **Environment Variables:**
```bash
# List all secrets
wrangler secret list
```

4. **Deployment Failed:**
```bash
# Check logs
wrangler deploy --dry-run
```

## 🔍 Post-Deployment Verification

1. **Check Application Status:**
   - Visit https://ai-assistant.bharadwajchavan0.workers.dev
   - Verify the page loads correctly
   - Check browser console for any errors

2. **Test Core Features:**
   - Create a new meeting
   - View existing meetings
   - Check form submissions

3. **Monitor Usage:**
   - Check Cloudflare Workers dashboard
   - Monitor API calls
   - Review error logs

## 📞 Need Help?

If you encounter any issues:
1. Check Cloudflare Workers status page
2. Review deployment logs
3. Verify all environment variables are set
4. Ensure your Cloudflare account is active

For additional support:
- Open an issue in the repository
- Check Cloudflare Workers documentation
- Review the error logs in Cloudflare Dashboard

## 🚀 Quick Start Guide

### Prerequisites
- Node.js v16 or higher
- Cloudflare account
- Google Cloud account
- OpenAI API key

### Step 1: Google Cloud Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable APIs:
   - Google Calendar API
   - Google Meet API
4. Create OAuth 2.0 credentials:
   - Go to Credentials → Create Credentials → OAuth 2.0 Client ID
   - Application type: Web application
   - Add redirect URI: `https://ai-assistant.bharadwajchavan0.workers.dev/auth/google/callback`
   - Save your Client ID and Client Secret

### Step 2: Project Setup

### Step 3: Environment Setup
1. Create `.dev.vars` file:

```env
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
GOOGLE_REDIRECT_URI=http://localhost:8787/auth/google/callback
JWT_SECRET=your_jwt_secret
OPENAI_API_KEY=your_openai_api_key
ZOOM_API_TOKEN=your_zoom_token
ZOOM_VERIFICATION_TOKEN=your_zoom_verification_token
```

2. Update `wrangler.toml`:
```toml
name = "ai-assistant"
account_id = "your_cloudflare_account_id"
```

### Step 4: Deployment & Access

1. **Deploy to Cloudflare Workers:**
```bash
# Install dependencies
npm install

# Deploy to Cloudflare
npm run deploy
```

2. **Access Your Application:**
- Open your browser and go to: https://ai-assistant.bharadwajchavan0.workers.dev
- You'll be redirected to the login page
- Sign in with your Google account
- Grant necessary calendar permissions when prompted

3. **Verify Setup:**
- Check that you can view your calendar
- Try scheduling a new meeting
- Test the AI agenda generation feature

4. **Troubleshooting Access:**
If you cannot access the application:
- Verify your Cloudflare Workers service is running
- Check the browser console for errors
- Ensure all environment variables are properly set in Cloudflare
- Confirm your Google Cloud OAuth consent screen is properly configured

## 🎯 Features

- **AI-Powered Scheduling**
  - Smart meeting time suggestions
  - Conflict detection
  - Timezone handling

- **Google Calendar Integration**
  - Seamless calendar sync
  - Real-time updates
  - Meeting management

- **Smart Agenda Creation**
  - AI-generated agendas
  - Custom templates
  - Meeting summaries

- **User-Friendly Interface**
  - Modern design
  - Responsive layout
  - Intuitive controls

## 📁 Project Structure
```
Cloudflare/
├── src/
│   ├── index.js           # Main application
│   ├── login.html         # Login page
│   ├── api/
│   │   └── auth/          # Authentication
│   ├── services/          # Business logic
│   └── utils/             # Utilities
├── wrangler.toml          # Cloudflare config
└── package.json          # Dependencies
```

## 🔧 Development

Run locally:
```bash
npm run deploy
```
Access at: `https://ai-assistant.bharadwajchavan0.workers.dev`

## ⚠️ Common Issues & Solutions

1. **Authentication Fails**
   - Verify Google credentials
   - Check redirect URI
   - Enable required APIs

2. **Deployment Issues**
   - Run `wrangler whoami`
   - Check account_id
   - Verify KV namespace

3. **Meetings Not Showing**
   - Check Calendar API access
   - Verify token validity
   - Check console errors

## 🔐 Security Notes

- Never commit `.dev.vars`
- Secure API keys
- Regular JWT rotation
- Monitor API usage

## 📝 License

MIT License - feel free to use this project for your own purposes.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📞 Support

Need help? Open an issue in the repository.
