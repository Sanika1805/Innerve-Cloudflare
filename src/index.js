import { Router } from 'itty-router';
import { GoogleAuthHandler } from './api/auth/googleAuth';
import { TokenManager } from './utils/tokenManager';
import { AIService } from './services/aiService';
import { VideoConferenceService } from './services/videoConference';

const router = Router();

// Basic routes
router.get('/', async (request, env) => {
  try {
    const userData = await env.KV.get('user_data');
    if (userData) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': 'https://ai-assistant.bharadwajchavan0.workers.dev/profile' }
      });
    }
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>AI Assistant</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              height: 100vh;
              margin: 0;
              background-color: #f5f5f5;
            }
            .login-card {
              background: white;
              padding: 40px;
              border-radius: 8px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
              text-align: center;
            }
            .login-button {
              background: #4285f4;
              color: white;
              padding: 10px 20px;
              border-radius: 4px;
              text-decoration: none;
              display: inline-block;
              margin-top: 20px;
            }
          </style>
        </head>
        <body>
          <div class="login-card">
            <h1>Welcome to AI Assistant</h1>
            <a href="/auth/google" class="login-button">Login with Google</a>
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});

// Auth routes
router.get('/auth/google', async () => {
  try {
    const auth = new GoogleAuthHandler();
    const url = auth.getAuthUrl();
    return new Response(null, {
      status: 302,
      headers: { 'Location': url }
    });
  } catch (error) {
    return new Response(`Auth Error: ${error.message}`, { status: 500 });
  }
});

router.get('/auth/google/callback', async (request, env) => {
  try {
    const auth = new GoogleAuthHandler();
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    
    if (!code) {
      return new Response('No code provided', { status: 400 });
    }

    const result = await auth.handleCallback(code);
    
    if (env.KV) {
      await env.KV.put('user_data', JSON.stringify({
        tokens: result.tokens,
        profile: result.profile,
        lastUpdated: new Date().toISOString()
      }));
    }

    return new Response(null, {
      status: 302,
      headers: { 'Location': 'https://ai-assistant.bharadwajchavan0.workers.dev/profile' }
    });
  } catch (error) {
    return new Response(`Auth Error: ${error.message}`, { status: 500 });
  }
});

router.get('/auth/logout', async (request, env) => {
  try {
    await env.KV.delete('user_data');
    return new Response(null, {
      status: 302,
      headers: { 'Location': 'https://ai-assistant.bharadwajchavan0.workers.dev/' }
    });
  } catch (error) {
    return new Response(`Logout Error: ${error.message}`, { status: 500 });
  }
});

