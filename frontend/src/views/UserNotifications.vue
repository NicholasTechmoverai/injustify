<template>
  <div class="MainContainer notification-app" :class="{ 'dark-mode': isDarkMode, collabsedBig: iscollapsedBig }">

    <!-- Desktop/Landscape Layout -->
    <div class="notification-container" :class="{ 'mobile-layout': isMobile }">
      <!-- Desktop Header -->
      <div class="header">
        <div class="header-left">
          <div id="iconPlusQuery">
            <h1 @click="reloadPage" class="injustifyLogoRIMG"><img :src="injustifyIcon" alt=""></h1>
            <div>Notifications</div>
          </div>
          <span class="unread-count">{{ unreadCount }} unread</span>
        </div>
        <div class="header-right">
          <div class="filter-controls" :class="{ 'active': filterMenuOpen }">
            <button class="filter-button" @click="toggleFilterMenu">
              <i class="fas fa-filter"></i>
              <span>Filter</span>
              <i class="fas fa-chevron-down"></i>
            </button>

            <div class="filter-menu" v-if="filterMenuOpen">
              <div class="filter-option" v-for="filter in filters" :key="filter.type"
                @click="toggleFilter(filter.type)">
                <input type="checkbox" :checked="activeFilters.includes(filter.type)">
                <span class="filter-label">{{ filter.label }}</span>
                <span class="filter-badge" :style="{ backgroundColor: filter.color }">
                  {{ getFilterCount(filter.type) }}
                </span>
              </div>
            </div>
          </div>
          <!-- <button @click="toggleDarkMode" class="theme-toggle"
            :aria-label="isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'">
            <i :class="isDarkMode ? 'fas fa-sun' : 'fas fa-moon'"></i>
          </button> -->
        </div>
      </div>


        <div class="notification-wrapper" v-show="false">
  <!-- Toggle Icon -->
  <ion-icon
    v-if="!showControls"
    @click="showControls = true"
    name="ellipsis-vertical-outline"
    aria-label="Show notification controls"
  ></ion-icon>
  
  <ion-icon
    v-if="showControls"
    @click="showControls = false"
    name="close-outline"
    aria-label="Hide notification controls"
  ></ion-icon>

  <!-- Notification Controls -->
  <div v-if="showControls" class="notification-controls">
    <div class="controls-left">
      <button
        v-if="notifications.length > 0"
        @click="markAllAsRead"
        class="mark-all-read"
        :disabled="unreadCount === 0"
      >
        <i class="fas fa-check-double"></i>
        <span>Mark all as read</span>
      </button>
    </div>
    <div class="controls-right">
      <button
        v-if="notifications.length > 0"
        @click="clearAllNotifications"
        class="clear-all"
      >
        <i class="fas fa-trash-alt"></i>
        <span>Clear all</span>
      </button>
    </div>
  </div>
</div>



      <!-- Empty State -->
      <div v-if="filteredNotifications.length === 0" class="empty-state">
        <div class="empty-icon">
          <i class="far fa-bell"></i>
        </div>
        <h3>No notifications</h3>
        <p>{{ activeFilters.length > 0 ? 'No notifications match your filters' : 'We\'ll notify you when something new\
          arrives' }}</p>
        <button v-if="activeFilters.length > 0" @click="resetFilters" class="reset-filters">
          Reset filters
        </button>
      </div>

      <!-- Notifications List -->
      <transition-group name="notification-list" tag="div" class="notifications">
        <div v-for="notification in filteredNotifications" :key="notification.id"
          @click="handleNotificationClick(notification)" class="notification" :class="{
            'unread': !notification.read,
            [notification.type]: true,
            'selected': selectedNotification === notification.id
          }">
          <div class="notification-icon-container">
            <div class="notification-icon-background" :class="notification.type">
              <i :class="getNotificationIcon(notification.type)"></i>
            </div>
          </div>

          <div class="notification-content">
            <h3>{{ notification.title }}</h3>
            <p>{{ notification.message }}</p>
            <div class="notification-meta">
              <span class="notification-time">
                {{ timeAgo(notification.timestamp) }}
              </span>
              <span v-if="!notification.read" class="unread-badge">New</span>
              <span v-if="notification.priority === 'high'" class="priority-badge">
                <i class="fas fa-exclamation"></i> Important
              </span>
            </div>
          </div>

          <div class="notification-actions">
            <button v-if="!notification.read" @click.stop="markAsRead(notification.id)" class="mark-read-button"
              title="Mark as read">
              <i class="fas fa-check"></i>
            </button>
            <button @click.stop="dismissNotification(notification.id)" class="dismiss-button" title="Dismiss">
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </transition-group>

    </div>
  </div>
