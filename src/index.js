import { Router } from 'itty-router';

const router = Router();

// Store meetings in memory (replace with proper database in production)
let meetings = [];

// Serve the main application HTML
router.get('/', () => {
  return new Response(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>Meeting Assistant</title>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css">
        <style>
          ${getStyles()}
        </style>
      </head>
      <body>
        <div class="container">
          <div class="dashboard-header">
            <h1>Meetings Dashboard</h1>
            <button onclick="showCreateMeetingForm()" class="btn btn-primary">
              <i class="fas fa-plus"></i> New Meeting
            </button>
          </div>

          <!-- Meetings List -->
          <div id="meetingsList" class="meetings-list">
            <!-- Meetings will be displayed here -->
          </div>

          <!-- Create Meeting Form (hidden by default) -->
          <div id="createMeetingModal" class="modal" style="display: none;">
            <div class="modal-content">
              <form id="editForm" class="edit-form" onsubmit="createMeeting(event)">
                <input type="hidden" name="meetingId" value="bdghlcjg1vt6ec3d39cl5ptbac">
                
                <div class="form-group">
                  <label for="title">Title</label>
                  <input type="text" id="title" name="title" class="form-control" 
                         placeholder="Enter meeting title" required>
                </div>

                <div class="form-row">
                  <div class="form-group col-md-6">
                    <label for="startTime">Start Time</label>
                    <input type="datetime-local" id="startTime" name="startTime" 
                           class="form-control" required>
                  </div>
                  
                  <div class="form-group col-md-6">
                    <label for="duration">Duration (minutes)</label>
                    <select id="duration" name="duration" class="form-control" required>
                      <option value="15">15 minutes</option>
                      <option value="30">30 minutes</option>
                      <option value="45">45 minutes</option>
                      <option value="60">1 hour</option>
                      <option value="90">1.5 hours</option>
                      <option value="120">2 hours</option>
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label for="description">Description</label>
                  <textarea id="description" name="description" class="form-control" 
                            rows="4" placeholder="Enter meeting description"></textarea>
                </div>

                <div class="form-actions">
                  <button type="button" onclick="hideCreateMeetingForm()" 
                          class="btn btn-secondary">Cancel</button>
                  <button type="submit" class="btn btn-primary">Create Meeting</button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <script>
          ${getMeetingAssistantScript()}
        </script>
      </body>
    </html>
  `, {
    headers: { 'Content-Type': 'text/html' }
  });
});

// API routes
router.post('/api/meetings', async (request) => {
  try {
    const meeting = await request.json();
    meeting.id = Date.now().toString(); // Simple ID generation
    meeting.createdAt = new Date().toISOString();
    meetings.push(meeting);
    
    return new Response(JSON.stringify({ success: true, meeting }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
});

// Get all meetings
router.get('/api/meetings', () => {
  return new Response(JSON.stringify(meetings), {
    headers: { 'Content-Type': 'application/json' }
  });
});

// Helper function to get styles
function getStyles() {
  return `
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    .dashboard-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    .meetings-list {
      margin-top: 2rem;
    }
    .meeting-card {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .modal {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.5);
    }
    .modal-content {
      background: white;
      margin: 10% auto;
      max-width: 600px;
      border-radius: 8px;
      padding: 20px;
    }
    ${getFormStyles()}
  `;
}

// Helper function to get form styles
function getFormStyles() {
  return `
    .edit-form {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .form-group {
      margin-bottom: 1.5rem;
    }
    .form-control {
      width: 100%;
      padding: 0.5rem;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 1rem;
    }
    .btn {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
    .btn-primary {
      background: #007bff;
      color: white;
    }
    .btn-secondary {
      background: #6c757d;
      color: white;
    }
  `;
}

// Helper function to get MeetingAssistant script
function getMeetingAssistantScript() {
  return `
    class MeetingAssistant {
      constructor() {
        console.log('MeetingAssistant initialized');
        this.loadMeetings();
      }

      async loadMeetings() {
        try {
          const response = await fetch('/api/meetings');
          const meetings = await response.json();
          this.displayMeetings(meetings);
        } catch (error) {
          console.error('Error loading meetings:', error);
        }
      }

      displayMeetings(meetings) {
        const meetingsList = document.getElementById('meetingsList');
        meetingsList.innerHTML = meetings.map(meeting => \`
          <div className="meeting-card">
            <h3>${meeting.title}</h3>
            <p><strong>Start:</strong> ${new Date(meeting.startTime).toLocaleString()}</p>
            <p><strong>Duration:</strong> ${meeting.duration} minutes</p>
            <p>${meeting.description || 'No description provided'}</p>
          </div>
        \`).join('');
      }
    }

    // Initialize when DOM is loaded
    document.addEventListener('DOMContentLoaded', () => {
      window.meetingAssistant = new MeetingAssistant();
    });

    function showCreateMeetingForm() {
      document.getElementById('createMeetingModal').style.display = 'block';
    }

    function hideCreateMeetingForm() {
      document.getElementById('createMeetingModal').style.display = 'none';
    }

    async function createMeeting(event) {
      event.preventDefault();
      const form = event.target;
      const formData = new FormData(form);
      
      const meetingData = {
        title: formData.get('title'),
        startTime: formData.get('startTime'),
        duration: formData.get('duration'),
        description: formData.get('description')
      };

      try {
        const response = await fetch('/api/meetings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(meetingData)
        });

        if (response.ok) {
          hideCreateMeetingForm();
          form.reset();
          window.meetingAssistant.loadMeetings();
        } else {
          console.error('Failed to create meeting');
        }
      } catch (error) {
        console.error('Error creating meeting:', error);
      }
    }
  `;
}

export default {
  fetch: (request, env, ctx) => router.handle(request, env, ctx)
}; 