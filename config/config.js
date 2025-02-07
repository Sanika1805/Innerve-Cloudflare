const config = {
  supportedPlatforms: {
    zoom: {
      apiEndpoint: 'https://api.zoom.us/v2',
      authType: 'JWT'
    },
    meet: {
      apiEndpoint: 'https://meet.googleapis.com/v1',
      authType: 'OAuth2'
    },
    teams: {
      apiEndpoint: 'https://graph.microsoft.com/v1.0',
      authType: 'OAuth2'
    }
  },
  
  integrations: {
    slack: {
      webhookUrl: process.env.SLACK_WEBHOOK_URL,
      apiToken: process.env.SLACK_API_TOKEN
    },
    trello: {
      apiKey: process.env.TRELLO_API_KEY
    },
    jira: {
      apiToken: process.env.JIRA_API_TOKEN
    }
  },

  ai: {
    openai: {
      apiKey: process.env.OPENAI_API_KEY,
      model: 'gpt-4'
    }
  },

  google: {
    auth: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      redirectUri: process.env.GOOGLE_REDIRECT_URI,
      scopes: [
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/meetings.write'
      ]
    }
  },

  production: {
    baseUrl: 'https://universal-ai-assistant-production.bharadwajchavan0.workers.dev'
  }
};

export default config; 