// Profile route with enhanced UI
router.get('/profile', async (request, env) => {
  try {
    const userData = await env.KV.get('user_data');
    if (!userData) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': 'https://ai-assistant.bharadwajchavan0.workers.dev/auth/google' }
      });
    }

    const { profile, tokens } = JSON.parse(userData);
    const meetings = await fetchUpcomingMeetings(tokens.access_token);
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>${profile.name} - Profile</title>
          <style>
            :root {
              --primary-color: #4285f4;
              --success-color: #0f9d58;
              --warning-color: #f4b400;
              --danger-color: #db4437;
              --bg-color: #f8f9fa;
              --card-bg: #ffffff;
              --text-color: #202124;
              --text-secondary: #5f6368;
              --border-color: #e0e0e0;
            }

            [data-theme="dark"] {
              --bg-color: #202124;
              --card-bg: #2d2e31;
              --text-color: #ffffff;
              --text-secondary: #9aa0a6;
              --border-color: #3c4043;
            }

            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
              background-color: var(--bg-color);
              color: var(--text-color);
              transition: background-color 0.3s, color 0.3s;
            }

            .nav {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 16px 0;
              margin-bottom: 32px;
              border-bottom: 1px solid var(--border-color);
            }

            .button {
              padding: 8px 16px;
              border-radius: 8px;
              border: none;
              cursor: pointer;
              color: white;
              text-decoration: none;
              font-size: 14px;
              font-weight: 500;
              background: var(--primary-color);
              transition: all 0.2s ease;
            }

            .theme-toggle {
              background: none;
              border: none;
              cursor: pointer;
              padding: 8px;
              color: var(--text-color);
              font-size: 20px;
              margin-left: 10px;
            }

            .profile-grid {
              display: grid;
              grid-template-columns: 350px 1fr;
              gap: 24px;
            }

            .card {
              background: var(--card-bg);
              border-radius: 12px;
              padding: 24px;
              margin-bottom: 24px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.05);
              transition: all 0.3s ease;
            }

            .profile-header {
              text-align: center;
              margin-bottom: 24px;
            }

            .profile-picture {
              width: 120px;
              height: 120px;
              border-radius: 60px;
              margin-bottom: 16px;
              border: 4px solid var(--card-bg);
              box-shadow: 0 2px 8px rgba(0,0,0,0.1);
            }

            .info-group {
              padding: 12px 0;
              border-bottom: 1px solid var(--border-color);
            }

            .info-label {
              font-weight: 500;
              color: var(--text-secondary);
              margin-bottom: 4px;
            }

            .info-value {
              color: var(--text-color);
            }

            .meeting-card {
              background: var(--card-bg);
              border: 1px solid var(--border-color);
              border-radius: 8px;
              padding: 16px;
              margin-bottom: 12px;
              transition: all 0.2s ease;
            }

            @media (max-width: 768px) {
              .profile-grid {
                grid-template-columns: 1fr;
              }
            }
          </style>
          <script>
            function toggleTheme() {
              const html = document.documentElement;
              const currentTheme = html.getAttribute('data-theme');
              const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
              
              html.setAttribute('data-theme', newTheme);
              localStorage.setItem('theme', newTheme);
              
              const themeIcon = document.getElementById('themeIcon');
              themeIcon.textContent = newTheme === 'dark' ? 'Dark' : 'Light';
            }

            // Initialize theme on page load
            document.addEventListener('DOMContentLoaded', () => {
              const savedTheme = localStorage.getItem('theme') || 'light';
              document.documentElement.setAttribute('data-theme', savedTheme);
              const themeIcon = document.getElementById('themeIcon');
              themeIcon.textContent = savedTheme === 'dark' ? 'Dark' : 'Light';
            });
          </script>
        </head>
        <body>
          <div class="nav">
            <h1>Profile</h1>
            <div>
              <a href="/meetings" class="button">Meetings</a>
              <a href="/auth/logout" class="button" style="background: var(--danger-color)">Logout</a>
              <button class="theme-toggle" onclick="toggleTheme()">
                <span id="themeIcon">Light</span>
              </button>
            </div>
          </div>

          <div class="profile-grid">
            <!-- Left Column: Profile Info -->
            <div>
              <div class="card">
                <div class="profile-header">
                  <img src="${profile.picture}" alt="Profile" class="profile-picture">
                  <h2 class="profile-name">${profile.name}</h2>
                  <p class="profile-email">${profile.email}</p>
                </div>

                <div class="info-group">
                  <div class="info-label">Given Name</div>
                  <div class="info-value">${profile.givenName}</div>
                </div>

                <div class="info-group">
                  <div class="info-label">Family Name</div>
                  <div class="info-value">${profile.familyName}</div>
                </div>

                <div class="info-group">
                  <div class="info-label">Email Status</div>
                  <div class="info-value">
                    <span class="badge badge-success">
                      ${profile.verified_email ? 'Verified' : 'Not Verified'}
                    </span>
                  </div>
                </div>

                <div class="info-group">
                  <div class="info-label">Last Updated</div>
                  <div class="info-value">
                    ${new Date(profile.lastUpdated).toLocaleString()}
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Meetings -->
            <div>
              <div class="card">
                <div class="section-header">
                  <h3>Upcoming Meetings</h3>
                  <a href="/meetings" class="button">View All</a>
                </div>

                ${meetings.slice(0, 3).map(meeting => `
                  <div class="meeting-card">
                    <h4>${meeting.summary}</h4>
                    <p class="meeting-time">
                      ${new Date(meeting.start.dateTime || meeting.start.date).toLocaleString()}
                    </p>
                    <div style="margin-top: 12px;">
                      <a href="${meeting.hangoutLink}" target="_blank" class="button" style="background: var(--success-color)">
                        Join Meeting
                      </a>
                    </div>
                  </div>
                `).join('') || '<p style="color: var(--text-secondary);">No upcoming meetings</p>'}
              </div>
            </div>
          </div>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    return new Response(`Profile Error: ${error.message}`, { status: 500 });
  }
});

