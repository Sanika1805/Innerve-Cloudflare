# AI Assistant - Smart Meeting Management

A modern AI-powered meeting management system built with Cloudflare Workers that helps you schedule meetings, create agendas, and manage your calendar efficiently.

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

### Step 4: Deployment
```bash
# Install Wrangler CLI
npm install -g wrangler

# Login to Cloudflare
wrangler login

# Create KV namespace
wrangler kv:namespace create "KV"

# Deploy
npm run deploy
```

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
npm run dev
```
Access at: `http://localhost:8787`

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
