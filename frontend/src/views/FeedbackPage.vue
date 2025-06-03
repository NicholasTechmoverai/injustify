<template>
  <div class="feeds-container">
    <header class="feeds-header">
      <h1>Feedback Hub</h1>
      <p>Share your ideas or report issues to help us improve</p>
    </header>

    <div class="feeds-content">
      <div class="feed-types">
        <button 
          @click="activeFeed = 'issues'"
          :class="{ active: activeFeed === 'issues' }"
        >
          Report Issue
        </button>
        <button 
          @click="activeFeed = 'features'"
          :class="{ active: activeFeed === 'features' }"
        >
          Suggest Feature
        </button>
      </div>

      <div class="feed-form">
        <form @submit.prevent="submitFeedback">
          <div class="form-group">
            <label for="feedback-title">Title</label>
            <input
              id="feedback-title"
              v-model="feedback.title"
              type="text"
              placeholder="Brief description"
              required
            />
          </div>

          <div class="form-group">
            <label for="feedback-description">Description</label>
            <textarea
              id="feedback-description"
              v-model="feedback.description"
              rows="5"
              placeholder="Provide detailed information..."
              required
            ></textarea>
          </div>

          <div v-if="activeFeed === 'issues'" class="form-group">
            <label>Severity</label>
            <div class="severity-options">
              <button
                v-for="level in severityLevels"
                :key="level"
                type="button"
                :class="{ selected: feedback.severity === level }"
                @click="feedback.severity = level"
              >
                {{ level }}
              </button>
            </div>
          </div>

          <div v-if="activeFeed === 'features'" class="form-group">
            <label>Category</label>
            <select v-model="feedback.category">
              <option value="">Select a category</option>
              <option v-for="cat in featureCategories" :key="cat" :value="cat">
                {{ cat }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label for="feedback-attachments">Attachments (optional)</label>
            <input
              id="feedback-attachments"
              type="file"
              multiple
              @change="handleFileUpload"
              accept="image/*,.pdf,.doc,.docx"
            />
            <div v-if="feedback.attachments.length" class="attachments-preview">
              <div v-for="(file, index) in feedback.attachments" :key="index" class="attachment-item">
                <span>{{ file.name }}</span>
                <button type="button" @click="removeAttachment(index)">×</button>
              </div>
            </div>
          </div>

          <button type="submit" class="submit-btn">
            {{ activeFeed === 'issues' ? 'Report Issue' : 'Suggest Feature' }}
          </button>
        </form>
      </div>

      <div class="recent-feedbacks">
        <h3>Recent Feedback</h3>
        <div class="feedback-list">
          <div v-for="(item, index) in recentFeedbacks" :key="index" class="feedback-item">
            <div class="feedback-header">
              <span class="feedback-type" :class="item.type">{{ item.type }}</span>
              <span class="feedback-date">{{ formatDate(item.date) }}</span>
            </div>
            <h4>{{ item.title }}</h4>
            <p>{{ truncateDescription(item.description) }}</p>
            <div v-if="item.tags" class="feedback-tags">
              <span v-for="(tag, tagIndex) in item.tags" :key="tagIndex">{{ tag }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'FeedsPage',
  data() {
    return {
      activeFeed: 'issues',
      feedback: {
        title: '',
        description: '',
        severity: 'Medium',
        category: '',
        attachments: []
      },
      severityLevels: ['Low', 'Medium', 'High', 'Critical'],
      featureCategories: ['UI/UX', 'Functionality', 'Performance', 'Accessibility', 'Other'],
      recentFeedbacks: [
        {
          type: 'issue',
          title: 'Login page not loading on mobile',
          description: 'When trying to access the login page from my iPhone, the page stays blank after submitting credentials.',
          date: new Date('2023-05-15'),
          tags: ['mobile', 'login']
        },
        {
          type: 'feature',
          title: 'Dark mode support',
          description: 'Would love to have a dark mode option for better night-time usage.',
          date: new Date('2023-05-10'),
          category: 'UI/UX'
        }
        // More sample feedback items...
      ]
    }
  },
  methods: {
    submitFeedback() {
      // Here you would typically send the data to your backend
      const feedbackData = {
        type: this.activeFeed,
        ...this.feedback,
        date: new Date()
      };
      
      console.log('Submitting feedback:', feedbackData);
      
      // Add to recent feedbacks for demo purposes
      this.recentFeedbacks.unshift(feedbackData);
      
      // Reset form
      this.feedback = {
        title: '',
        description: '',
        severity: 'Medium',
        category: '',
        attachments: []
      };
      
      // Show success message
      alert(`Thank you for your ${this.activeFeed === 'issues' ? 'issue report' : 'feature suggestion'}!`);
    },
    handleFileUpload(event) {
      this.feedback.attachments = Array.from(event.target.files);
    },
    removeAttachment(index) {
      this.feedback.attachments.splice(index, 1);
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    },
    truncateDescription(text, length = 100) {
      return text.length > length ? text.substring(0, length) + '...' : text;
    }
  }
}
</script>

<style scoped>
/* Base Styles */
.feeds-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  font-family: 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  color: #333;
}

