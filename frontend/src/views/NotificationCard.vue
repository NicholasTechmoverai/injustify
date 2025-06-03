<template>
  <div 
    class="notification-card"
    :class="{
      'compact': compact,
      'unread': !notification.read,
      'selected': selected,
      [notification.type]: true
    }"
    @click="handleClick"
  >
    <div class="card-content">
      <div class="card-icon" v-if="!compact">
        <div class="icon-background" :class="notification.type">
          <i :class="icon"></i>
        </div>
      </div>
      
      <div class="card-main">
        <div class="card-header">
          <h4 class="card-title">{{ notification.title }}</h4>
          <div class="card-meta">
            <span class="card-time">{{ timeAgo(notification.timestamp) }}</span>
            <span v-if="!notification.read" class="unread-badge">New</span>
            <span v-if="notification.priority === 'high'" class="priority-badge">
              <i class="fas fa-exclamation"></i> Important
            </span>
          </div>
        </div>
        
        <p class="card-message" v-if="!compact">{{ notification.message }}</p>
        
        <div class="card-actions" v-if="!compact && notification.actions">
          <button
            v-for="action in notification.actions"
            :key="action.label"
            @click.stop="handleAction(action)"
            class="action-button"
            :class="action.type"
          >
            {{ action.label }}
          </button>
        </div>
      </div>
      
      <div class="card-actions-right">
        <button 
          v-if="selectable"
          @click.stop="toggleSelect"
          class="select-button"
          :class="{ 'selected': selected }"
        >
          <i class="fas" :class="selected ? 'fa-check-circle' : 'fa-circle'"></i>
        </button>
        
        <button 
          v-if="!notification.read && !selectable"
          @click.stop="markAsRead"
          class="mark-read-button"
          title="Mark as read"
        >
          <i class="fas fa-check"></i>
        </button>
        
        <button 
          @click.stop="dismiss"
          class="dismiss-button"
          title="Dismiss"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { timeAgo } from '@/utils';

export default {
  props: {
    notification: {
      type: Object,
      required: true
    },
    compact: {
      type: Boolean,
      default: false
    },
    selectable: {
      type: Boolean,
      default: false
    },
    selected: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select', 'click', 'action'],
  setup(props, { emit }) {
    const icon = computed(() => {
      const icons = {
        'new-sign-in': 'fas fa-user-shield',
        'password-change': 'fas fa-lock',
        'new-playlist': 'fas fa-list-music',
        'new-song': 'fas fa-music',
        'new-feature': 'fas fa-star',
        'subscription': 'fas fa-credit-card',
        'recommendation': 'fas fa-thumbs-up',
        'system': 'fas fa-cog',
        'message': 'fas fa-comment-alt',
        'event': 'fas fa-calendar-alt'
      };
      return icons[props.notification.type] || 'fas fa-bell';
    });

    const typeClass = computed(() => {
      return `type-${props.notification.type.replace(' ', '-')}`;
    });

    const handleClick = () => {
      emit('click', props.notification);
    };

    const toggleSelect = () => {
      emit('select', props.notification.id);
    };

    const markAsRead = () => {
      emit('click', props.notification);
    };

    const dismiss = () => {
      emit('click', props.notification);
    };

    const handleAction = (action) => {
      emit('action', action);
    };

    return {
      icon,
      typeClass,
      timeAgo,
      handleClick,
      toggleSelect,
      markAsRead,
      dismiss,
      handleAction
    };
  }
};
</script>

<style scoped>
.notification-card {
  --type-security: #3b82f6;
  --type-system: #6b7280;
  --type-update: #8b5cf6;
  --type-message: #10b981;
  --type-event: #f59e0b;
  
  border-radius: var(--radius-sm);
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  transition: var(--transition);
  margin-bottom: 0.5rem;
  overflow: hidden;
}

.notification-card.unread {
  border-left: 3px solid;
}

.notification-card.unread.type-security {
  border-left-color: var(--type-security);
}

.notification-card.unread.type-system {
  border-left-color: var(--type-system);
}

.notification-card.unread.type-update {
  border-left-color: var(--type-update);
}

.notification-card.unread.type-message {
  border-left-color: var(--type-message);
}

.notification-card.unread.type-event {
  border-left-color: var(--type-event);
}

.notification-card.selected {
  background-color: rgba(59, 130, 246, 0.1);
  border-color: var(--primary-color);
}

.notification-card:hover:not(.selected) {
  background-color: var(--bg-secondary);
  box-shadow: var(--shadow-sm);
}

.card-content {
  display: flex;
  align-items: center;
  padding: 1rem;
  gap: 1rem;
}

.compact .card-content {
  padding: 0.75rem;
}

.card-icon {
  flex-shrink: 0;
}

.icon-background {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
  color: white;
}

.compact .icon-background {
  width: 2rem;
  height: 2rem;
  font-size: 0.875rem;
}

.icon-background.type-security {
  background-color: var(--type-security);
}

.icon-background.type-system {
  background-color: var(--type-system);
}

.icon-background.type-update {
  background-color: var(--type-update);
}

.icon-background.type-message {
  background-color: var(--type-message);
}

.icon-background.type-event {
  background-color: var(--type-event);
}

.card-main {
  flex: 1;
  min-width: 0;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
  gap: 0.5rem;
}

.compact .card-header {
  margin-bottom: 0;
}

.card-title {
  margin: 0;
  font-size: 0.875rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.compact .card-title {
  font-size: 0.8125rem;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-shrink: 0;
}

.card-time {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.compact .card-time {
  font-size: 0.6875rem;
}

.unread-badge {
  font-size: 0.6875rem;
  padding: 0.15rem 0.5rem;
  border-radius: 1rem;
  background-color: var(--primary-color);
  color: white;
}

.priority-badge {
  font-size: 0.6875rem;
  padding: 0.15rem 0.5rem;
  border-radius: 1rem;
  background-color: var(--warning-color);
  color: white;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.card-message {
  margin: 0 0 0.5rem 0;
  font-size: 0.8125rem;
  color: var(--text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.action-button {
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  cursor: pointer;
  transition: var(--transition);
  border: none;
}

.action-button.primary {
  background-color: var(--primary-color);
  color: white;
}

.action-button.primary:hover {
  background-color: var(--primary-hover);
}

.action-button.secondary {
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
}

.action-button.secondary:hover {
  background-color: var(--border-color);
}

.card-actions-right {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.select-button,
.mark-read-button,
.dismiss-button {
  width: 1.75rem;
  height: 1.75rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--text-secondary);
  transition: var(--transition);
}

.compact .select-button,
.compact .mark-read-button,
.compact .dismiss-button {
  width: 1.5rem;
  height: 1.5rem;
  font-size: 0.75rem;
}

.select-button:hover {
  color: var(--primary-color);
  background-color: rgba(59, 130, 246, 0.1);
}

.select-button.selected {
  color: var(--primary-color);
}

.mark-read-button:hover {
  color: var(--primary-color);
  background-color: rgba(59, 130, 246, 0.1);
}

.dismiss-button:hover {
  color: var(--danger-color);
  background-color: rgba(239, 68, 68, 0.1);
}
</style>