// Add this helper function at the top of the file
function getTagColor(tag = '') {
  const colors = {
    'important': '#dc3545',
    'personal': '#28a745',
    'work': '#007bff',
    'default': '#6c757d'
  };
  return colors[tag.toLowerCase()] || colors.default;
}

// Add this function to fetch meetings
async function fetchUpcomingMeetings(accessToken) {
  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?' + new URLSearchParams({
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: 'startTime'
      }),
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch meetings');
    }

    const data = await response.json();
    return data.items || [];
  } catch (error) {
    console.error('Error fetching meetings:', error);
    return [];
  }
}

// Update the meetings route
router.get('/meetings', async (request, env) => {
  try {
    const userData = await env.KV.get('user_data');
    if (!userData) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': '/auth/google' }
      });
    }

    const { tokens } = JSON.parse(userData);
    const meetings = await fetchUpcomingMeetings(tokens.access_token);

    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Your Meetings</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600&display=swap">
          <style>
            /* Add your existing styles */
            .meetings-grid {
              display: grid;
              grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
              gap: 20px;
              padding: 20px;
            }

            .meeting-card {
              background: white;
              border-radius: 12px;
              padding: 20px;
              box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            }

            .meeting-title {
              font-size: 18px;
              font-weight: 600;
              margin-bottom: 10px;
              color: #1a73e8;
            }

            .meeting-time {
              color: #5f6368;
              margin-bottom: 15px;
              font-size: 14px;
            }

            .meeting-actions {
              display: flex;
              gap: 10px;
            }

            .action-button {
              padding: 8px 16px;
              border-radius: 6px;
              text-decoration: none;
              font-size: 14px;
              font-weight: 500;
              flex: 1;
              text-align: center;
            }

            .join-button {
              background: #1a73e8;
              color: white;
            }

            .edit-button {
              background: #f1f3f4;
              color: #5f6368;
            }
          </style>
        </head>
        <body>
          <div class="meetings-grid">
            ${meetings.map(meeting => `
              <div class="meeting-card">
                <div class="meeting-title">${meeting.summary || 'Untitled Meeting'}</div>
                <div class="meeting-time">
                  ${new Date(meeting.start.dateTime).toLocaleString()}
                </div>
                <div class="meeting-actions">
                  ${meeting.conferenceData?.entryPoints?.[0]?.uri ? 
                    `<a href="${meeting.conferenceData.entryPoints[0].uri}" 
                        class="action-button join-button" 
                        target="_blank">Join Meeting</a>` : ''
                  }
                  <a href="/meetings/${meeting.id}/edit" 
                     class="action-button edit-button">Edit</a>
                </div>
              </div>
            `).join('')}
          </div>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});