</template>

<script>
import { useUserStore } from "@/store/index.js";
import { computed, ref, onMounted, onUnmounted } from "vue";
import axios from "axios"
// import socket from "@/services/websocket";
import { BASE_URL, timeAgo } from "@/utils/index.js";
import injustifyIcon from "../assets/injustify.png";
import qs from "qs"

export default {
  name: 'NotificationCenter',
  setup() {
    const userStore = useUserStore();
    const isMobile = ref(window.innerWidth < 768);
    const filterMenuOpen = ref(false);
    const selectedNotification = ref(null);
    const activeFilters = ref([]);
    const userId = computed(() => userStore.userId)
    const disp_name = computed(() => userStore.disp_name);
    const notification_loading = ref(false)
    const delete_noty_loading = ref(false)



    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768;
    };

    onMounted(() => {
      window.addEventListener('resize', checkMobile);
      // Mark all as read when opening the notification center
      // markAllAsRead();
      fetch_notifications()
    });

    onUnmounted(() => {
      window.removeEventListener('resize', checkMobile);
    });

    const filters = [
      { type: 'all', label: 'All Notifications', color: '#6366f1' },
      { type: 'unread', label: 'Unread', color: '#3b82f6' },
      { type: 'new-sign-in', label: 'Security', color: '#10b981' },
      { type: 'new-playlist', label: 'Music', color: '#8b5cf6' },
      { type: 'new-song', label: 'New Releases', color: '#f59e0b' },
      { type: 'new-feature', label: 'Updates', color: '#ec4899' }
    ];

    // Sample notifications data
    const notifications = ref([
      {
        id: 1,
        type: 'new-sign-in',
        title: 'New Sign-In Detected',
        message: 'Your account was accessed from a new device in New York, NY on Chrome Windows.',
        timestamp: new Date(Date.now() - 3600000),
        read: false,
        priority: 'high',
        actions: [
          { label: 'Review Activity', type: 'primary', action: 'reviewActivity' },
          { label: 'Secure Account', type: 'secondary', action: 'secureAccount' }
        ]
      },
      {
        id: 2,
        type: 'password-change',
        title: 'Password Changed',
        message: 'Your account password was successfully updated. If you didn\'t make this change, please secure your account immediately.',
        timestamp: new Date(Date.now() - 86400000),
        read: false,
        priority: 'high'
      },
      {
        id: 3,
        type: 'new-playlist',
        title: 'New Playlist: Summer Hits 2023',
        message: 'We\'ve created a personalized playlist for you based on your recent listening habits.',
        timestamp: new Date(Date.now() - 172800000),
        read: true,
        actions: [
          { label: 'Play Now', type: 'primary', action: 'playPlaylist' }
        ]
      },
      {
        id: 4,
        type: 'new-song',
        title: 'New Release from Favorite Artist',
        message: 'Your favorite artist The Weeknd just dropped a new single - "Take My Breath". Listen now!',
        timestamp: new Date(Date.now() - 259200000),
        read: true,
        actions: [
          { label: 'Play Song', type: 'primary', action: 'playSong' },
          { label: 'View Album', type: 'secondary', action: 'viewAlbum' }
        ]
      },
      {
        id: 5,
        type: 'new-feature',
        title: 'New Feature: Collaborative Playlists',
        message: 'Now you can create and share playlists with friends in real-time. Try it out with your friends!',
        timestamp: new Date(Date.now() - 604800000),
        read: false,
        actions: [
          { label: 'Try It Now', type: 'primary', action: 'tryFeature' }
        ]
      },
      {
        id: 6,
        type: 'subscription',
        title: 'Subscription Renewal',
        message: 'Your premium subscription will renew on August 30, 2023. Your payment method ending in 4242 will be charged $9.99.',
        timestamp: new Date(Date.now() - 86400000 * 2),
        read: false,
        priority: 'medium'
      },
      {
        id: 7,
        type: 'recommendation',
        title: 'Recommended for You',
        message: 'Based on your recent plays, we think you\'ll love this new album from Dua Lipa.',
        timestamp: new Date(Date.now() - 86400000 * 3),
        read: true
      }
    ]);

    const filteredNotifications = computed(() => {
      if (activeFilters.value.length === 0 || activeFilters.value.includes('all')) {
        return notifications.value;
      }
      return notifications.value;

      // return notifications.value.filter(notification => {
      //   const matchUnread = activeFilters.value.includes('unread') ? !notification.read : true;
      //   const matchType = activeFilters.value.some(type => type === notification.type);
      //   return matchUnread && matchType;
      // });
    });

    const selectedNotificationData = computed(() => {
      return notifications.value.find(n => n.id === selectedNotification.value) || {};
    });

    const unreadCount = computed(() => {
      return notifications.value.filter(n => !n.read).length;
    });

    const getFilterCount = (type) => {
      if (type === 'all') return notifications.value.length;
      if (type === 'unread') return unreadCount.value;
      return notifications.value.filter(n => n.type === type).length;
    };

    const toggleFilter = (type) => {
      if (type === 'all') {
        activeFilters.value = ['all'];
        fetch_notifications(['all']);
        return;
      }

      const index = activeFilters.value.indexOf(type);
      if (index > -1) {
        activeFilters.value.splice(index, 1);
      } else {
        activeFilters.value.push(type);
      }

      // Remove 'all' if other filters are selected
      if (activeFilters.value.length > 1 && activeFilters.value.includes('all')) {
        activeFilters.value = activeFilters.value.filter(f => f !== 'all');
      }

      // If no filters left, default to 'all'
      if (activeFilters.value.length === 0) {
        activeFilters.value = ['all'];
        fetch_notifications(['all']);
      } else {
        fetch_notifications([...activeFilters.value]);
      }
    };

    const resetFilters = () => {
      activeFilters.value = ['all'];
      fetch_notifications(['all']);
      if (isMobile.value) {
        filterMenuOpen.value = false;
      }
    };

    const applyFilters = () => {
      filterMenuOpen.value = false;
    };

    const toggleFilterMenu = () => {
      filterMenuOpen.value = !filterMenuOpen.value;
    };

    const getNotificationIcon = (type) => {
      const icons = {
        'new-sign-in': 'fas fa-user-shield',
        'password-change': 'fas fa-lock',
        'new-playlist': 'fas fa-list-music',
        'new-song': 'fas fa-music',
        'new-feature': 'fas fa-star',
        'subscription': 'fas fa-credit-card',
        'recommendation': 'fas fa-thumbs-up'
      };
      return icons[type] || 'fas fa-bell';
    };

    const formatTime = (timestamp) => {
      const now = new Date();
      const diff = now - timestamp;

      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 0) return `${days}d`;
      if (hours > 0) return `${hours}h`;
      if (minutes > 0) return `${minutes}m`;
      return 'Just now';
    };

    const formatDetailedTime = (timestamp) => {
      return timestamp.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    };

    const handleNotificationClick = (notification) => {
      if (isMobile.value) {
        selectedNotification.value = notification.id;
        if (!notification.read) {
          markAsRead(notification.id);
        }
      } else {
        markAsRead(notification.id);
        // Handle notification action (e.g., navigate to relevant page)
        // console.log('Notification clicked:', notification);
      }
    };

    const markAsRead = (id) => {
      const notification = notifications.value.find(n => n.id === id);
      if (notification && !notification.read) {
        notification.read = true;
        set_as_read_notifications([id])

      }
    };


    const markAllAsRead = () => {
      let noty = []
      notifications.value.forEach(n => {
        if (!n.read) {
          n.read = true
        }
        noty.push(n.id)
      });
      set_as_read_notifications(noty)

    };

    const dismissNotification = (id) => {
      notifications.value = notifications.value.filter(n => n.id !== id);

      if (selectedNotification.value === id) {
        selectedNotification.value = null;
      }

      delete_notifications([id]);
    };

    const clearAllNotifications = () => {
      let noty = [];

      notifications.value.forEach(n => {
        if (!n.read) {
          n.read = true;
        }
        noty.push(n.id);
      });

      notifications.value = [];
      selectedNotification.value = null;

      delete_notifications(noty);
    };


    const handleAction = (action) => {
      console.log('Action performed:', action);
      // In a real app, this would trigger the appropriate action
      // For example: navigate to a page, open a modal, etc.
    };

    const toggleDarkMode = () => {
      userStore.setDarkMode(!userStore.isdarkmode);
    };
    const delete_notifications = async (noty = []) => {
      if (!userId.value || !disp_name.value || userId.value.length < 36) {
        userStore.set_snackbarMessage("Kindly login to delete Notifications!", "error", 5000);
        return;
      }

      if (!noty.length) return;

      delete_noty_loading.value = true;

      try {
        const response = await axios.delete(`${BASE_URL}/api/notifications/n`, {
          data: {
            userId: userId.value,
            disp_name: disp_name.value,
            noty_ids: noty,
          }
        });

        if (response.data.success) {
          delete_noty_loading.value = false;
        }
      } catch (error) {
        console.error("❌ Error deleting notifications:", error);
        userStore.set_snackbarMessage("Failed to delete Notifications", "error", 5000);
      } finally {
        delete_noty_loading.value = false;
      }
    };
    const reloadPage = () => {
      window.location.reload();
    };
    const set_as_read_notifications = async (noty = []) => {
      if (!userId.value || !disp_name.value || userId.value.length < 36) {
        return;
      }

      if (!noty) return

      delete_noty_loading.value = true;
      try {
        const response = await axios.post(`${BASE_URL}/api/notifications/r_u`, {
          userId: userId.value,
          disp_name: disp_name.value,
          noty_ids: noty,
        });
        if (response.data.success) {
          delete_noty_loading.value = false
        }


      } catch (error) {
        console.error("❌ Error fetching notifications:", error);
        // userStore.set_snackbarMessage("Failed to delete NOtifications", "error", 5000);
      } finally {
        delete_noty_loading.value = false;
      }
    };

    const fetch_notifications = async (types = ['unread']) => {  // Changed parameter name to be clearer
      if (!userId.value || !disp_name.value || userId.value.length < 36) {
        userStore.set_snackbarMessage("Kindly login to load Notifications!", "error", 5000);
        return;
      }

      notification_loading.value = true;
      try {
        const response = await axios.get(`${BASE_URL}/api/notifications/n`, {
          params: {
            userId: userId.value,
            disp_name: disp_name.value,
            limit: 10,
            type: types,  // Send the array directly
          },
          paramsSerializer: params => {
            return qs.stringify(params, { arrayFormat: 'repeat' });
          }
        });

        console.log("📥 Response:", response.data);
        notifications.value = response.data.notifications;

      } catch (error) {
        console.error("❌ Error fetching notifications:", error);
        userStore.set_snackbarMessage("Failed to load Notifications!", "error", 5000);
      } finally {
        notification_loading.value = false;
      }
    };


    return {
      reloadPage,
      timeAgo,
      isDarkMode: computed(() => userStore.isdarkmode),
      iscollapsedBig: computed(() => userStore.iscollapsedBig),
      isMobile,
      notifications,
      filteredNotifications,
      unreadCount,
      selectedNotification,
      selectedNotificationData,
      filters,
      activeFilters,
      filterMenuOpen,
      getFilterCount,
      toggleFilter,
      resetFilters,
      applyFilters,
      toggleFilterMenu,
      getNotificationIcon,
      formatTime,
      formatDetailedTime,
      handleNotificationClick,
      markAsRead,
      markAllAsRead,
      dismissNotification,
      clearAllNotifications,
      handleAction,
      toggleDarkMode,
      fetch_notifications,
      delete_notifications,
      set_as_read_notifications,
      injustifyIcon
    };
  }
}
</script>

