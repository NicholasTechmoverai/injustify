import { defineStore } from 'pinia';
import unknownProfilePic from '../assets/unknown-filef.png';

export const useUserStore = defineStore('user', {
  state: () => ({
    email: 'injustify@gamil.com',
    name: 'injustify',
    userId: null,
    profilePic: unknownProfilePic,
    vShowNavbar: true,
    SnackBar_messages: [],
    fetchUser: false,
    showSubscriptionCards: false,
    paymentMethod:'paystack',
  }),
  actions: {
    setShowNavbar(s) {
      this.vShowNavbar = s;
    },
    setUser(data) {
      this.email = data.email;
      this.userId = data.id;
      this.name = data.name;
      this.profilePic = data.picture;
      this.verifiedEmail = data.verified_email;
      this.created_at = data.created_at;
      this.disp_name = data.disp_name;

      //store the login user in cookie for 3days
      const dataWithExpiry = {
        id: this.userId,
        expiresAt: Date.now() + 3 * 24 * 60 * 60 * 1000
      };

      const jsonString = encodeURIComponent(JSON.stringify(dataWithExpiry));
      const expires = new Date(dataWithExpiry.expiresAt).toUTCString();

      document.cookie = `user_info=${jsonString}; expires=${expires}; path=/`;

    },
    setPreferences(data) {
      this.allowConnections = data.allowConnections;
      this.cacheSize = data.cache_size;
      this.defaultView = data.default_view;
      this.downloadFormat = data.download_format;
      this.downloadItag = data.download_itag;
      this.enabledDataSaver = data.enabled_data_saver;
      this.fontSize = data.font_size;
      this.isdarkmode = data.isDarkmode;
      this.isPublic = data.is_public;
      this.lang = data.lang;
      this.playbackQuality = data.playback_quality;
      this.resumeOnStartup = data.resume_on_startup;
      this.securityLevel = data.security_level;
      this.startMinimized = data.start_minimized;
      this.fontFamily = data.user_font;
      this.volumeLevel = data.volume_level;
      this.subscription = data.subscription ? data.subscription : 'free';
    },
    clearUser() {
      this.email = '';
      this.name = '';
      this.profilePic = '';
      this.verifiedEmail = false;
      this.userId = null;
      this.created_at = '';
      this.disp_name = null;
      this.allowConnections = '';
      this.cacheSize = '';
      this.defaultView = '';
      this.downloadFormat = 'mp4';
      this.downloadItag = '';
      this.enabledDataSaver = '';
      this.fontSize = '14px';
      this.isdarkmode = false;
      this.isPublic = true;
      this.lang = 'en';
      this.playbackQuality = '';
      this.resumeOnStartup = '';
      this.securityLevel = '';
      this.startMinimized = '';
      this.fontFamily = 'Arial';
      this.volumeLevel = 20;
    },
    setActivePlaylist(playlistId) {
      this.activePlaylistId = playlistId;
    },

    //handle playlist, add song, remove song, etc. methods here
    setPlaylistSongs(songs, playlistName) {
      this.songs = null || [songs];
      this.playlistName = playlistName;

    },

    setMainContainerWidthMarginLeft(val) {
      this.iscollapsedBig = val;
    },
    //set theme
    setTheme(val) {
      this.isdarkmode = val;
      document.cookie = `isDarkmode=${val}; path=/; max-age=31536000`; // store in cookie
    },
    //set the state of any song that is about to download
    set_isAboutToDownload(val) {
      this.isAboutToDownload = val;
    },
    set_streamloading(val) {
      this.streamloading = val;
    },
    set_DownloadFileCredential(info) {
      this.downloadFileCredential = info;
      console.log(this.downloadFileCredential);

    },
    set_snackbarMessage(message, type = "info", tm = 10000) {
      const id = Date.now();
      this.SnackBar_messages.push({ id, message, type });

      setTimeout(() => {
        this.delete_snackBarMessage(id);
      }, tm);
    },

    delete_snackBarMessage(id) {
      this.SnackBar_messages = this.SnackBar_messages.filter(msg => msg.id !== id);
    },
    removeSnackbar (id) {
      this.SnackBar_messages = this.SnackBar_messages.filter(msg => msg.id !== id);
    }

  }
});



let _resolver = null;

export const usePopupStore = defineStore('popup', {
  state: () => ({
    isVisible: false,
    title: 'Attention Needed',
    message: 'Hello',
    actions: [
      { label: 'OK', type: 'primary', value: 'ok' },
      { label: 'Cancel', type: 'secondary', value: 'cancel' }
    ],
    closeOnOverlayClick: true,
    close_able:true
  }),

  actions: {
    showPopup(title, message, actions, close_on_overlay = true,close_able = true) {
      return new Promise((resolve) => {
        _resolver = resolve; // store the resolver
        this.title = title || this.title;
        this.message = message;
        this.actions = actions || this.actions;
        this.closeOnOverlayClick = close_on_overlay;
        this.isVisible = true;
        this.close_able=close_able
      });
    },

    hidePopup(response = null,keepOpen= false) {
      if (!keepOpen) {
        this.isVisible = false;
      }
      if (_resolver) {
        _resolver(response);
        _resolver = null;
      }
    }
  }
});
