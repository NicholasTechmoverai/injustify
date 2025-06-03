<template>
  <div v-if="loading" class="loading-overlay">
    <div class="loading-spinner">
      <i class="fas fa-spinner fa-spin"></i>
    </div>
  </div>

  <div class="MainContainer profile-container" :class="{ 'dark-mode': isDarkMode, collabsedBig: iscollapsedBig }">
    <!-- Desktop Landscape Layout -->
    <div class="desktop-layout">
      <div class="profile-sidebar" :class="{ 'dark-card': isDarkMode }">
        <!-- Profile Header -->
        <div class="profile-header">
          <div class="profile-picture" :class="{ showFullPrifilepic: showFullPic }">
            <img @click="showFullPic = true" :src="user.picture || defaultProfilePic" alt="Profile Picture"
              class="profile-image" />
            <div @click="triggerFileInput" v-if="allowEdit" class="edit-overlay">
              <i class="fas fa-camera"></i>
            </div>
            <button v-if="showFullPic" @click="showFullPic = false" class="closeshowFullPic"> <i
                class="fas fa-close"></i></button>
          </div>

          <div class="profile-actions" v-if="allowEdit && newProfilePicture">
            <button class="save-button" @click="saveProfileChanges" :class="{ 'dark-button': isDarkMode }"
              :disabled="!newProfilePicture">
              <i class="fas fa-save"></i> Save Changes
            </button>
          </div>
        </div>

        <!-- Profile Info -->
        <div class="profile-info">
          <div class="profile-name-section">
            <h2 class="profile-name">{{ user.name }}</h2>
            <span class="profile-visibility" :class="{ public: user.is_public, private: !user.is_public }">
              <i class="fas" :class="user.is_public ? 'fa-globe' : 'fa-lock'"></i>
              {{ user.is_public ? 'Public' : 'Private' }}
            </span>
          </div>

          <p class="member-since" v-if="user.created_at">
            <i class="fas fa-calendar-alt"></i> Member since {{ formatDate(user.created_at) }}
          </p>

          <div class="email-card" :class="{ 'dark-email-card': isDarkMode }">
            <div class="email-address">
              <i class="fas fa-envelope"></i> {{ user.disp_name }}
            </div>
            <div v-if="user.verified_email" class="verified-badge">
              <i class="fas fa-check-circle"></i>
            </div>
          </div>

          <div class="account-status" :class="{
            'free-account': user.account_type === 'free',
            'basic-account': user.account_type === 'basic',
            'pro-account': user.account_type === 'pro',
            'premium-account': user.account_type === 'premium',
            'upgrading-account': user.account_type === 'upgrading'
          }">
            <i class="fas" :class="{
              'fa-user': user.account_type === 'free',
              'fa-crown': user.account_type === 'basic',
              'fa-crown': user.account_type === 'pro',
              'fa-crown': user.account_type === 'premium',
              'fa-arrow-up': user.account_type === 'upgrading'
            }"></i>
            {{ accountTypeDisplay }}
            <button v-if="user.account_type !== 'premium'" class="upgrade-button" @click="upgradeAccount">
              Upgrade <i class="fas fa-arrow-up"></i>
            </button>
          </div>


          <!-- Download Stats -->
          <div class="stats-container">
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-download"></i></div>
              <div class="stat-info">
                <div class="stat-value">{{ totalDownloads }}</div>
                <div class="stat-label">Total Downloads</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-calendar-week"></i></div>
              <div class="stat-info">
                <div class="stat-value">{{ weeklyDownloads }}</div>
                <div class="stat-label">This Week</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon"><i class="fas fa-calendar-alt"></i></div>
              <div class="stat-info">
                <div class="stat-value">{{ monthlyDownloads }}</div>
                <div class="stat-label">This Month</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="profile-content">
        <!-- Recently Played Songs Section -->
        <div class="section-container" :class="{ 'dark-section': isDarkMode }">
          <h3 class="section-title">
            <i class="fas fa-music"></i> Recently Played Songs
            <span class="section-count">({{ recentlyPlayedSongs.length }})</span>
          </h3>

          <div class="songs-grid">
            <div class="song-card" v-for="(song, index) in recentlyPlayedSongs" :key="song.id">
              <div class="song-number">{{ index + 1 }}</div>
              <div class="song-cover" @click="playSong(song)">
                <img :src="song.cover" alt="Song cover">
                <div class="play-overlay">
                  <i class="fas fa-play"></i>
                </div>
              </div>
              <div class="song-info">
                <h4 class="song-title">{{ song.title }}</h4>
                <div class="song-artist">{{ song.artist }}</div>
                <div class="song-meta">
                  <span class="song-duration"><i class="fas fa-clock"></i> {{ song.duration }}</span>
                  <span class="song-played"><i class="fas fa-history"></i> {{ song.lastPlayed }}</span>
                </div>
              </div>
              <div class="song-actions">
                <button class="action-button favorite-button" @click="toggleFavorite(song)">
                  <i class="fas" :class="song.isFavorite ? 'fa-heart' : 'fa-heart-o'"></i>
                </button>
                <button class="action-button more-button">
                  <i class="fas fa-ellipsis-h"></i>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Playlists Section -->
        <div class="section-container" :class="{ 'dark-section': isDarkMode }">
          <h3 class="section-title">
            <i class="fas fa-list"></i> Your Playlists
            <span class="section-count">({{ userPlaylists.length }})</span>
          </h3>

          <div class="playlists-grid">
            <div class="playlist-card" v-for="playlist in userPlaylists" :key="playlist.id"
              @click="viewPlaylist(playlist)">
              <div class="playlist-cover">
                <img :src="playlist.cover || defaultPlaylistCover" alt="Playlist cover">
                <div class="playlist-songs-count">{{ playlist.songCount }} songs</div>
              </div>
              <div class="playlist-info">
                <h4 class="playlist-name">{{ playlist.name }}</h4>
                <div class="playlist-meta">
                  <span class="playlist-views">
                    <i class="fas fa-eye"></i> {{ playlist.views }}
                  </span>
                  <span class="playlist-date">
                    <i class="fas fa-clock"></i> {{ formatDate(playlist.date) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Mixes Section -->
        <div class="mixes-section">
          <!-- Downloaded Mixes -->
          <div class="section-container" :class="{ 'dark-section': isDarkMode }">
            <h3 class="section-title">
              <i class="fas fa-cloud-download-alt"></i> Downloaded Mixes
              <span class="section-count">({{ downloadedMixes.length }})</span>
            </h3>

            <div class="mixes-grid">
              <div class="mix-card" v-for="mix in downloadedMixes" :key="mix.id">
                <div class="mix-cover" @click="playMix(mix)">
                  <img :src="mix.cover" alt="Mix cover">
                  <div class="play-overlay">
                    <i class="fas fa-play"></i>
                  </div>
                </div>
                <div class="mix-details">
                  <h4 class="mix-name">{{ mix.name }}</h4>
                  <div class="mix-artist">{{ mix.type }}</div>
                  <div class="mix-meta">
                    <span class="mix-date"><i class="fas fa-calendar"></i> {{ timeAgo(mix.downloadDate) }}</span>
                    <span class="mix-size"><i class="fas fa-database"></i> {{ mix.size }} songs</span>
                  </div>
                </div>
                <div class="mix-actions">
                  <button class="action-button delete-button" @click="deleteMix(mix)">
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Live Played Mixes -->
          <div class="section-container" :class="{ 'dark-section': isDarkMode }">
            <h3 class="section-title">
              <i class="fas fa-headphones"></i> Recently Played Live
              <span class="section-count">({{ livePlayedMixes.length }})</span>
            </h3>

            <div class="mixes-grid">
              <div class="mix-card" v-for="mix in livePlayedMixes" :key="mix.id">
                <div class="mix-cover" @click="playMix(mix)">
                  <img :src="mix.cover" alt="Mix cover">
                  <div class="live-badge">LIVE</div>
                  <div class="play-overlay">
                    <i class="fas fa-play"></i>
                  </div>
                </div>
                <div class="mix-details">
                  <h4 class="mix-name">{{ mix.name }}</h4>
                  <div class="mix-artist">{{ mix.artist }}</div>
                  <div class="mix-meta">
                    <span class="mix-date"><i class="fas fa-clock"></i> {{ mix.playDate }}</span>
                    <span class="mix-duration"><i class="fas fa-hourglass"></i> {{ mix.duration }}</span>
                  </div>
                </div>
                <div class="mix-actions">
                  <button class="action-button favorite-button" @click="toggleFavorite(mix)">
                    <i class="fas" :class="mix.isFavorite ? 'fa-heart' : 'fa-heart-o'"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <!-- Hidden File Input -->
    <input type="file" ref="fileInput" accept="image/*" @change="handleFileChange" style="display: none" />

    <!-- Audio Player (hidden but available for playback) -->
    <audio ref="audioPlayer" style="display: none;"></audio>
  </div>
</template>

<script>
import axios from "axios";
import { ref, computed, onMounted, watch, toRefs } from "vue";
import { useUserStore } from "@/store/index.js";
import { BASE_URL, formatDate, timeAgo } from "@/utils/index.js";

export default {
  name: "UserProfile",
  props: {
    useremail: String,
  },
  setup(props) {
    const { useremail } = toRefs(props);
    const user = ref({});
    const newProfilePicture = ref(null);
    const defaultProfilePic = "/default-profile-blue.png";
    const defaultPlaylistCover = "/default-playlist-cover.png";
    const fileInput = ref(null);
    const loading = ref(false);
    const credential_loading = ref(false);
    const playlistId = ref(null);
    const userStore = useUserStore();
    const isMobile = ref(window.innerWidth < 768);
    const audioPlayer = ref(null);
    const showFullPic = ref(false)


    const userId = computed(() => userStore.userId);
    const showSubscriptionCards =  computed(() => userStore.showSubscriptionCards);
    // Check for mobile view on resize
    const checkMobile = () => {
      isMobile.value = window.innerWidth < 768;
    };


    const allowEdit = ref(false)
    window.addEventListener('resize', checkMobile);
    // Sample recently played songs data
    const recentlyPlayedSongs = ref([])
    // const recentlyPlayedSongs = ref([
    //   {
    //     id: 1,
    //     title: "Blinding Lights",
    //     artist: "The Weeknd",
    //     cover: "https://i.scdn.co/image/ab67616d00001e02a9f6c04ba168640b48aa5795",
    //     duration: "3:20",
    //     lastPlayed: "2 hours ago",
    //     isFavorite: true,
    //     audioUrl: "https://example.com/song1.mp3"
    //   },
    //   {
    //     id: 2,
    //     title: "Save Your Tears",
    //     artist: "The Weeknd",
    //     cover: "https://i.scdn.co/image/ab67616d00001e02a9f6c04ba168640b48aa5795",
    //     duration: "3:35",
    //     lastPlayed: "1 day ago",
    //     isFavorite: false,
    //     audioUrl: "https://example.com/song2.mp3"
    //   },
    //   {
    //     id: 3,
    //     title: "Stay",
    //     artist: "The Kid LAROI, Justin Bieber",
    //     cover: "https://i.scdn.co/image/ab67616d00001e02a9f6c04ba168640b48aa5795",
    //     duration: "2:21",
    //     lastPlayed: "3 days ago",
    //     isFavorite: true,
    //     audioUrl: "https://example.com/song3.mp3"
    //   },
    //   {
    //     id: 4,
    //     title: "good 4 u",
    //     artist: "Olivia Rodrigo",
    //     cover: "https://i.scdn.co/image/ab67616d00001e02a9f6c04ba168640b48aa5795",
    //     duration: "2:58",
    //     lastPlayed: "1 week ago",
    //     isFavorite: false,
    //     audioUrl: "https://example.com/song4.mp3"
    //   },
    //   {
    //     id: 5,
    //     title: "Levitating",
    //     artist: "Dua Lipa",
    //     cover: "https://i.scdn.co/image/ab67616d00001e02a9f6c04ba168640b48aa5795",
    //     duration: "3:23",
    //     lastPlayed: "2 weeks ago",
    //     isFavorite: true,
    //     audioUrl: "https://example.com/song5.mp3"
    //   }
    // ]);

    const userPlaylists = ref([])
    // const userPlaylists = ref([
    //   {
    //     id: 1,
    //     name: "Workout Mix 2023",
    //     cover: "https://misc.scdn.co/liked-songs/liked-songs-64.png",
    //     songCount: 24,
    //     views: "1.2K",
    //     date: "2 weeks ago"
    //   },
    //   {
    //     id: 2,
    //     name: "Chill Vibes",
    //     cover: "https://i.scdn.co/image/ab67706f00000002a980b152e708b33c6518d9e2",
    //     songCount: 18,
    //     views: "856",
    //     date: "1 month ago"
    //   },
    //   {
    //     id: 3,
    //     name: "Road Trip",
    //     cover: "https://i.scdn.co/image/ab67706f00000002583117b5a5f0a4c2f5b0e8d5",
    //     songCount: 32,
    //     views: "2.4K",
    //     date: "3 months ago"
    //   }
    // ]);
    const downloadedMixes = ref([])
    // const downloadedMixess = ref([
    //   {
    //     id: 1,
    //     name: "Summer Hits 2023",
    //     artist: "Various Artists",
    //     cover: "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",
    //     downloadDate: "2023-07-15",
    //     size: "256 MB",
    //     audioUrl: "https://example.com/mix1.mp3"
    //   },
    //   {
    //     id: 2,
    //     name: "Deep Focus",
    //     artist: "Spotify",
    //     cover: "https://i.scdn.co/image/ab67706f00000002d72ef75e14ca6f60ea2364c2",
    //     downloadDate: "2023-06-28",
    //     size: "189 MB",
    //     audioUrl: "https://example.com/mix2.mp3"
    //   }
    // ]);

    const livePlayedMixes = ref([])
    // const livePlayedMixess = ref([
    //   {
    //     id: 1,
    //     name: "Friday Night Live",
    //     artist: "DJ Mark",
    //     cover: "https://i.scdn.co/image/ab67656300005f1ff9a9e1a8a0e1b9a0a0e1b9a0",
    //     playDate: "2023-08-04",
    //     duration: "2h 15m",
    //     isFavorite: true,
    //     audioUrl: "https://example.com/live1.mp3"
    //   },
    //   {
    //     id: 2,
    //     name: "Morning Coffee Mix",
    //     artist: "Chill Station",
    //     cover: "https://i.scdn.co/image/ab67656300005f1f6b6a6a6a6a6a6a6a6a6a6a6a",
    //     playDate: "2023-08-02",
    //     duration: "1h 45m",
    //     isFavorite: false,
    //     audioUrl: "https://example.com/live2.mp3"
    //   }
    // ]);

    const totalDownloads = ref(0);
    const weeklyDownloads = ref(0);
    const monthlyDownloads = ref(0);

    const accountTypeDisplay = computed(() => {
      switch (user.value.account_type) {
        case 'free': return 'Free Account';
        case 'basic': return 'Basic Account';
        case 'pro': return 'Pro Account';
        case 'premium': return 'Premium Account';
        case 'upgrading': return 'Upgrading...';
        default: return 'Free Account';
      }
    });
    const fetchUserProfile = async () => {
      loading.value = true;
      try {
        const response = await axios.get(`${BASE_URL}/api/profile/${useremail.value}`);
        user.value = response.data.user_info ? response.data.user_info : response.data;
        playlistId.value = response.data.playlistId;
        console.log(">>>>", response.data)

        // Set default values if not provided
        user.value.is_public = user.value.is_public !== undefined ? user.value.is_public : true;
        user.value.account_type = user.value.account_type || "NOT Found";
        // user.value.account_type = computed(() => userStore.subscription);

        if (userId.value) {
          allowEdit.value = userId.value == user.value.id
        }

      } catch (error) {
        console.error("Error fetching profile:", error);
        userStore.set_snackbarMessage("Failed to load profile", "error", 5000);
      } finally {
        loading.value = false;
      }
    };

    const fetchUsercredentials = async () => {
      credential_loading.value = true;
      try {
        const response = await axios.get(`${BASE_URL}/api/profile/account/${useremail.value}`);
        playlistId.value = response.data.playlists;
        console.log(response.data)

        const crd = response.data.user_credentials ? response.data.user_credentials : response.data;

        // Set default values if not provided
        user.value.is_public = crd.is_public;
        // user.value.account_type = crd.account_type ;
        totalDownloads.value = crd.total_downloads;
        weeklyDownloads.value = crd.this_week_downloads;
        monthlyDownloads.value = crd.last_month_downloads;
        // downloadedMixes.value = response.data.downloaded_mixes;
        // livePlayedMixes.value = response.data.live_played_mixes;
        userPlaylists.value = crd.playlists;



        if (userId.value) {
          allowEdit.value = userId.value == user.value.id
        }

      } catch (error) {
        console.error("Error fetching profile:", error);
        userStore.set_snackbarMessage("Failed to load profile", "error", 5000);
      } finally {
        credential_loading.value = false;
      }
    };

    const fetch_mixes = async () => {
      credential_loading.value = true;
      try {
        const response = await axios.get(`${BASE_URL}/api/profile/mixes/${useremail.value}`, {
          params: {
            source: null,
            date: null,
          },
        });
        console.log("MIXES:", response.data);
        downloadedMixes.value = response.data

        if (userId.value) {
          allowEdit.value = userId.value === user.value.id;
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        userStore.set_snackbarMessage("Failed to load profile", "error", 5000);
      } finally {
        credential_loading.value = false;
      }
    };




    const upgradeAccount = () => {
      userStore.showSubscriptionCards = true
      // Implementation for upgrade account
      // Simulate upgrade process
      // setTimeout(() => {
      //   user.value.account_type = 'premium';
      //   userStore.set_snackbarMessage("Account upgraded to Premium!", "success", 5000);
      // }, 2000);
    };

    // Play song function
    const playSong = (song) => {
      if (audioPlayer.value) {
        audioPlayer.value.src = song.audioUrl;
        audioPlayer.value.play().catch(e => console.error("Playback failed:", e));

        // Update last played time
        song.lastPlayed = "Just now";

        // Move to top of recently played
        const index = recentlyPlayedSongs.value.findIndex(s => s.id === song.id);
        if (index > 0) {
          const [playedSong] = recentlyPlayedSongs.value.splice(index, 1);
          recentlyPlayedSongs.value.unshift(playedSong);
        }
      }
    };

    // Play mix function
    const playMix = (mix) => {
      if (audioPlayer.value) {
        audioPlayer.value.src = mix.audioUrl;
        audioPlayer.value.play().catch(e => console.error("Playback failed:", e));
      }
    };

    // Toggle favorite
    const toggleFavorite = (item) => {
      item.isFavorite = !item.isFavorite;
      userStore.set_snackbarMessage(
        item.isFavorite ? "Added to favorites" : "Removed from favorites",
        "success",
        2000
      );
    };

    // Delete mix
    const deleteMix = (mix) => {
      const index = downloadedMixes.value.findIndex(m => m.id === mix.id);
      if (index !== -1) {
        downloadedMixes.value.splice(index, 1);
        userStore.set_snackbarMessage("Mix deleted", "success", 2000);
      }
    };

    // View playlist
    const viewPlaylist = (playlist) => {
      // Navigate to playlist view
      console.log("Viewing playlist:", playlist.name);
    };

    watch(useremail, fetchUserProfile);
    watch(showSubscriptionCards.value, user.value.account_type = showSubscriptionCards.value ? 'upgrading' : user.value.account_type);
    const triggerFileInput = () => {
      allowEdit.value = userId.value == user.value.id

      if (allowEdit.value) {
        fileInput.value.click();
      }
    };

    const handleFileChange = (event) => {
      allowEdit.value = userId.value == user.value.id

      if (allowEdit.value) {
        const file = event.target.files[0];
        if (file && file.type.match("image.*")) {
          const reader = new FileReader();
          reader.onload = (e) => {
            user.value.picture = e.target.result;
          };
          reader.readAsDataURL(file);
          newProfilePicture.value = file;
        } else {
          userStore.set_snackbarMessage(
            "Please select a valid image file",
            "error",
            5000
          );
        }
      }
    };

    const saveProfileChanges = async () => {
      if (!newProfilePicture.value) return;

      const formData = new FormData();
      formData.append("profilePic", newProfilePicture.value);
      formData.append("userId", user.value.id);

      try {
        loading.value = true;
        const response = await axios.post(
          `${BASE_URL}/api/profile/updateProfile`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        if (response.data.success) {
          userStore.setUser(response.data.user ?? user.value);
          userStore.set_snackbarMessage("Profile updated successfully!", "success", 5000);
          newProfilePicture.value = null;
        } else {
          throw new Error(response.data.message || "Update failed");
        }
      } catch (error) {
        console.error("Error updating profile:", error);
        userStore.set_snackbarMessage(
          error.message || "Failed to update profile",
          "error",
          5000
        );
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchUserProfile();
      fetchUsercredentials();
      checkMobile();
      fetch_mixes();
    });

    return {
      user,
      loading,
      defaultProfilePic,
      defaultPlaylistCover,
      fileInput,
      recentlyPlayedSongs,
      userPlaylists,
      downloadedMixes,
      livePlayedMixes,
      totalDownloads,
      weeklyDownloads,
      monthlyDownloads,
      accountTypeDisplay,
      triggerFileInput,
      handleFileChange,
      saveProfileChanges,
      upgradeAccount,

      playlistId,
      formatDate,
      newProfilePicture,
      isMobile,
      audioPlayer,
      playSong,
      playMix,
      toggleFavorite,
      deleteMix,
      viewPlaylist,
      isDarkMode: computed(() => userStore.isdarkmode),
      iscollapsedBig: computed(() => userStore.iscollapsedBig),
      allowEdit,
      showFullPic,
      timeAgo
    };
  },
};
</script>

<style scoped>
/* Base Styles */
.closeshowFullPic {
  position: absolute;
  top: 0;
  right: 5px !important;
  color: red;
}

.showFullPrifilepic {
  width: 100%;
  min-width: 300px;
  max-width: 500px;
  position: relative;
  z-index: 105;

  border-top: 3px solid black;
  border-bottom: 3px solid black;

  border-radius: 10px !important;
  overflow: visible;
}



.profile-container {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #333;
  padding: 0;
  transition: all 0.3s ease;
  min-height: 100vh;
}

.dark-mode {
  background-color: #121212;
  color: #e0e0e0;
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 90;
  backdrop-filter: blur(5px);
}

.loading-spinner {
  color: white;
  font-size: 48px;
}

/* Desktop Landscape Layout */
.desktop-layout {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.profile-sidebar {
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
  padding: 24px;
  position: sticky;
  top: 24px;
  height: fit-content;
  overflow-y: auto;
  min-width: 300px;
}

.dark-card {
  background: #1e1e1e;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.profile-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.profile-picture {
  position: relative;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  cursor: pointer;
  border: 4px solid #f5f5f5;
  transition: transform 0.3s ease;
  margin-bottom: 16px;
}

.dark-card .profile-picture {
  border-color: #333;
}

/* .profile-picture:hover {
  transform: scale(1.05);
} */

.profile-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.edit-overlay {
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 20px;
  height: 20px;

  color: white;
  opacity: 0.7;
  transition: all 0.5s ease;
}

.edit-overlay:hover {
  opacity: 1;
  color: blue;
}

.save-button {
  background: #8AB4f8;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  width: 100%;
  justify-content: center;
}

.save-button:hover {
  background: #1ed760;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(29, 185, 84, 0.3);
}

.save-button:disabled {
  background: #b3b3b3;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.dark-button {
  background: #535353;
}

.dark-button:hover {
  background: #666;
}

/* Profile Info */
.profile-info {
  margin-bottom: 32px;
}

.profile-name-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  text-align: center;
}

.profile-name {
  font-size: 24px;
  font-weight: 700;
  margin: 0;
  line-height: 1.2;
}

.profile-visibility {
  font-size: 13px;
  padding: 4px 12px;
  border-radius: 12px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.profile-visibility.public {
  background: rgba(29, 185, 84, 0.1);
  color: #8AB4f8;
}

.profile-visibility.private {
  background: rgba(255, 0, 0, 0.1);
  color: #ff0000;
}

.member-since {
  color: #666;
  margin: 0 0 16px 0;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  justify-content: center;
}

.dark-card .member-since {
  color: #b3b3b3;
}

.account-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 500;
  margin-bottom: 16px;
  width: 100%;
  justify-content: center;
  font-size: 14px;
}

.free-account {
  background: rgba(179, 179, 179, 0.1);
  color: #b3b3b3;
}

.premium-account {
  background: rgba(255, 215, 0, 0.1);
  color: #ffd700;
}

.upgrading-account {
  background: rgba(0, 191, 255, 0.1);
  color: #00bfff;
}

.upgrade-button {
  background: #8AB4f8;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 12px;
  font-size: 12px;
  margin-left: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.upgrade-button:hover {
  background: #1ed760;
}

.email-card {
  background: #f5f5f5;
  padding: 12px 16px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  font-size: 14px;
}

.dark-email-card {
  background: #282828;
}

.email-address {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.verified-badge {
  color: #8AB4f8;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

/* Stats Container */
.stats-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
  margin-bottom: 24px;
}

.stat-card {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: transform 0.3s ease;
}

.dark-card .stat-card {
  background: #282828;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  width: 40px;
  height: 40px;
  background: #8AB4f8;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.stat-info {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-size: 18px;
  font-weight: 700;
}

.stat-label {
  font-size: 12px;
  color: #666;
}

.dark-card .stat-label {
  color: #b3b3b3;
}

/* Profile Content */
.profile-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Section Containers */
.section-container {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.dark-section {
  background: #282828;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.section-title {
  font-size: 20px;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}

.section-count {
  font-size: 14px;
  color: #666;
  font-weight: normal;
  margin-left: 6px;
}

.dark-section .section-count {
  color: #b3b3b3;
}

/* Recently Played Songs */
.songs-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.song-card {
  display: grid;
  grid-template-columns: 24px 56px 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.dark-section .song-card {
  background: #333;
}

.song-card:hover {
  background: #f5f5f5;
}

.dark-section .song-card:hover {
  background: #3d3d3d;
}

.song-number {
  font-size: 16px;
  font-weight: 500;
  color: #999;
  text-align: center;
}

.song-cover {
  position: relative;
  width: 56px;
  height: 56px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.song-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.play-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.song-cover:hover .play-overlay {
  opacity: 1;
}

.song-info {
  min-width: 0;
}

.song-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.song-artist {
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark-section .song-artist {
  color: #b3b3b3;
}

.song-meta {
  display: flex;
  gap: 16px;
  font-size: 12px;
  color: #999;
}

.song-actions {
  display: flex;
  gap: 8px;
}

.action-button {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
}

.favorite-button {
  color: #ff4d4d;
}

.favorite-button:hover {
  background: rgba(255, 77, 77, 0.1);
}

.more-button {
  color: #666;
}

.more-button:hover {
  background: rgba(0, 0, 0, 0.05);
}

.dark-section .more-button {
  color: #b3b3b3;
}

.dark-section .more-button:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* Playlists Grid */
.playlists-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.playlist-card {
  background: white;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  cursor: pointer;
}

.dark-section .playlist-card {
  background: #333;
}

.playlist-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.playlist-cover {
  position: relative;
  width: 100%;
  padding-top: 100%;
  overflow: hidden;
}

.playlist-cover img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.playlist-songs-count {
  position: absolute;
  bottom: 8px;
  right: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
}

.playlist-info {
  padding: 12px;
}

.playlist-name {
  font-size: 14px;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.playlist-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #666;
}

.dark-section .playlist-meta {
  color: #b3b3b3;
}

/* Mixes Section */
.mixes-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.mixes-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 12px;
}

.mix-card {
  display: grid;
  grid-template-columns: 72px 1fr auto;
  gap: 12px;
  align-items: center;
  padding: 12px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

.dark-section .mix-card {
  background: #333;
}

.mix-card:hover {
  background: #f5f5f5;
}

.dark-section .mix-card:hover {
  background: #3d3d3d;
}

.mix-cover {
  position: relative;
  width: 72px;
  height: 72px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
}

.mix-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.live-badge {
  position: absolute;
  top: 4px;
  left: 4px;
  background: #ff0000;
  color: white;
  font-size: 10px;
  font-weight: bold;
  padding: 2px 6px;
  border-radius: 4px;
}

.mix-details {
  min-width: 0;
}

.mix-name {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 4px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.mix-artist {
  font-size: 14px;
  color: #666;
  margin-bottom: 6px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.dark-section .mix-artist {
  color: #b3b3b3;
}

.mix-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
}

.delete-button {
  color: #ff4d4d;
}

.delete-button:hover {
  background: rgba(255, 77, 77, 0.1);
}



/* Responsive Adjustments */
@media (max-width: 1200px) {
  .desktop-layout {
    grid-template-columns: 300px 1fr;
    gap: 20px;
    padding: 20px;
  }

  .mixes-section {
    grid-template-columns: 1fr;
    gap: 20px;
  }
}

@media (max-width: 992px) {
  .desktop-layout {
    grid-template-columns: 300px 1fr;
  }

  .profile-sidebar {
    padding: 20px;
  }

  .section-container {
    padding: 10px;
  }
}

@media (max-width: 768px) {
  .desktop-layout {
    display: flex;
    flex-direction: column;
    gap: 24px;
    width: 100%;
    margin: 0 auto;
    padding: 0px;
  }

  .profile-sidebar {
    border-radius: 16px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
    padding: 5px;
    position: relative;
    top: 24px;
    height: fit-content;
    overflow-y: auto;
    width: 100%;
  }

}

@media (min-width: 568px) {


  /* Mobile styles are already defined */
  .profile-picture-mobile {
    width: 150px;
    height: 150px
  }
}
</style>