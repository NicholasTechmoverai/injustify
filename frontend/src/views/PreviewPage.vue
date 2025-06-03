<template>
  <div :class="[
    'fixed bottom-0 overflow-x-hidden top-auto max-w-[800px] inset-0 z-50 flex flex-col transition-all duration-300 overflow-hidden',
    theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900',
    isFullScreen ? '' : 'rounded-xl shadow-2xl  mx-auto my-8 max-h-[90vh]',
    isMinimized ? 'w-96 h-24 bottom-0 right-0 left-auto top-auto' : '',
    'sm:max-h-[70vh]' // Added for small screens
  ]" :style="{
    width: isMinimized ? '' : 'calc(100% - 2rem)',
    height: isMinimized ? '' : isFullScreen ? '100%' : '70vh',
    margin: isFullScreen ? '0' : '1rem auto'
  }">
    <!-- Header with controls -->
    <div :class="[
      'flex justify-between items-center p-3 border-b',
      theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
      isMinimized ? 'p-2' : ''
    ]">
      <h2 :class="[
        'font-bold truncate',
        isMinimized ? 'text-sm' : 'text-lg sm:text-xl'
      ]">
        {{ songData.title || 'Music Player' }}
      </h2>
      <div class="flex gap-2">
        <button @click="toggleMinimize" :class="[
          'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
        ]">
          <i :class="isMinimized ? 'fas fa-expand text-sm' : 'fas fa-compress-alt'"></i>
        </button>
        <button @click="toggleFullScreen" :class="[
          'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
        ]">
          <i :class="isFullScreen ? 'fas fa-compress' : 'fas fa-expand'"></i>
        </button>
        <button @click="toggleTheme" :class="[
          'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
          theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'
        ]">
          <i :class="theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon'"></i>
        </button>
        <button @click="closePlayer" :class="[
          'w-8 h-8 rounded-full flex items-center justify-center transition-colors',
          theme === 'dark' ? 'hover:bg-red-900' : 'hover:bg-red-100',
          theme === 'dark' ? 'text-red-400' : 'text-red-600'
        ]">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>

    <!-- Main content -->
    <div :class="[
      'flex-1 overflow-auto flex',
      isMinimized ? 'flex-row p-2' : 'flex-col p-4 md:flex-row'
    ]" @click="isMinimized ? toggleMinimize() : null">
      <!-- Media section -->
      <div :class="[
        'flex',
        isMinimized ? 'flex-row items-center gap-3' : 'flex-col gap-4',
        isMinimized ? 'flex-none' : 'flex-1'
      ]">
        <div :class="[
          'relative overflow-hidden shadow-lg',
          theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200',
          isMinimized ? 'w-14 h-14 rounded-lg' : 'w-full aspect-video rounded-xl'
        ]">
          <div v-if="isYoutube" class="w-full h-full">
            <iframe :src="'https://www.youtube.com/embed/' + youtubeVideoId + '?autoplay=1'" class="w-full h-full"
              frameborder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen>
            </iframe>
          </div>

          <div v-else-if="isSpotify" class="w-full h-full">
            <iframe :src="'https://open.spotify.com/embed/track/' + spotifyTrackId" class="w-full h-full"
              frameborder="0" allowtransparency="true" allow="encrypted-media">
            </iframe>
          </div>

          <div v-else :class="[
            'w-full h-full flex flex-col items-center justify-center p-4',
            theme === 'dark' ? 'bg-gray-800' : 'bg-gray-200'
          ]">
            <img :src="thumbnailUrl" alt="Song thumbnail" class="w-full h-4/5 object-cover" v-if="thumbnailUrl">
            <audio :key="audioStreamUrl" ref="audio" controls autoplay class="w-full mt-4" @ended="onAudioEnded"
              @error="onAudioError">
              <source :src="audioStreamUrl" type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
            <p v-if="!thumbnailUrl" class="text-gray-500 text-sm">No thumbnail available</p>
          </div>
        </div>

        <div v-if="!isMinimized" class="flex flex-col gap-1">
          <h2 class="text-xl sm:text-2xl font-bold truncate">{{ songData.title || 'Unknown Title' }}</h2>
          <p :class="[
            'text-base sm:text-lg',
            theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
          ]">
            {{ songData.artist || 'Unknown Artist' }}
          </p>
          <p :class="[
            'text-xs sm:text-sm',
            theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
          ]">
            {{ formatDate(songData.releaseDate) || 'Release date unknown' }}
          </p>
        </div>
      </div>

      <!-- Analytics section -->
      <div v-if="!isMinimized" :class="[
        'mt-4 md:mt-0 md:ml-4',
        isFullScreen ? 'w-1/3' : 'w-full md:w-1/2 '
      ]">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full [&_div]:min-w-[130px] [&_div]:overflow-hidden">
          <!-- Total Views -->
          <div :class="[
            'p-3 sm:p-4 rounded-xl shadow',
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          ]">
            <h3 class="text-base sm:text-lg font-semibold mb-2">Total Views</h3>
            <p :class="[
              'text-2xl sm:text-3xl font-bold mb-2',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            ]">
              {{ formatNumber(totalViews) }}
            </p>
            <div class="flex flex-wrap gap-1 sm:gap-2 mt-2">
              <span v-if="songData.youtubeViews" :class="[
                'text-xs px-2 py-1 rounded-full flex items-center gap-1',
                theme === 'dark' ? 'bg-red-900 bg-opacity-30 text-red-200' : 'bg-red-100 text-red-800'
              ]">
                <i class="fab fa-youtube"></i> {{ formatNumber(songData.youtubeViews) }}
              </span>
              <span v-if="songData.spotifyViews" :class="[
                'text-xs px-2 py-1 rounded-full flex items-center gap-1',
                theme === 'dark' ? 'bg-green-900 bg-opacity-30 text-green-200' : 'bg-green-100 text-green-800'
              ]">
                <i class="fab fa-spotify"></i> {{ formatNumber(songData.spotifyViews) }}
              </span>
              <span v-if="songData.localViews" :class="[
                'text-xs px-2 py-1 rounded-full flex items-center gap-1',
                theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'
              ]">
                <i class="fas fa-music"></i> {{ formatNumber(songData.localViews) }}
              </span>
            </div>
          </div>

          <!-- Total Likes -->
          <div :class="[
            'p-3 sm:p-4 rounded-xl shadow',
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          ]">
            <h3 class="text-base sm:text-lg font-semibold mb-2">Total Likes</h3>
            <p :class="[
              'text-2xl sm:text-3xl font-bold mb-2',
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            ]">
              {{ formatNumber(totalLikes) }}
            </p>
            <div class="flex flex-wrap gap-1 sm:gap-2 mt-2">
              <span v-if="songData.youtubeLikes" :class="[
                'text-xs px-2 py-1 rounded-full flex items-center gap-1',
                theme === 'dark' ? 'bg-red-900 bg-opacity-30 text-red-200' : 'bg-red-100 text-red-800'
              ]">
                <i class="fab fa-youtube"></i> {{ formatNumber(songData.youtubeLikes) }}
              </span>
              <span v-if="songData.spotifyLikes" :class="[
                'text-xs px-2 py-1 rounded-full flex items-center gap-1',
                theme === 'dark' ? 'bg-green-900 bg-opacity-30 text-green-200' : 'bg-green-100 text-green-800'
              ]">
                <i class="fab fa-spotify"></i> {{ formatNumber(songData.spotifyLikes) }}
              </span>
              <span v-if="songData.localLikes" :class="[
                'text-xs px-2 py-1 rounded-full flex items-center gap-1',
                theme === 'dark' ? 'bg-gray-700 text-gray-200' : 'bg-gray-200 text-gray-800'
              ]">
                <i class="fas fa-music"></i> {{ formatNumber(songData.localLikes) }}
              </span>
            </div>
          </div>

          <!-- Platform Distribution -->
          <div :class="[
            'p-3 sm:p-4 rounded-xl shadow',
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          ]">
            <h3 class="text-base sm:text-lg font-semibold mb-2">Platform Distribution</h3>
            <div class="chart-container h-32 sm:h-40">
              <canvas ref="pieChartCanvas"></canvas>
            </div>
          </div>

          <!-- Yearly Performance -->
          <div :class="[
            'p-3 sm:p-4 rounded-xl shadow',
            theme === 'dark' ? 'bg-gray-800' : 'bg-white'
          ]">
            <h3 class="text-base sm:text-lg font-semibold mb-2">Yearly Performance</h3>
            <div class="chart-container h-32 sm:h-40">
              <canvas ref="barChartCanvas"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import Chart from 'chart.js/auto';