// Add API endpoints for meeting management
router.post('/api/meetings', async (request, env) => {
  try {
    const tokenManager = new TokenManager(env);
    const accessToken = await tokenManager.getValidAccessToken();
    
    const meetingData = await request.json();

    // Create calendar event
    const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        summary: meetingData.title,
        start: {
          dateTime: meetingData.startTime,
          timeZone: 'UTC'
        },
        end: {
          dateTime: new Date(new Date(meetingData.startTime).getTime() + meetingData.duration * 60000).toISOString(),
          timeZone: 'UTC'
        },
        conferenceData: {
          createRequest: {
            requestId: crypto.randomUUID(),
            conferenceSolutionKey: { type: 'hangoutsMeet' }
          }
        }
      })
    });

    if (!response.ok) {
      throw new Error('Failed to create meeting');
    }

    const result = await response.json();
    return new Response(JSON.stringify(result), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Update the PUT endpoint for meetings
router.put('/api/meetings/:id', async (request, env) => {
  try {
    const userData = await env.KV.get('user_data');
    if (!userData) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { tokens } = JSON.parse(userData);
    const meetingId = request.params.id;
    const meetingData = await request.json();

    // First get the existing meeting to preserve conference data
    const existingMeetingResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${meetingId}`,
      {
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      }
    );

    if (!existingMeetingResponse.ok) {
      throw new Error('Failed to fetch existing meeting');
    }

    const existingMeeting = await existingMeetingResponse.json();

    // Update the meeting while preserving important data
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${meetingId}?conferenceDataVersion=1`,
      {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: meetingData.title,
          start: {
            dateTime: meetingData.startTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: new Date(new Date(meetingData.startTime).getTime() + meetingData.duration * 60000).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          description: JSON.stringify({ tags: meetingData.tags || ['work'] }),
          conferenceData: existingMeeting.conferenceData,
          hangoutLink: existingMeeting.hangoutLink,
          attendees: existingMeeting.attendees || [],
          reminders: existingMeeting.reminders || { useDefault: true }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Calendar API error:', errorText);
      throw new Error('Failed to update meeting');
    }

    const updatedMeeting = await response.json();
    return new Response(JSON.stringify(updatedMeeting), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Update error:', error);
    return new Response(error.message, { status: 500 });
  }
});

router.delete('/api/meetings/:id', async (request, env) => {
  try {
    const userData = await env.KV.get('user_data');
    if (!userData) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { tokens } = JSON.parse(userData);
    const meetingId = request.params.id;
    
    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${meetingId}`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${tokens.access_token}`
        }
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Calendar API error:', error);
      throw new Error('Failed to delete meeting');
    }

    return new Response('Meeting deleted successfully');
  } catch (error) {
    console.error('Delete error:', error);
    return new Response(error.message, { status: 500 });
  }
});

// Helper function to create a new meeting
async function createMeeting(accessToken, meetingData) {
  try {
    const response = await fetch(
      'https://www.googleapis.com/calendar/v3/calendars/primary/events?conferenceDataVersion=1',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          summary: meetingData.title,
          start: {
            dateTime: meetingData.startTime,
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          end: {
            dateTime: new Date(new Date(meetingData.startTime).getTime() + meetingData.duration * 60000).toISOString(),
            timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone
          },
          conferenceData: {
            createRequest: {
              requestId: crypto.randomUUID(),
              conferenceSolutionKey: {
                type: 'hangoutsMeet'
              }
            }
          },
          // Store tags in description as JSON
          description: JSON.stringify({ tags: meetingData.tags || ['work'] }),
          reminders: {
            useDefault: true
          }
        })
      }
    );

    if (!response.ok) {
      const error = await response.text();
      console.error('Calendar API error:', error);
      throw new Error('Failed to create meeting');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error creating meeting:', error);
    throw error;
  }
}

