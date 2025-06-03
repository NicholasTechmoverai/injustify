<template>
  <div class="notifications-container MainContainer" :class="{ collapsed: iscollapsedBig }">
  <img id="imgg" :src="bckg" alt="" srcset="">
    <div id="Holdcont">
      <h2>📊 Analytics</h2>
      <p class="coming-soon">Coming Soon!</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from "vue";
import socket from "@/services/websocket"; // WebSocket service
import { useUserStore } from "@/store/index.js";
import bckg  from "../assets/original-76bdf3ff530aaf2597691cc659dccd1e.webp"

const messages = ref([]);
const userStore = useUserStore();
const iscollapsedBig = computed(() => userStore.iscollapsedBig);

onMounted(() => {
  socket.on("message", (data) => {
    messages.value.push(data);
  });
});

onUnmounted(() => {
  socket.off("message");
  socket.off("new_notification"); 
});
</script>

<style scoped>
.notifications-container {
  padding: 40px;
  transition: all 0.3s ease-in-out;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden !important;
  justify-content: center;
}

.notifications-container.collapsed {
  margin-left: 80px;
  width: calc(100% - 80px);
}

#imgg{
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(7px) brightness(60%);
  position: absolute;
  user-select: none;
  z-index: 20;
}

h2 {
  color: #cecece;
  font-size: 26px;
  font-weight: bold;
  text-align: center;
  margin-bottom: 20px;
  text-shadow: 2px 2px 10px rgba(0, 0, 0, 0.3);
}

/* Container for Centered Text */
#Holdcont {
  display: flex;
  flex-direction: column;
  gap:20px;
  align-items: center;
  justify-content: center;
  width: fit-content;
  height: auto;
  padding:10px 50px;
  background: rgba(6, 16, 26, 0.61);
  border-radius: 10px;
  z-index: 100;
}

/* Animated "Coming Soon" Text */
.coming-soon {
  text-align: center;
  font-size: 32px;
  font-weight: bold;
  color: #f6f6f6;
  text-shadow: 2px 2px 10px rgba(255, 255, 255, 0.5);
  animation: pulse 2s infinite alternate ease-in-out;
}

/* Animation Effect */
@keyframes pulse {
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
  100% {
    transform: scale(1.1);
    opacity: 1;
  }
}

/* Responsive Design */
@media (max-width: 768px) {
  .notifications-container {
    margin-left: 0;
    width: 100%;
    padding: 20px;
  }

  .coming-soon {
    font-size: 24px;
  }
}
</style>

<!-- 
<template>

  <audio controls src="http://127.0.0.1:8000/api/stream/b73818b4-30fb-45cb-a87a-025fc1d82666"></audio>
  <div class="max-w-xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-4">Lyrics Fetcher</h2>
    <form @submit.prevent="fetchLyrics" class="space-y-4">
      <div>
        <label class="block text-sm font-medium mb-1">Artist</label>
        <input v-model="artist" type="text" class="w-full border p-2 rounded" required />
      </div>
      <div>
        <label class="block text-sm font-medium mb-1">Song Title</label>
        <input v-model="title" type="text" class="w-full border p-2 rounded" required />
      </div>
      <button type="submit" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
        Get Lyrics
      </button>
    </form>

    <div v-if="loading" class="mt-4 text-gray-500">Loading...</div>
    <div v-if="error" class="mt-4 text-red-500">{{ error }}</div>

    <div v-if="lyrics" class="mt-6 whitespace-pre-line bg-gray-600 p-4 rounded">
      <h3 class="font-semibold mb-2">Lyrics:</h3>
      <pre>{{ lyrics }}</pre>
    </div>
  </div>
</template>

<script>
import axios from 'axios'

