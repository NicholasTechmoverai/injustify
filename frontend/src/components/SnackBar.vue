<template>
  <div>
    <!-- Modern Popup Component -->
    <transition name="modal">
      <div v-if="popupStore.isVisible" class="popup-overlay" @click.self="handleOverlayClick">
        <div class="popup-card">
          <div class="popup-header">
            <div class="popup-icon" v-if="popupStore.icon">
              <ion-icon :name="popupStore.icon"></ion-icon>
            </div>
            <h3>{{ popupStore.title }}</h3>
            <button v-if="popupStore.close_able" class="close-btn" @click="closePopup" aria-label="Close popup">
              <ion-icon name="close"></ion-icon>
            </button>
          </div>

          <div class="popup-body">
            <p>{{ popupStore.message }}</p>
          </div>

          <div class="popup-footer" v-if="Array.isArray(popupStore.actions)">
            <button v-for="(action, index) in popupStore.actions" :key="index"
              :class="['action-btn', action.type || 'default']" @click="handleAction(action)">
              {{ action.label }}
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Snackbar Container -->
    <div id="snackbar-container">
      <transition-group name="snackbar">
        <div v-for="(snackbar, index) in snackbars" :key="snackbar.id" :class="['snackbar', snackbar.type]"
          @mouseenter="pauseAutoRemove(snackbar.id)" @mouseleave="resumeAutoRemove(snackbar.id)">
          <div class="snackbar-content">
            <div class="snackbar-icon">
              <ion-icon :name="icons[snackbar.type]"></ion-icon>
            </div>
            <div class="snackbar-message">{{ snackbar.message }}</div>
          </div>
          <button class="close-btn" @click="removeSnackbar(index)" aria-label="Close notification">
            <ion-icon name="close"></ion-icon>
          </button>
          <div class="snackbar-progress" :class="snackbar.type"></div>
        </div>
      </transition-group>
    </div>
  </div>
</template>

<script>
import { computed, ref } from "vue";
import { useUserStore, usePopupStore } from "@/store/index.js";

export default {
  setup() {
    const userStore = useUserStore();
    const popupStore = usePopupStore();
    const timeouts = ref({});

    return {
      snackbars: computed(() => userStore.SnackBar_messages),
      icons: {
        success: "checkmark-circle",
        error: "close-circle",
        info: "information-circle",
        warning: "warning"
      },
      userStore,
      popupStore,
      timeouts
    };
  },
  methods: {
    showSnackbar(message, type = "info") {
      const id = Date.now();
      this.userStore.addSnackbar({ id, message, type });

      this.timeouts[id] = setTimeout(() => {
        this.userStore.removeSnackbar(id);
        delete this.timeouts[id];
      }, 5000);
    },
    pauseAutoRemove(id) {
      if (this.timeouts[id]) {
        clearTimeout(this.timeouts[id]);
        delete this.timeouts[id];
      }
    },
    resumeAutoRemove(id) {
      if (!this.timeouts[id]) {
        this.timeouts[id] = setTimeout(() => {
          this.userStore.removeSnackbar(id);
          delete this.timeouts[id];
        }, 1000);
      }
    },
    removeSnackbar(index) {
      const snackbar = this.snackbars[index];
      if (snackbar && this.timeouts[snackbar.id]) {
        clearTimeout(this.timeouts[snackbar.id]);
        delete this.timeouts[snackbar.id];
      }
      this.userStore.removeSnackbar(index);
    },
    handleAction(action) {
      this.popupStore.hidePopup(action.value,action.keepOpen); 
    },
    closePopup() {
      this.popupStore.hidePopup();
    },
    handleOverlayClick() {
      if (this.popupStore.closeOnOverlayClick) {
        this.closePopup();
      }
    }
  }
};
</script>

<style scoped>
/* Modern Popup Styles */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.popup-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 90%;
  max-width: 420px;
  overflow: hidden;
  transform: translateY(0);
  opacity: 1;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.popup-header {
  padding: 20px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
}

.popup-header h3 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1a1a1a;
  flex-grow: 1;
}

.popup-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: rgba(74, 107, 223, 0.1);
  color: #4a6bdf;
}

.popup-icon ion-icon {
  font-size: 20px;
}

.close-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #999;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  border-radius: 50%;
}

.close-btn:hover {
  background: rgba(0, 0, 0, 0.05);
  color: #666;
}

.close-btn ion-icon {
  font-size: 20px;
}

.popup-body {
  padding: 0 24px 20px;
  color: #555;
  line-height: 1.5;
}

.popup-footer {
  padding: 16px 24px;
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  background: #f9f9f9;
}

.action-btn {
  padding: 10px 18px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  transition: all 0.2s;
  min-width: 80px;
}

.action-btn.default {
  background-color: #f0f0f0;
  color: #333;
}

.action-btn.primary {
  background-color: #4a6bdf;
  color: white;
}

.action-btn.secondary {
  background-color: #f0f0f0;
  color: #4a6bdf;
  border: 1px solid #4a6bdf;
}

.action-btn.danger {
  background-color: #e74c3c;
  color: white;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.action-btn:active {
  transform: translateY(0);
}

/* Popup Animations */
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .popup-card,
.modal-leave-active .popup-card {
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.modal-enter-from .popup-card,
.modal-leave-to .popup-card {
  transform: translateY(20px);
  opacity: 0;
}

/* Modern Snackbar Styles */
#snackbar-container {
  position: fixed;
  bottom: 24px;
  right: 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 1000;
  max-width: calc(100% - 48px);
}

.snackbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  min-width: 280px;
  max-width: 380px;
  padding: 16px;
  border-radius: 12px;
  color: white;
  font-size: 14px;
  font-weight: 500;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.snackbar-content {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
}

.snackbar-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.snackbar-icon ion-icon {
  font-size: 20px;
}

.snackbar-message {
  flex: 1;
  line-height: 1.4;
}

.snackbar .close-btn {
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  margin-left: 12px;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s;
}

.snackbar .close-btn:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}

.snackbar .close-btn ion-icon {
  font-size: 18px;
}

.snackbar-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 4px;
  width: 100%;
  background: rgba(255, 255, 255, 0.3);
  transform-origin: left;
  animation: progress 5s linear forwards;
}

/* Snackbar Types */
.snackbar.success {
  background: linear-gradient(135deg, #2ecc71, #27ae60);
}

.snackbar.error {
  background: linear-gradient(135deg, #e74c3c, #c0392b);
}

.snackbar.info {
  background: linear-gradient(135deg, #3498db, #2980b9);
}

.snackbar.warning {
  background: linear-gradient(135deg, #f39c12, #e67e22);
}

.snackbar.success .snackbar-progress {
  background: rgba(255, 255, 255, 0.5);
}

.snackbar.error .snackbar-progress {
  background: rgba(255, 255, 255, 0.5);
}

.snackbar.info .snackbar-progress {
  background: rgba(255, 255, 255, 0.5);
}

.snackbar.warning .snackbar-progress {
  background: rgba(255, 255, 255, 0.5);
}

/* Snackbar Animations */
.snackbar-enter-active {
  animation: slideIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.snackbar-leave-active {
  animation: fadeOut 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }

  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    transform: translateX(0);
    opacity: 1;
  }

  to {
    transform: translateX(20px);
    opacity: 0;
  }
}

@keyframes progress {
  0% {
    transform: scaleX(1);
  }

  100% {
    transform: scaleX(0);
  }
}
</style>