// Add route for new meeting page
router.get('/meetings/new', async (request, env) => {
  try {
    const userData = await env.KV.get('user_data');
    if (!userData) {
      return new Response(null, {
        status: 302,
        headers: { 'Location': 'https://ai-assistant.bharadwajchavan0.workers.dev/auth/google' }
      });
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Schedule Meeting</title>
          <style>
            :root {
              --primary-color: #4285f4;
              --success-color: #0f9d58;
              --bg-color: #f8f9fa;
              --card-bg: #ffffff;
              --text-color: #202124;
              --border-color: #e0e0e0;
            }

            body {
              font-family: 'Segoe UI', Arial, sans-serif;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: var(--bg-color);
              color: var(--text-color);
            }

            .nav {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 30px;
              padding: 15px 0;
              border-bottom: 1px solid var(--border-color);
            }

            .card {
              background: var(--card-bg);
              border-radius: 12px;
              padding: 24px;
              box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            .form-group {
              margin-bottom: 20px;
            }

            .form-group label {
              display: block;
              margin-bottom: 8px;
              font-weight: 500;
            }

            .form-group input, .form-group select {
              width: 100%;
              padding: 8px;
              border: 1px solid var(--border-color);
              border-radius: 4px;
              font-size: 14px;
            }

            .button {
              padding: 8px 16px;
              border-radius: 4px;
              border: none;
              cursor: pointer;
              color: white;
              background: var(--primary-color);
              text-decoration: none;
              font-size: 14px;
            }

            .button-success {
              background: var(--success-color);
            }

            .tag-select {
              display: flex;
              gap: 10px;
              flex-wrap: wrap;
              margin-bottom: 15px;
            }

            .tag-option {
              padding: 8px 16px;
              border-radius: 20px;
              border: 1px solid var(--border-color);
              background: var(--card-bg);
              color: var(--text-color);
              cursor: pointer;
              transition: all 0.3s ease;
            }

            .tag-option.selected {
              background: var(--primary-color);
              color: white;
              border-color: var(--primary-color);
            }
          </style>
        </head>
        <body>
          <div class="nav">
            <h1>Schedule Meeting</h1>
            <a href="/meetings" class="button">Back to Meetings</a>
          </div>

          <div class="card">
            <div class="modal">
              <div class="modal-header">
                <h2>Create Meeting</h2>
                <button class="close-button" onclick="closeModal()">&times;</button>
              </div>

              <form onsubmit="createMeeting(event)">
                <div class="form-group">
                  <label for="title">Title</label>
                  <input type="text" id="title" required>
                </div>

                <div class="form-group">
                  <label for="participants">Participants (Email addresses)</label>
                  <input type="text" id="participants" placeholder="email1@example.com, email2@example.com">
                </div>

                <div class="form-group">
                  <label for="duration">Duration (minutes)</label>
                  <input type="number" id="duration" value="30" min="15" step="15">
                </div>

                <div class="ai-features">
                  <button type="button" onclick="generateAgenda()" class="ai-button">
                    📝 Generate Agenda
                  </button>
                  <button type="button" onclick="suggestTime()" class="ai-button">
                    🕒 Suggest Time
                  </button>
                </div>

                <div id="ai-suggestions" class="ai-suggestions" style="display: none;">
                  <!-- AI suggestions will be displayed here -->
                </div>

                <div class="button-group">
                  <button type="submit" class="button create-button">Create Meeting</button>
                  <button type="button" onclick="closeModal()" class="button cancel-button">Cancel</button>
                </div>
              </form>
            </div>
          </div>

          <script>
            function toggleTag(button) {
              button.classList.toggle('selected');
              updateSelectedTags();
            }

            function updateSelectedTags() {
              const selectedTags = Array.from(document.querySelectorAll('.tag-option.selected'))
                .map(button => button.dataset.tag);
              document.getElementById('selectedTags').value = JSON.stringify(selectedTags);
            }

            async function scheduleMeeting(event) {
              event.preventDefault();
              
              const title = document.getElementById('title').value;
              const date = document.getElementById('date').value;
              const time = document.getElementById('time').value;
              const duration = document.getElementById('duration').value;
              const tags = JSON.parse(document.getElementById('selectedTags').value || '[]');
              
              try {
                const response = await fetch('/api/meetings', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    title,
                    startTime: new Date(date + 'T' + time).toISOString(),
                    duration: parseInt(duration),
                    tags
                  })
                });
                
                if (response.ok) {
                  window.location.href = '/meetings';
                } else {
                  throw new Error('Failed to schedule meeting');
                }
              } catch (error) {
                console.error('Error:', error);
                alert('Failed to schedule meeting: ' + error.message);
              }
            }

            async function generateAgenda() {
              const title = document.getElementById('title').value;
              const participants = document.getElementById('participants').value.split(',').map(email => email.trim());
              
              try {
                const response = await fetch('/api/meetings/agenda', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    title,
                    participants,
                    context: 'Regular team meeting'
                  })
                });

                if (!response.ok) throw new Error('Failed to generate agenda');
                
                const { agenda } = await response.json();
                
                const suggestionsDiv = document.getElementById('ai-suggestions');
                suggestionsDiv.innerHTML = \`
                  <div class="ai-suggestion">
                    <h4>📝 AI-Generated Agenda</h4>
                    <pre>${agenda}</pre>
                    <button onclick="useAgenda()" class="button">Use This Agenda</button>
                  </div>
                \`;
                suggestionsDiv.style.display = 'block';
              } catch (error) {
                alert('Failed to generate agenda: ' + error.message);
              }
            }

            async function suggestTime() {
              const participants = document.getElementById('participants').value.split(',').map(email => email.trim());
              const duration = document.getElementById('duration').value;
              
              try {
                const response = await fetch('/api/meetings/suggest-time', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    participants,
                    duration,
                    preferences: {
                      workingHours: '9:00-17:00',
                      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
                    }
                  })
                });

                if (!response.ok) throw new Error('Failed to suggest time');
                
                const { suggestion } = await response.json();
                
                const suggestionsDiv = document.getElementById('ai-suggestions');
                suggestionsDiv.innerHTML = \`
                  <div class="ai-suggestion">
                    <h4>🕒 AI Time Suggestions</h4>
                    <pre>${suggestion}</pre>
                    <button onclick="useTimeSlot()" class="button">Use This Time</button>
                  </div>
                \`;
                suggestionsDiv.style.display = 'block';
              } catch (error) {
                alert('Failed to suggest time: ' + error.message);
              }
            }
          </script>
        </body>
      </html>
    `;

    return new Response(html, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    return new Response(`Error: ${error.message}`, { status: 500 });
  }
});