export default {
  name: 'LyricsFetcher',
  data() {
    return {
      artist: '',
      title: '',
      lyrics: '',
      loading: false,
      error: null
    }
  },
  methods: {
    async fetchLyrics() {
      this.lyrics = ''
      this.error = null
      this.loading = true

      try {
        const response = await axios.post('http://localhost:8000/global/lyrics', {
          artist: this.artist,
          title: this.title
        })
        this.lyrics = response.data.lyrics
      } catch (err) {
        this.error = err.response?.data?.detail || 'Failed to fetch lyrics.'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
input, button {
  font-size: 1rem;
}
</style>

<template>
  <div class="max-w-xl mx-auto p-6">
    <h2 class="text-2xl font-bold mb-4">Lyrics Player</h2>
    
    <audio 
      ref="audioPlayer" 
      controls 
      src="http://127.0.0.1:8000/api/stream/b73818b4-30fb-45cb-a87a-025fc1d82666"
      @timeupdate="updateCurrentLyric"
      class="w-full mb-6"
    ></audio>

    <div 
      v-if="parsedLyrics.length" 
      class="lyrics-container mt-6 bg-gray-100 p-4 rounded-lg max-h-96 overflow-y-auto"
    >
      <div 
        v-for="(line, index) in parsedLyrics" 
        :key="index"
        :ref="'lyricLine' + index"
        :class="{
          'lyric-line': true,
          'current-line': currentLineIndex === index,
          'section-header': line.type === 'section'
        }"
        @click="seekToTime(line.time)"
      >
        {{ line.text }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LyricsPlayer',
  data() {
    return {
      parsedLyrics: [
        {"time": 0.766, "text": "[Verse 1]", "type": "section"},
        {"time": 1.393, "text": "Your morning eyes, I could stare"},
        {"time": 1.997, "text": "like watching stars"},
        {"time": 2.601, "text": "I could walk you by,"},
        {"time": 3.228, "text": "and I'll tell without a thoughtYou'd be mine,"},
        {"time": 3.855, "text": "would you mind if I took your hand tonight?"},
        {"time": 4.481, "text": "Know you're all that I want this life"},
        {"time": 5.085, "text": "[Chorus]", "type": "section"},
        {"time": 5.689, "text": "I'll imagine we fell in love"},
        {"time": 6.316, "text": "I'll nap under"},
        {"time": 6.943, "text": "moonlight skies"},
        {"time": 7.546, "text": "with you"},
        {"time": 8.150, "text": "I think I'll picture us, you with the"},
        {"time": 8.777, "text": "waves"},
        {"time": 9.381, "text": "The ocean's colors on your face"},
        {"time": 10.008, "text": "I'll leave my heart with your air"},
        {"time": 10.612, "text": "So let me fly with you"},
        {"time": 11.215, "text": "Will you be forever with me?"},
        {"time": 11.842, "text": "[Verse 2]", "type": "section"},
        {"time": 12.446, "text": "My love will always stay by you"},
        {"time": 13.050, "text": "I'll keep it safe, so don't you worry a thing"},
        {"time": 13.677, "text": "I'll tell you I love you more"},
        {"time": 14.303, "text": "It's stuck with you forever, so promise you won't let it go"},
        {"time": 14.907, "text": "I'll trust the universe will always bring me to you"},
        {"time": 15.534, "text": "[Chorus]", "type": "section"},
        {"time": 16.138, "text": "I'll imagine we fell in love"},
        {"time": 16.742, "text": "I'll nap under moonlight skies with you"},
        {"time": 17.369, "text": "I think I'll picture us, you with the waves"},
        {"time": 17.995, "text": "The ocean's colors on your face"},
        {"time": 18.576, "text": "I'll leave my heart with your air"},
        {"time": 19.203, "text": "So let me fly with you"},
        {"time": 19.830, "text": "Will you be forever with me?"}
      ],
      currentLineIndex: -1
    }
  },
  mounted() {
    // Initialize with first line if audio starts at 0
    this.updateCurrentLyric();
  },
  methods: {
    updateCurrentLyric() {
      if (!this.$refs.audioPlayer || !this.parsedLyrics.length) return;
      
      const currentTime = this.$refs.audioPlayer.currentTime;
      let newIndex = -1;
      
      // Find the last lyric line that should be active
      for (let i = 0; i < this.parsedLyrics.length; i++) {
        if (this.parsedLyrics[i].time <= currentTime) {
          newIndex = i;
        } else {
          break;
        }
      }
      
      if (newIndex !== this.currentLineIndex) {
        this.currentLineIndex = newIndex;
        this.scrollToCurrentLine();
      }
    },
    
    scrollToCurrentLine() {
      if (this.currentLineIndex >= 0) {
        this.$nextTick(() => {
          const lineElement = this.$refs[`lyricLine${this.currentLineIndex}`]?.[0];
          if (lineElement) {
            lineElement.scrollIntoView({
              behavior: 'smooth',
              block: 'center'
            });
          }
        });
      }
    },
    
    seekToTime(time) {
      if (this.$refs.audioPlayer) {
        this.$refs.audioPlayer.currentTime = time;
        this.$refs.audioPlayer.play();
      }
    }
  }
}
</script>

<style scoped>
.lyrics-container {
  scroll-behavior: smooth;
}

.lyric-line {
  padding: 8px 12px;
  margin: 4px 0;
  border-radius: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.lyric-line:hover {
  background-color: #e2e8f0;
}

.current-line {
  background-color: #bfdbfe;
  font-weight: 600;
  transform: scale(1.02);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.section-header {
  font-weight: bold;
  color: #4b5563;
  margin-top: 12px;
  margin-bottom: 8px;
  font-size: 1.1em;
}
</style> -->