<style scoped>
/* Base Styles */
.notification-app {
  padding: 0 5px;
  min-height: 100vh;
  transition: background-color 0.3s ease, color 0.3s ease;
  background-color: #f8fafc;
  color: #252525;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.notification-app.dark-mode {
  background-color: #0f172a;
  color: #f8fafc;
}

.notification-container {
  width: 100%;
  margin: 0 auto;
  padding: 2rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow-x: hidden;
  overflow-y: auto;
}

.notification-container.mobile-layout {
  padding: 0;
  max-width: 100%;
}

/* Header Styles */
.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
  width: 100%;
  position: sticky;
  top: 0;
  z-index: 90;
  background-color: inherit !important;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);

}

.dark-mode .header {
  border-bottom-color: #252525;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-left h1 {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0;
}

.unread-count {
  font-size: 0.875rem;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  background-color: #e2e8f0;
  color: #475569;
}

.dark-mode .unread-count {
  background-color: #252525;
  color: #94a3b8;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

/* Mobile Header */
.mobile-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem;
  background-color: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.dark-mode .mobile-header {
  background-color: #252525;
  border-bottom-color: #334155;
}

.mobile-header h1 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.back-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
}

.dark-mode .back-button {
  color: #94a3b8;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.filter-toggle {
  background: none;
  border: none;
  font-size: 1.1rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
}