// Update the edit meeting route with improved UI
router.get('/meetings/edit/:id', async (request, env) => {
  try {
    const meetingId = request.params.id;
    const tokenManager = new TokenManager(env);
    const accessToken = await tokenManager.getValidAccessToken();

    const response = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${meetingId}`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch meeting details');
    }

    const meeting = await response.json();

    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Edit Meeting</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            :root {
              --primary-color: #4285f4;
              --bg-color: #1a1b1e;
              --card-bg: #2d2e31;
              --text-color: #ffffff;
              --border-color: #3c4043;
              --input-bg: #202124;
              --hover-color: #3c4043;
            }

            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background: var(--bg-color);
              color: var(--text-color);
              margin: 0;
              padding: 20px;
              min-height: 100vh;
              display: flex;
              justify-content: center;
              align-items: center;
            }

            .modal {
              background: var(--card-bg);
              border-radius: 16px;
              padding: 24px;
              width: 90%;
              max-width: 500px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
            }

            .modal-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 24px;
              padding-bottom: 16px;
              border-bottom: 1px solid var(--border-color);
            }

            .modal-header h2 {
              margin: 0;
              font-size: 24px;
              color: var(--text-color);
            }

            .close-button {
              background: none;
              border: none;
              color: var(--text-color);
              font-size: 24px;
              cursor: pointer;
              padding: 4px;
              border-radius: 50%;
              transition: background 0.3s;
            }

            .close-button:hover {
              background: var(--hover-color);
            }

            .form-group {
              margin-bottom: 20px;
            }

            .form-group label {
              display: block;
              margin-bottom: 8px;
              font-size: 14px;
              color: #9aa0a6;
            }

            input[type="text"],
            input[type="datetime-local"],
            input[type="number"],
            textarea {
              width: 100%;
              padding: 12px;
              border: 1px solid var(--border-color);
              border-radius: 8px;
              background: var(--input-bg);
              color: var(--text-color);
              font-size: 16px;
              transition: border-color 0.3s;
              box-sizing: border-box;
            }

            input:focus,
            textarea:focus {
              outline: none;
              border-color: var(--primary-color);
            }

            .button-group {
              display: flex;
              gap: 12px;
              margin-top: 24px;
            }

            .button {
              flex: 1;
              padding: 12px;
              border: none;
              border-radius: 8px;
              font-size: 16px;
              font-weight: 500;
              cursor: pointer;
              transition: transform 0.2s, opacity 0.2s;
            }

            .update-button {
              background: var(--primary-color);
              color: white;
            }

            .cancel-button {
              background: var(--hover-color);
              color: var(--text-color);
            }

            .button:hover {
              opacity: 0.9;
              transform: translateY(-1px);
            }

            .button:active {
              transform: translateY(1px);
            }

            @media (max-width: 480px) {
              .modal {
                padding: 16px;
              }

              .button-group {
                flex-direction: column;
              }

              .button {
                width: 100%;
              }
            }
          </style>
        </head>
        <body>
          <div class="modal">
            <div class="modal-header">
              <h2>Edit Meeting</h2>
              <button class="close-button" onclick="window.location.href='/meetings'">&times;</button>
            </div>

            <form onsubmit="updateMeeting(event)">
              <div class="form-group">
                <label for="title">Title</label>
                <input 
                  type="text" 
                  id="title" 
                  value="${meeting.summary}"
                  placeholder="Enter meeting title"
                  required
                >
              </div>

              <div class="form-group">
                <label for="start-time">Start Time</label>
                <input 
                  type="datetime-local" 
                  id="start-time"
                  value="${new Date(meeting.start.dateTime).toISOString().slice(0, 16)}"
                  required
                >
              </div>

              <div class="form-group">
                <label for="duration">Duration (minutes)</label>
                <input 
                  type="number" 
                  id="duration" 
                  value="30"
                  min="15"
                  max="180"
                  step="15"
                  required
                >
              </div>

              <div class="form-group">
                <label for="description">Description (optional)</label>
                <textarea 
                  id="description"
                  rows="3"
                  placeholder="Add meeting description..."
                >${meeting.description || ''}</textarea>
              </div>

              <div class="button-group">
                <button type="submit" class="button update-button">
                  Update Meeting
                </button>
                <button 
                  type="button" 
                  class="button cancel-button"
                  onclick="window.location.href='/meetings'"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>

          <script>
            async function updateMeeting(event) {
              event.preventDefault();
              const updateButton = document.querySelector('.update-button');
              const originalText = updateButton.textContent;
              
              try {
                updateButton.textContent = 'Updating...';
                updateButton.disabled = true;

                const title = document.getElementById('title').value;
                const startTime = document.getElementById('start-time').value;
                const duration = document.getElementById('duration').value;
                const description = document.getElementById('description').value;

                const response = await fetch('/api/meetings/${meetingId}', {
                  method: 'PUT',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({
                    title,
                    startTime: new Date(startTime).toISOString(),
                    duration: parseInt(duration),
                    description
                  })
                });

                if (!response.ok) {
                  throw new Error('Failed to update meeting');
                }

                window.location.href = '/meetings';
              } catch (error) {
                console.error('Error:', error);
                alert('Failed to update meeting: ' + error.message);
              } finally {
                updateButton.textContent = originalText;
                updateButton.disabled = false;
              }
            }

            // Set initial duration
            document.addEventListener('DOMContentLoaded', () => {
              const duration = Math.round(
                (new Date(${JSON.stringify(meeting.end.dateTime)}) - 
                new Date(${JSON.stringify(meeting.start.dateTime)})) / 60000
              );
              document.getElementById('duration').value = duration;
            });
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  } catch (error) {
    return new Response(`Edit Meeting Error: ${error.message}`, { status: 500 });
  }
});

// Add CORS headers to your responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization'
};

// Update your router handler
router.options('*', () => new Response(null, { headers: corsHeaders }));

// Add this route handler
router.post('/api/meetings/share', async (request, env) => {
  try {
    const tokenManager = new TokenManager(env);
    const accessToken = await tokenManager.getValidAccessToken();
    
    const { meetingId, recipientEmail, meetingTitle, meetingLink, message } = await request.json();

    // Add recipient to the Google Calendar event
    const addAttendeeResponse = await fetch(
      `https://www.googleapis.com/calendar/v3/calendars/primary/events/${meetingId}`,
      {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          attendees: [{ email: recipientEmail }]
        })
      }
    );

    if (!addAttendeeResponse.ok) {
      throw new Error('Failed to add attendee to meeting');
    }

    // Send email notification
    const emailContent = `
      You've been invited to a meeting: ${meetingTitle}
      
      Join URL: ${meetingLink}
      
      ${message ? `Message: ${message}` : ''}
      
      Click the link above to join the meeting at the scheduled time.
    `;

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Generate meeting agenda
router.post('/api/meetings/agenda', async (request, env) => {
  try {
    const aiService = new AIService(env);
    const { title, participants, context } = await request.json();
    
    const agenda = await aiService.generateAgenda(title, participants, context);
    
    return new Response(JSON.stringify({ agenda }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Suggest meeting time
router.post('/api/meetings/suggest-time', async (request, env) => {
  try {
    const aiService = new AIService(env);
    const { participants, duration, preferences } = await request.json();
    
    const suggestion = await aiService.suggestMeetingTime(
      participants,
      duration,
      preferences
    );
    
    return new Response(JSON.stringify({ suggestion }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Generate meeting summary
router.post('/api/meetings/summary', async (request, env) => {
  try {
    const aiService = new AIService(env);
    const { transcript } = await request.json();
    
    const summary = await aiService.generateMeetingSummary(transcript);
    
    return new Response(JSON.stringify({ summary }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Export worker
export default {
  fetch: router.handle
}; 