class MeetingAssistant {
  constructor() {
    console.log('MeetingAssistant constructor called');
    this.initializeAssistant();
  }

  initializeAssistant() {
    console.log('Initializing AI Assistant...');
    
    // Make sure elements exist before adding listeners
    const titleInput = document.getElementById('title');
    const descInput = document.getElementById('description');
    const durationInput = document.getElementById('duration');

    if (titleInput) {
      titleInput.addEventListener('focus', () => this.generateSuggestion('title'));
      console.log('Added title listener');
    } else {
      console.error('Title input not found');
    }

    if (descInput) {
      descInput.addEventListener('focus', () => this.generateSuggestion('description'));
      console.log('Added description listener');
    } else {
      console.error('Description input not found');
    }

    if (durationInput) {
      durationInput.addEventListener('change', () => this.generateSuggestion('duration'));
      console.log('Added duration listener');
    } else {
      console.error('Duration input not found');
    }

    this.addAIHelper();
  }

  addAIHelper() {
    console.log('Adding AI helper buttons...');
    const formGroups = document.querySelectorAll('.form-group');
    console.log('Found form groups:', formGroups.length);

    formGroups.forEach((group, index) => {
      const input = group.querySelector('input, textarea, select');
      if (input) {
        console.log(`Adding button to input: ${input.name}`);
        const aiButton = document.createElement('button');
        aiButton.type = 'button';
        aiButton.className = 'ai-suggest-btn';
        aiButton.innerHTML = '<i class="fas fa-magic"></i> AI Suggest';
        aiButton.onclick = (e) => {
          e.preventDefault();
          this.generateSuggestion(input.name);
        };
        group.appendChild(aiButton);
      }
    });
  }

  async generateSuggestion(fieldType) {
    const loadingToast = this.showToast('Generating suggestion...', 'info');
    
    try {
      // Get context from other form fields
      const context = this.getFormContext();
      
      // Simulate API call to AI service
      const suggestion = await this.callAIService(fieldType, context);
      
      // Update the field with the suggestion
      document.querySelector(`[name="${fieldType}"]`).value = suggestion;
      
      this.showToast('Suggestion applied!', 'success');
    } catch (error) {
      this.showToast('Failed to generate suggestion', 'error');
    } finally {
      loadingToast.remove();
    }
  }

  async callAIService(fieldType, context) {
    // Simulate API call - replace with actual AI service integration
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    switch (fieldType) {
      case 'title':
        return 'Weekly Team Sync Meeting';
      case 'description':
        return 'Regular team sync to discuss project progress, blockers, and upcoming milestones.';
      case 'duration':
        return '30';
      default:
        return '';
    }
  }

  getFormContext() {
    return {
      title: document.querySelector('[name="title"]').value,
      startTime: document.querySelector('[name="startTime"]').value,
      duration: document.querySelector('[name="duration"]').value,
      description: document.querySelector('[name="description"]').value
    };
  }

  showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.remove(), 3000);
    return toast;
  }
}

// Create global instance
window.meetingAssistant = new MeetingAssistant(); 