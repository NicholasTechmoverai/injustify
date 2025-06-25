export const BASE_URL = "https://dragon-brief-mayfly.ngrok-free.app";
// export const BASE_URL = "http://127.0.0.1:8000";


export const AUTH_WITH_GOOGLE = `${BASE_URL}/api/login/google`;
export const MANUAL_LOGIN = `${BASE_URL}/api/login`;
export const SIGN_UP = `${BASE_URL}/api/signup`;
export const SEND_EMAIL_RESET_CODES = `${BASE_URL}/api/send_email_reset_codes`;
export const VERIFY_CODES = `${BASE_URL}/api/verify_reset_codes`
export const RESET_PASSWORD = `${BASE_URL}/api/reset_email_password`

export const SUBSCRIPTIONS = {
    "free": {
        'MAX_DOWNLOADS': 15,
        'MAX_MIX_SONGS': 15,
        "MAX_MIX_DOWNLOADS": 1
    },
    "basic": {
        'MAX_DOWNLOADS': 45,
        'MAX_MIX_SONGS': 45,
        "MAX_MIX_DOWNLOADS": 3
    },
    "pro": {
        'MAX_DOWNLOADS': 100,
        'MAX_MIX_SONGS': 75,
        "MAX_MIX_DOWNLOADS": 10
    },
    "premium": {
        'MAX_DOWNLOADS': 200,
        'MAX_MIX_SONGS': 200,
        "MAX_MIX_DOWNLOADS": 30
    }
}


export function timeAgo(time) {
    const now = new Date();

    const postTime = new Date(time);
    const diffInSeconds = Math.floor((now - postTime) / 1000);
    //console.log(now , postTime)
    const intervals = [
        { label: "y", seconds: 31536000 },
        { label: "mon", seconds: 2592000 },
        { label: "d", seconds: 86400 },
        { label: "hr", seconds: 3600 },
        { label: "min", seconds: 60 },
    ];

    for (const interval of intervals) {
        const count = Math.floor(diffInSeconds / interval.seconds);
        if (count >= 1) {
            return `${count}${interval.label}${count > 1 ? "s" : ""} ago`;
        }
    }

    return "just now";
}

export function extractYouTubeID(url) {
    if (url.includes('https://')) {
        const match = url.match(/[?&]v=([^&]+)/);
        return match ? match[1] : null;  // Extracts video ID from YouTube URL
    }
    return url
}

export function getYouTubeThumbnails(url) {
    // Optimized regex to match YouTube video ID across all URL formats
    const regex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^/\n\s]+\/\S+\/|(?:v|e(?:mbed)?\/|.*[?&]v=))|youtu\.be\/|youtube\.com\/shorts\/)([^"&?/\s]{11})/;

    const match = url.match(regex);
    if (match && match[1]) {
        return `https://img.youtube.com/vi/${match[1]}/hqdefault.jpg`;
    }

    console.warn(`Invalid YouTube URL: ${url}`);
    return null;
}


let spotifyToken = null;
let tokenExpiration = 0; // Time when token expires

async function getSpotifyAccessToken() {
    const clientId = "ba5ea23c58884dcba54f767875aafcf1";     // Replace with your actual Client ID
    const clientSecret = "15f4c324944b47e88e41325efbce64c7"; // Replace with your actual Client Secret

    const credentials = `${clientId}:${clientSecret}`;
    const encodedCredentials = btoa(credentials);

    const response = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            "Authorization": `Basic ${encodedCredentials}`,
        },
        body: "grant_type=client_credentials",
    });

    const data = await response.json();
    if (data.access_token) {
        spotifyToken = data.access_token;
        tokenExpiration = Date.now() + data.expires_in * 1000;
        return spotifyToken;
    } else {
        console.error("Failed to fetch Spotify access token");
        return null;
    }
}

// Function to get a valid token (refreshes if expired)
async function getValidSpotifyToken() {
    if (!spotifyToken || Date.now() >= tokenExpiration) {
        console.log("Fetching new Spotify token...");
        return await getSpotifyAccessToken();
    }
    return spotifyToken;
}

// Function to get Spotify thumbnail
export async function getSpotifyThumbnail(songUrl) {
    const trackId = songUrl.split("track/")[1]?.split("?")[0]; // Extract track ID
    if (!trackId) {
        console.error("Invalid Spotify URL");
        return null;
    }

    const token = await getValidSpotifyToken();

    const response = await fetch(`https://api.spotify.com/v1/tracks/${trackId}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const data = await response.json();
    return data.album?.images[0]?.url || null; // Get the highest-quality image
}


export function convertResolution(res) {
    if (!res) return 'Unknown';

    // If the resolution is 'audio only', return 'audio'
    if (res === 'audio only') {
        return 'audio';
    }

    // Extract width and height from the resolution string (e.g., "1920x1080")
    const [width, height] = res.split('x').map(Number);

    if (width) console.log('')

    if (isNaN(height)) return res;

    // Map common resolutions to labels based on the height
    switch (height) {
        case 144: return '144p';
        case 240: return '240p';
        case 360: return '360p';
        case 480: return '480p';
        case 720: return '720p';
        case 1080: return '1080p';
        case 1440: return '2K';  // For 2K resolution
        case 2160: return '4K';  // For 4K resolution
        case 4320: return '8K';  // For 8K resolution
        default:
            if (height > 2160) return '8K';  // For anything higher than 4K
            return res;  // For unsupported resolutions
    }
}



export function showfileicon(state) {
    if (!state) return '';

    if (state.includes('p') || state.includes('K')) {
        if (state === '8K') {
            return new URL('../assets/8k-img.png', import.meta.url).href;
        }
        if (state === '4K') {
            return new URL('../assets/4k-img.png', import.meta.url).href;
        }
        if (state === '2K') {
            return new URL('../assets/2k-img.png', import.meta.url).href;
        }
        if (state === '1080p') {
            return new URL('../assets/fhd-img.jpg', import.meta.url).href;
        }
        if (state === '720p') {
            return new URL('../assets/hd-img.png', import.meta.url).href;
        }
        if (state === '480p' || state === '360p' || state === '240p' || state === '144p') {
            return new URL('../assets/vid-img.png', import.meta.url).href;
        }
        return new URL('../assets/vid-img.png', import.meta.url).href;
    }

    if (state === 'audio') {
        return new URL('../assets/icon1.png', import.meta.url).href;
    }

    return new URL("../assets/injustify.png", import.meta.url).href;
}


export function formatDate(dateString) {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
}


export function generateUUID() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}


// utils/notifications.js
export function requestNotificationPermission() {
    if ("Notification" in window) {
        Notification.requestPermission().then((permission) => {
            console.log("Notification permission:", permission);
        });
    }
}

export function showNotification(title, options = {}) {
    if (Notification.permission === "granted") {
        new Notification(title, options);
    }
}



{/* <script>
import { requestNotificationPermission, showNotification } from '@/utils/notifications.js'

export default {
  mounted() {
    requestNotificationPermission()
  },
  methods: {
    notifyUser() {
      showNotification("Hello!", {
        body: "This is a desktop notification",
        icon: "/logo.png"
      })
    }
  }
}
</script>

<template>
  <button @click="notifyUser">Notify</button>
</template>
 */}


export function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}


export async function sendVerifyEmail(email) {
  let resp = null;

  try {
    const response = await fetch(`${BASE_URL}/api/trigger_verify_email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.detail || 'Failed to send verification link.');
    }

     
    if(data.success){
        resp = "link sent suceesfully, check your emails!"
    }
  } catch (err) {
    console.error(err);
    resp = err.message || 'Failed to send verification link.';
  }

  return resp;
}