.dark-mode .filter-toggle {
  color: #94a3b8;
}

/* Filter Controls */
.filter-controls {
  position: relative;
}

.filter-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: #e2e8f0;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  color: #475569;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dark-mode .filter-button {
  background-color: #252525;
  color: #94a3b8;
}

.filter-button:hover {
  background-color: #d1d5db;
}

.dark-mode .filter-button:hover {
  background-color: #334155;
}

.filter-controls.active .filter-button {
  background-color: #d1d5db;
}

.dark-mode .filter-controls.active .filter-button {
  background-color: #334155;
}

.filter-menu {
  position: absolute;
  top: 100%;
  right: 0;
  background-color: white;
  border-radius: 0.5rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  padding: 0.75rem;
  width: 220px;
  z-index: 20;
  margin-top: 0.5rem;
}

.dark-mode .filter-menu {
  background-color: #252525;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.filter-option {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.filter-option:hover {
  background-color: #f1f5f9;
}

.dark-mode .filter-option:hover {
  background-color: #334155;
}

.filter-option input {
  margin-right: 0.75rem;
}

.filter-label {
  flex: 1;
  font-size: 0.875rem;
}

.filter-badge {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 1rem;
  color: white;
}

/* Notification Controls */
.notification-controls {
  display: flex;
  justify-content: flex-start;
  align-items: start;
  margin-bottom: 1.5rem;
  flex-direction: column;
  gap: 3px;
  background-color: #3a3a3a90;
  box-shadow: 0px 0px 5px rgba(23, 22, 22, 0.882);
  padding: 5px;
  border-radius: 5px;
}