export default {
  name: 'MusicPlayerDashboard',
  data() {
    return {
      audioStreamUrl: null,
      isFullScreen: false,
      isMinimized: false,
      theme: 'dark',
      songData: {
        title: '',
        artist: '',
        releaseDate: '',
        // Platform specific data
        youtubeViews: 0,
        youtubeLikes: 0,
        spotifyViews: 0,
        spotifyLikes: 0,
        localViews: 0,
        localLikes: 0,
        // Yearly data by platform
        yearlyData: {
          youtube: {},
          spotify: {},
          local: {}
        }
      },
      pieChart: null,
      barChart: null
    };
  },
  computed: {
    url() {
      return this.$route.query.url || "";
    },
    isYoutube() {
      return this.url.includes('youtube.com') || this.url.includes('youtu.be');
    },
    isSpotify() {
      return this.url.includes('spotify.com');
    },
    isLocal() {
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/.test(this.url);
    },
    youtubeVideoId() {
      if (!this.isYoutube) return '';
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
      const match = this.url.match(regExp);
      return (match && match[2].length === 11) ? match[2] : '';
    },
    spotifyTrackId() {
      if (!this.isSpotify) return '';
      const parts = this.url.split('/');
      return parts[parts.length - 1];
    },
    audioStreamUrl() {
      return this.isLocal ? `http://127.0.0.1:8000/api/stream/${this.url}` : '';
    },
    thumbnailUrl() {
      const id = this.url.replace(/-/g, "");
      return this.isLocal ? `http://127.0.0.1:8000/media/thumbnails/_th_${id}.jpg` : '';
    },





    totalViews() {
      return (this.songData.youtubeViews || 0) +
        (this.songData.spotifyViews || 0) +
        (this.songData.localViews || 0);
    },
    totalLikes() {
      return (this.songData.youtubeLikes || 0) +
        (this.songData.spotifyLikes || 0) +
        (this.songData.localLikes || 0);
    },
    platformDistribution() {
      return {
        youtube: this.songData.youtubeViews || 0,
        spotify: this.songData.spotifyViews || 0,
        local: this.songData.localViews || 0
      };
    }
  },
  methods: {
    updateAudioSource(url) {
      const audio = this.$refs.audio;
      if (!url) return;
      if (audio) {
        audio.src = url;
        audio.load();
        audio.play();
      }
    },
    clearAudioSource() {
      const audio = this.$refs.audio;
      if (audio) {
        audio.pause();
        audio.src = "";
      }
    },
    toggleFullScreen() {
      this.isFullScreen = !this.isFullScreen;
      this.isMinimized = false;
    },
    toggleMinimize() {
      this.isMinimized = !this.isMinimized;
      if (this.isMinimized) {
        this.isFullScreen = false;
      }
    },
    toggleTheme() {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      this.renderCharts();
    },
    closePlayer() {
      const from = this.$route.query.from;

      if (from) {
        this.$router.replace(from);
      } else {
        this.$router.replace({ path: '/' });
      }
    },
    formatNumber(num) {
      if (!num) return '0';
      return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    formatDate(dateString) {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    },
    fetchSongData() {
      // Mock data - replace with actual API calls
      if (this.isYoutube) {
        this.songData = {
          title: 'Popular YouTube Song',
          artist: 'Famous Artist',
          releaseDate: '2022-05-15',
          youtubeViews: 1250000,
          youtubeLikes: 45000,
          spotifyViews: 320000,
          spotifyLikes: 18000,
          localViews: 12000,
          localLikes: 450,
          yearlyData: {
            youtube: {
              '2022': 250000,
              '2023': 600000,
              '2024': 350000,
              '2025': 50000
            },
            spotify: {
              '2022': 50000,
              '2023': 150000,
              '2024': 100000,
              '2025': 20000
            },
            local: {
              '2023': 8000,
              '2024': 4000
            }
          }
        };
      } else if (this.isSpotify) {
        this.songData = {
          title: 'Trending Spotify Track',
          artist: 'Popular Band',
          releaseDate: '2021-11-30',
          youtubeViews: 420000,
          youtubeLikes: 15000,
          spotifyViews: 850000,
          spotifyLikes: 32000,
          localViews: 8000,
          localLikes: 300,
          yearlyData: {
            youtube: {
              '2022': 100000,
              '2023': 200000,
              '2024': 100000,
              '2025': 20000
            },
            spotify: {
              '2021': 50000,
              '2022': 300000,
              '2023': 350000,
              '2024': 150000
            },
            local: {
              '2023': 5000,
              '2024': 3000
            }
          }
        };
      } else if (this.isLocal) {
        this.songData = {
          title: 'Local Audio File',
          artist: 'Independent Artist',
          releaseDate: '2023-02-20',
          youtubeViews: 0,
          youtubeLikes: 0,
          spotifyViews: 0,
          spotifyLikes: 0,
          localViews: 12000,
          localLikes: 450,
          yearlyData: {
            local: {
              '2023': 8000,
              '2024': 4000
            }
          }
        };
      }

      this.renderCharts();
    },
    renderCharts() {
      this.renderPieChart();
      this.renderBarChart();
    },
    renderPieChart() {
      if (this.pieChart) {
        this.pieChart.destroy();
      }

      const ctx = this.$refs.pieChartCanvas;
      if (!ctx) return;

      const data = {
        labels: ['YouTube', 'Spotify', 'Local'],
        datasets: [{
          data: [this.songData.youtubeViews, this.songData.spotifyViews, this.songData.localViews],
          backgroundColor: [
            '#FF0000', // YouTube red
            '#1DB954', // Spotify green
            '#6C757D'  // Local gray
          ],
          borderColor: this.theme === 'dark' ? '#333' : '#fff',
          borderWidth: 1
        }]
      };

      this.pieChart = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: this.theme === 'dark' ? '#fff' : '#333',
                font: {
                  size: 12
                }
              }
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  const label = context.label || '';
                  const value = context.raw || 0;
                  const total = context.dataset.data.reduce((a, b) => a + b, 0);
                  const percentage = Math.round((value / total) * 100);
                  return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                }
              }
            }
          }
        }
      });
    },
    renderBarChart() {
      if (this.barChart) {
        this.barChart.destroy();
      }

      const ctx = this.$refs.barChartCanvas;
      if (!ctx) return;

      // Get all years from all platforms
      const allYears = new Set();
      Object.values(this.songData.yearlyData).forEach(platformData => {
        Object.keys(platformData).forEach(year => allYears.add(year));
      });
      const sortedYears = Array.from(allYears).sort();

      const datasets = [];
      if (this.songData.youtubeViews > 0) {
        datasets.push({
          label: 'YouTube',
          data: sortedYears.map(year => this.songData.yearlyData.youtube[year] || 0),
          backgroundColor: 'rgba(255, 0, 0, 0.7)',
          borderColor: 'rgba(255, 0, 0, 1)',
          borderWidth: 1
        });
      }

      if (this.songData.spotifyViews > 0) {
        datasets.push({
          label: 'Spotify',
          data: sortedYears.map(year => this.songData.yearlyData.spotify[year] || 0),
          backgroundColor: 'rgba(29, 185, 84, 0.7)',
          borderColor: 'rgba(29, 185, 84, 1)',
          borderWidth: 1
        });
      }

      if (this.songData.localViews > 0) {
        datasets.push({
          label: 'Local',
          data: sortedYears.map(year => this.songData.yearlyData.local[year] || 0),
          backgroundColor: 'rgba(108, 117, 125, 0.7)',
          borderColor: 'rgba(108, 117, 125, 1)',
          borderWidth: 1
        });
      }

      this.barChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: sortedYears,
          datasets: datasets
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                color: this.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                color: this.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)',
                callback: function (value) {
                  if (value >= 1000000) {
                    return (value / 1000000).toFixed(1) + 'M';
                  }
                  if (value >= 1000) {
                    return (value / 1000).toFixed(1) + 'K';
                  }
                  return value;
                }
              }
            },
            x: {
              grid: {
                color: this.theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
              },
              ticks: {
                color: this.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
              }
            }
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: {
                color: this.theme === 'dark' ? 'rgba(255, 255, 255, 0.7)' : 'rgba(0, 0, 0, 0.7)'
              }
            },
            tooltip: {
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || '';
                  if (label) {
                    label += ': ';
                  }
                  label += context.raw.toLocaleString();
                  return label;
                }
              }
            }
          }
        }
      });
    }
  },
  mounted() {
    this.fetchSongData();
  },
  watch: {
    url() {
      this.fetchSongData();
      if (this.isLocal) {
        this.updateAudioSource(this.audioStreamUrl);
      } else {
        this.clearAudioSource();
      }
    },
    theme() {
      this.renderCharts();
    }
  }
};
</script>
