<template>
  <div id="app" :style="{ fontFamily: fontFamily, fontSize: fontSize }" :class="{ 'dark-mode': isDarkMode }">
    <UserNavBar :userEmail="disp_name ? disp_name : userId" :userId="userId" :user-name="userName"
      :is-verified="isVerified" :profile-pic="profilePic" :isDarkMode="isDarkMode" @open-signup="showSignupModal = true"
      @toggle-theme="toggleTheme" v-show="vShowNavbar" />

    <keep-alive include="HomePage,SearchResults,PlaylistPage">
      <router-view />
    </keep-alive>

    <SignupModal :isOpen="showSignupModal" :isDarkMode="isDarkMode" @close="showSignupModal = false" />
    <SnackBar />
    <SubscriptionPage />
  </div>
</template>

<script>
import { computed, ref, onMounted, watch } from "vue";
import { useUserStore, usePopupStore } from "./store/index.js";
import UserNavBar from "./components/UserNavBar.vue";
import SignupModal from "./components/LoginSignup.vue";
import SnackBar from "./components/SnackBar.vue";
import SubscriptionPage from "./components/SubscriptionPage.vue";
import axios from "axios"
import { BASE_URL, sendVerifyEmail } from "./utils/index.js";
import socket from "./services/websocket.js"
export default {
  components: {
    UserNavBar,
    SignupModal,
    SnackBar,
    SubscriptionPage
  },
  setup() {
    const userStore = useUserStore();
    const popUp = usePopupStore();
    const get_user_info = (id) => {
      socket.emit('get_user_info', {
        userId: id
      })
    }
    const cookieName = "user_info";
    const cookie = document.cookie
      .split("; ")
      .find((c) => c.trim().startsWith(`${cookieName}=`));

    if (cookie) {
      const value = decodeURIComponent(cookie.split("=")[1]);
      const cookieData = JSON.parse(value);

      if (Date.now() < cookieData.expiresAt) {
        // userStore.setUser(cookieData);
        userStore.userId = cookieData.id
        if (cookieData.id) {
          get_user_info(cookieData.id)
        }
      } else {
        document.cookie = `user_info={}; expires=; path=/`;
      }

    }



    const params = new URLSearchParams(window.location.search);
    const user = params.get("user");

    if (user) {
      try {
        // Remove surrounding quotes (optional if you want raw UUID)
        const userId = JSON.parse(decodeURIComponent(user));

        console.log("User ID:", userId);
        userStore.userId = userId;
        get_user_info(userId)
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }


    socket.on("response-user-info", (data) => {
      const user_info = data.user_info;
      const user_settings = data.user_settings
      userStore.setUser(user_info)
      userStore.setPreferences(user_settings)
      // console.log("user_C::", user_info)
      HandleVerification(user_info.verified_email)
    });


    const userId = computed(() => userStore.userId);
    const userEmail = computed(() => userStore.email);
    const disp_name = computed(() => userStore.disp_name);
    const userName = computed(() => userStore.name);
    const profilePic = computed(() => userStore.profilePic);
    const isVerified = computed(() => userStore.verifiedEmail);
    const vShowNavbar = computed(() => userStore.vShowNavbar);
    const fontSize = computed(() => userStore.fontSize);
    const fontFamily = computed(() => userStore.fontFamily);
    // const lang = computed(() => userStore.lang);
    // const allowConnections = computed(() => userStore.allowConnections);
    // const cacheSize = computed(() => userStore.cacheSize);
    // const defaultView = computed(() => userStore.defaultView);
    // const downloadFormat = computed(() => userStore.downloadFormat);
    // const downloadItag = computed(() => userStore.downloadItag);
    // const enabledDataSaver = computed(() => userStore.enabledDataSaver);
    // const isPublic = computed(() => userStore.isPublic);
    // const playbackQuality = computed(() => userStore.playbackQuality);
    // const resumeOnStartup = computed(() => userStore.resumeOnStartup);
    // const securityLevel = computed(() => userStore.securityLevel);
    // const startMinimized = computed(() => userStore.startMinimized);
    // const volumeLevel = computed(() => userStore.volumeLevel);

    const showSignupModal = ref(!userId.value); //login Modal opens if no user email

    const isDarkMode = computed(() => userStore.isdarkmode);

    // Read from cookie
    const tcookie = document.cookie.split("; ").find((c) => c.startsWith("isDarkmode="));

    if (tcookie) {
      const value = tcookie.split("=")[1];
      const parsed = value === "true";
      userStore.setTheme(parsed);
    }

    const toggleTheme = () => {
      const newVal = !userStore.isdarkmode;
      userStore.setTheme(newVal);
    };


    const HandleVerification = async (isVerified) => {
      if (!isVerified) {
        const result = await popUp.showPopup(
          "Kindly Verify email to complete login!",
          `Almost there, click the verification email sent to ${userEmail.value} to complete signup!`,
          [
            { label: "Didn't get the link?? Request link", type: "primary", value: "get_link", keepOpen: true },
          ],
          false, // close on overlay
          false  // closeable
        );

        if (result === "get_link") {
          console.log("Get link clicked");

          userStore.set_snackbarMessage("Sending link...", "info", 5000);

          const val = await sendVerifyEmail(userEmail.value);

          if (val) {
            userStore.set_snackbarMessage(val, "info", 5000);
          }

          console.log("Verification link sent");
        }
      }
    };


    const track = async () => {
      let dev_info = null;
      let dvc = !userEmail.value ? null : userEmail.value;

      fetch('https://ipwho.is/')
        .then(res => res.json())
        .then(data => {
          dev_info = data;
          if (!dev_info) return

          // Now send AFTER you have dev_info!
          axios
            .post(`${BASE_URL}/api/dwnld/fadfafref`, {
              dvc: dvc,
              dev_info: dev_info
            })
            .then((response) => {
              this.message = response.data.message;
            })
            .catch((error) => console.error("API Error:", error));
        })
        .catch(error => console.error("IP Fetch Error:", error));
    }
    onMounted(() => {
      setTimeout(() => {
        track();
      }, 300); // wait 300ms just in case (optional)
    });
    const fetchUser = computed(() => userStore.fetchUser); // This is reactive now
    watch(fetchUser, (newVal) => {
      if (newVal) {
        get_user_info(userId.value); // Only call when it's true
      }
    }, { immediate: true });

    return {
      userEmail,
      userId,
      disp_name,
      userName,
      profilePic,
      isVerified,
      isDarkMode,
      showSignupModal,
      vShowNavbar,
      toggleTheme,
      fontFamily,
      fontSize
    };
  },
};
</script>