.feeds-header {
  text-align: center;
  margin-bottom: 2rem;
}

.feeds-header h1 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.feeds-header p {
  font-size: 1.1rem;
  color: #7f8c8d;
}

/* Feed Type Toggle */
.feed-types {
  display: flex;
  margin-bottom: 1.5rem;
  border-bottom: 1px solid #e0e0e0;
}

.feed-types button {
  padding: 0.75rem 1.5rem;
  background: none;
  border: none;
  font-size: 1rem;
  font-weight: 600;
  color: #7f8c8d;
  cursor: pointer;
  position: relative;
  transition: all 0.3s ease;
}

.feed-types button.active {
  color: #3498db;
}

.feed-types button.active::after {
  content: '';
  position: absolute;
  bottom: -1px;
  left: 0;
  width: 100%;
  height: 3px;
  background-color: #3498db;
  border-radius: 3px 3px 0 0;
}

/* Form Styles */
.feed-form {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 2rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: #2c3e50;
}

.form-group input[type="text"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border 0.3s ease;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.form-group input[type="text"]:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
}

/* Severity Options */
.severity-options {
  display: flex;
  gap: 0.5rem;
}

.severity-options button {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.severity-options button.selected {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

/* Attachments */
.attachments-preview {
  margin-top: 0.5rem;
}

.attachment-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  margin-bottom: 0.5rem;
}

.attachment-item button {
  background: none;
  border: none;
  color: #e74c3c;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0 0.5rem;
}

/* Submit Button */
.submit-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.submit-btn:hover {
  background: #2980b9;
}

/* Recent Feedbacks */
.recent-feedbacks h3 {
  margin-bottom: 1rem;
  color: #2c3e50;
}

.feedback-list {
  display: grid;
  gap: 1rem;
}

.feedback-item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
  padding: 1.5rem;
  transition: transform 0.2s ease;
}

.feedback-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.feedback-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.feedback-type {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-weight: 600;
  text-transform: capitalize;
}

.feedback-type.issue {
  background: #ffecec;
  color: #e74c3c;
}

.feedback-type.feature {
  background: #e8f5e9;
  color: #2e7d32;
}

.feedback-date {
  color: #7f8c8d;
}

.feedback-item h4 {
  margin: 0.5rem 0;
  color: #2c3e50;
}

.feedback-item p {
  color: #7f8c8d;
  margin-bottom: 0.5rem;
}

.feedback-tags {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.feedback-tags span {
  background: #f1f1f1;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.8rem;
  color: #555;
}

/* Responsive Design */
@media (max-width: 768px) {
  .feeds-container {
    padding: 1rem;
  }
  
  .feeds-header h1 {
    font-size: 2rem;
  }
  
  .feed-form {
    padding: 1.5rem;
  }
  
  .feed-types {
    justify-content: center;
  }
  
  .severity-options {
    flex-wrap: wrap;
  }
  
  .recent-feedbacks {
    margin-top: 2rem;
  }
}

@media (min-width: 769px) {
  .feeds-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  
  .feed-form {
    grid-column: 1 / -1;
  }
  
  .recent-feedbacks {
    grid-column: 1 / -1;
  }
}

@media (min-width: 1024px) {
  .feeds-content {
    grid-template-columns: 2fr 1fr;
  align-items: start;
  }
  
  .feed-form {
    grid-column: 1;
  }
  
  .recent-feedbacks {
    grid-column: 2;
    position: sticky;
    top: 1rem;
  }
}
</style>