.mark-all-read,
.clear-all {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: none;
  font-size: 0.875rem;
  color: #3b82f6;
  cursor: pointer;
  padding: 0.5rem 0;
}

.dark-mode .mark-all-read,
.dark-mode .clear-all {
  color: #60a5fa;
}

.mark-all-read:disabled {
  color: #94a3b8;
  cursor: not-allowed;
}

.mark-all-read:hover:not(:disabled),
.clear-all:hover {
  text-decoration: underline;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 0;
  text-align: center;
  flex: 1;
}

.empty-icon {
  width: 5rem;
  height: 5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1.5rem;
  font-size: 2rem;
  background-color: #e2e8f0;
  color: #94a3b8;
}

.dark-mode .empty-icon {
  background-color: #252525;
  color: #475569;
}

.empty-state h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #64748b;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
  max-width: 300px;
}

.dark-mode .empty-state p {
  color: #94a3b8;
}

.reset-filters {
  background-color: #3b82f6;
  color: white;
  border: none;
  border-radius: 0.5rem;
  padding: 0.5rem 1.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dark-mode .reset-filters {
  background-color: #60a5fa;
}

.reset-filters:hover {
  background-color: #2563eb;
}

.dark-mode .reset-filters:hover {
  background-color: #3b82f6;
}

/* Notifications List */
.notifications {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 0.75rem;
  flex: 1;
}

.notification {
  display: flex;
  align-items: flex-start;
  padding: 1.25rem;
  border-radius: 0.75rem;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.dark-mode .notification {
  background-color: #252525;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
}

.notification:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.dark-mode .notification:hover {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
}

.notification.unread {
  border-left: 4px solid;
}

.notification.selected {
  background-color: #f1f5f9;
}

.dark-mode .notification.selected {
  background-color: #334155;
}

/* Notification Types */
.notification.new-sign-in.unread {
  border-left-color: #3b82f6;
}

.notification.password-change.unread {
  border-left-color: #10b981;
}

.notification.new-playlist.unread {
  border-left-color: #8b5cf6;
}

.notification.new-song.unread {
  border-left-color: #f59e0b;
}

.notification.new-feature.unread {
  border-left-color: #ec4899;
}

.notification.subscription.unread {
  border-left-color: #f97316;
}

.notification.recommendation.unread {
  border-left-color: #22c55e;
}

/* Notification Icon */
.notification-icon-container {
  margin-right: 1.25rem;
  flex-shrink: 0;
}

.notification-icon-background {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

/* Icon colors for different notification types */
.notification.new-sign-in .notification-icon-background {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.dark-mode .notification.new-sign-in .notification-icon-background {
  background-color: #1e3a8a;
  color: #93c5fd;
}

.notification.password-change .notification-icon-background {
  background-color: #dcfce7;
  color: #047857;
}

.dark-mode .notification.password-change .notification-icon-background {
  background-color: #064e3b;
  color: #6ee7b7;
}

.notification.new-playlist .notification-icon-background {
  background-color: #ede9fe;
  color: #5b21b6;
}

.dark-mode .notification.new-playlist .notification-icon-background {
  background-color: #5b21b6;
  color: #c4b5fd;
}

.notification.new-song .notification-icon-background {
  background-color: #fef3c7;
  color: #b45309;
}

.dark-mode .notification.new-song .notification-icon-background {
  background-color: #78350f;
  color: #fcd34d;
}

.notification.new-feature .notification-icon-background {
  background-color: #fce7f3;
  color: #be185d;
}

.dark-mode .notification.new-feature .notification-icon-background {
  background-color: #831843;
  color: #f9a8d4;
}

.notification.subscription .notification-icon-background {
  background-color: #ffedd5;
  color: #9a3412;
}

.dark-mode .notification.subscription .notification-icon-background {
  background-color: #7c2d12;
  color: #fdba74;
}

.notification.recommendation .notification-icon-background {
  background-color: #dcfce7;
  color: #166534;
}

.dark-mode .notification.recommendation .notification-icon-background {
  background-color: #14532d;
  color: #86efac;
}

/* Notification Content */
.notification-content {
  flex: 1;
  min-width: 0;
}

.notification-content h3 {
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.notification-content p {
  font-size: 0.875rem;
  margin-bottom: 0.75rem;
  line-height: 1.5;
  color: #64748b;
}

.dark-mode .notification-content p {
  color: #94a3b8;
}

.notification-meta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.notification-time {
  font-size: 0.75rem;
  color: #94a3b8;
}

.dark-mode .notification-time {
  color: #64748b;
}

.unread-badge {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 1rem;
  background-color: #3b82f6;
  color: white;
}

.priority-badge {
  font-size: 0.75rem;
  padding: 0.15rem 0.5rem;
  border-radius: 1rem;
  background-color: #fef3c7;
  color: #b45309;
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.dark-mode .priority-badge {
  background-color: #78350f;
  color: #fcd34d;
}

/* Notification Actions */
.notification-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-left: 1rem;
}

.mark-read-button,
.dismiss-button {
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s ease;
}

.dark-mode .mark-read-button,
.dark-mode .dismiss-button {
  color: #64748b;
}

.mark-read-button:hover {
  background-color: #e2e8f0;
  color: #3b82f6;
}

.dark-mode .mark-read-button:hover {
  background-color: #334155;
  color: #60a5fa;
}

.dismiss-button:hover {
  background-color: #fee2e2;
  color: #ef4444;
}

.dark-mode .dismiss-button:hover {
  background-color: #7f1d1d;
  color: #fca5a5;
}

/* Notification Detail View */
.notification-detail {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: white;
  z-index: 100;
  overflow-y: auto;
  padding: 1rem;
}

.dark-mode .notification-detail {
  background-color: #0f172a;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.dark-mode .detail-header {
  border-bottom-color: #252525;
}

.detail-header h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0;
}

.detail-content {
  max-width: 600px;
  margin: 0 auto;
}

.detail-icon {
  width: 4rem;
  height: 4rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  margin: 0 auto 2rem;
}

.detail-icon.new-sign-in {
  background-color: #dbeafe;
  color: #1d4ed8;
}

.dark-mode .detail-icon.new-sign-in {
  background-color: #1e3a8a;
  color: #93c5fd;
}

.detail-icon.password-change {
  background-color: #dcfce7;
  color: #047857;
}

.dark-mode .detail-icon.password-change {
  background-color: #064e3b;
  color: #6ee7b7;
}

.detail-icon.new-playlist {
  background-color: #ede9fe;
  color: #5b21b6;
}

.dark-mode .detail-icon.new-playlist {
  background-color: #5b21b6;
  color: #c4b5fd;
}

.detail-icon.new-song {
  background-color: #fef3c7;
  color: #b45309;
}

.dark-mode .detail-icon.new-song {
  background-color: #78350f;
  color: #fcd34d;
}

.detail-icon.new-feature {
  background-color: #fce7f3;
  color: #be185d;
}

.dark-mode .detail-icon.new-feature {
  background-color: #831843;
  color: #f9a8d4;
}

.detail-timestamp {
  font-size: 0.875rem;
  color: #64748b;
  text-align: center;
  display: block;
  margin-bottom: 2rem;
}

.dark-mode .detail-timestamp {
  color: #94a3b8;
}

.detail-message {
  background-color: #f1f5f9;
  padding: 1.5rem;
  border-radius: 0.75rem;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.dark-mode .detail-message {
  background-color: #252525;
}

.detail-actions {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.action-button {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.action-button.primary {
  background-color: #3b82f6;
  color: white;
}

.dark-mode .action-button.primary {
  background-color: #60a5fa;
}

.action-button.primary:hover {
  background-color: #2563eb;
}

.dark-mode .action-button.primary:hover {
  background-color: #3b82f6;
}

.action-button.secondary {
  background-color: #e2e8f0;
  color: #475569;
}

.dark-mode .action-button.secondary {
  background-color: #252525;
  color: #94a3b8;
}

.action-button.secondary:hover {
  background-color: #d1d5db;
}

.dark-mode .action-button.secondary:hover {
  background-color: #334155;
}

/* Mobile Filter Menu */
.mobile-filter-menu {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: white;
  border-radius: 1rem 1rem 0 0;
  padding: 1.5rem;
  z-index: 100;
  box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.1);
}

.dark-mode .mobile-filter-menu {
  background-color: #252525;
  box-shadow: 0 -4px 6px rgba(0, 0, 0, 0.3);
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filter-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.25rem;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
}

.dark-mode .close-button {
  color: #94a3b8;
}

.filter-options {
  max-height: 50vh;
  overflow-y: auto;
  margin-bottom: 1.5rem;
}

.filter-footer {
  display: flex;
  gap: 1rem;
}

.reset-button,
.apply-button {
  flex: 1;
  padding: 0.75rem;
  border-radius: 0.5rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
}

.reset-button {
  background-color: #e2e8f0;
  color: #475569;
}

.dark-mode .reset-button {
  background-color: #252525;
  color: #94a3b8;
}

.reset-button:hover {
  background-color: #d1d5db;
}

.dark-mode .reset-button:hover {
  background-color: #334155;
}

.apply-button {
  background-color: #3b82f6;
  color: white;
}

.dark-mode .apply-button {
  background-color: #60a5fa;
}

.apply-button:hover {
  background-color: #2563eb;
}

.dark-mode .apply-button:hover {
  background-color: #3b82f6;
}

/* Animations */
.notification-list-move {
  transition: transform 0.3s ease;
}

.notification-list-enter-active,
.notification-list-leave-active {
  transition: all 0.3s ease;
}

.notification-list-enter-from,
.notification-list-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Responsive Styles */
@media (max-width: 768px) {
  .notification-container {
    padding: 0;
  }

  .notification {
    border-radius: 0;
    border-bottom: 1px solid #e2e8f0;
    box-shadow: none;
  }

  .dark-mode .notification {
    border-bottom-color: #252525;
  }

  .notification:hover {
    transform: none;
    box-shadow: none;
  }
}

@media (min-width: 1200px) {
  /* .notification-container {
    max-width: 1400px;
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
  } */

  .header {
    grid-column: 1 / -1;
  }

  .notification-controls {
    grid-column: 1 / -1;
  }

  .notifications {
    grid-column: 2;
  }

  .notification-detail {
    position: sticky;
    top: 2rem;
    height: fit-content;
    background-color: #f1f5f9;
    border-radius: 1rem;
    padding: 2rem;
    margin-left: 2rem;
  }

  .dark-mode .notification-detail {
    background-color: #252525;
  }
}
</style>