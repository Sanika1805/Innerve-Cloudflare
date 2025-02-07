export class TaskSyncHandler {
  constructor(env) {
    this.env = env;
  }

  // Sync tasks with Slack
  async syncWithSlack(task) {
    try {
      const response = await fetch(this.env.SLACK_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: `New Task: ${task.title}\nDescription: ${task.description}\nDue: ${task.dueDate}`
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync with Slack');
      }

      return true;
    } catch (error) {
      console.error('Slack sync error:', error);
      return false;
    }
  }

  // Sync tasks with Trello
  async syncWithTrello(task) {
    try {
      const response = await fetch(`https://api.trello.com/1/cards?key=${this.env.TRELLO_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: task.title,
          desc: task.description,
          due: task.dueDate
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync with Trello');
      }

      return true;
    } catch (error) {
      console.error('Trello sync error:', error);
      return false;
    }
  }

  // Sync tasks with Jira
  async syncWithJira(task) {
    try {
      const response = await fetch('https://your-domain.atlassian.net/rest/api/3/issue', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.env.JIRA_API_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          fields: {
            summary: task.title,
            description: task.description,
            duedate: task.dueDate
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to sync with Jira');
      }

      return true;
    } catch (error) {
      console.error('Jira sync error:', error);
      return false;
    }
  }

  // Sync task across all platforms
  async syncTask(task) {
    const results = await Promise.allSettled([
      this.syncWithSlack(task),
      this.syncWithTrello(task),
      this.syncWithJira(task)
    ]);

    return {
      slack: results[0].status === 'fulfilled' && results[0].value,
      trello: results[1].status === 'fulfilled' && results[1].value,
      jira: results[2].status === 'fulfilled' && results[2].value
    };
  }
} 