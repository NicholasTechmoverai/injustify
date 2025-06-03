<template>
  <div v-if="showSubscriptionCards" :class="['app-container', { 'dark-mode-sb': isDarkMode }]">
    <div id="modal_header">
      <h1 @click="reloadPage" class="injustifyLogoRIMG"><img :src="injustifyIcon" alt=""></h1>
      <button class="closeM0dal" @click="closeModal">
        <font-awesome-icon icon="close" /> Maybe later
      </button>
    </div>

    <div class="billing-toggle-container">
      <div class="billing-toggle">
        <span :class="{ active: !yearlyBilling }">Monthly</span>
        <label class="switch">
          <input type="checkbox" v-model="yearlyBilling">
          <span class="slider round"></span>
        </label>
        <span :class="{ active: yearlyBilling }">Yearly</span>
        <div class="discount-badge" v-if="yearlyBilling">Save 20%</div>
      </div>
    </div>

    <div class="subscription-cards">
      <div v-for="(plan, index) in computedPlans" :key="index" class="card"
        :class="[plan.popular ? 'popular' : '', plan.name.toLowerCase()]">
        <div class="card-corner"></div>
        <div class="card-ribbon" v-if="plan.popular">Most Popular</div>

        <div class="card-header">
          <div class="plan-icon">
            <font-awesome-icon :icon="plan.icon" />
          </div>
          <h3>{{ plan.name }}</h3>
          <div class="price-savings" v-if="yearlyBilling && plan.yearlySavings">
            Save {{ plan.yearlySavings }}
          </div>
        </div>

        <div class="card-price">
          <span class="price">{{ yearlyBilling ? plan.yearlyPrice : plan.price }}</span>
          <span class="period">{{ yearlyBilling ? 'per year' : plan.period }}</span>
          <div class="equivalent" v-if="yearlyBilling">
            {{ plan.equivalentMonthly }}
          </div>
        </div>

        <ul class="features">
          <li v-for="(feature, i) in plan.features" :key="i">
            <span class="icon">
              <font-awesome-icon icon="check" />
            </span>
            {{ feature }}
          </li>
        </ul>

        <button :disabled="subscribingLoading" class="select-button" :class="{ primary: plan.popular }"
          @click="selectPlan(plan)">
          <span v-if="!subscribingLoading">{{ plan.buttonText }}</span>
          <span v-if="subscribingLoading" class="button-icon">
            precessing...<font-awesome-icon icon="sun" spin :size="'md'" />
          </span>
          <font-awesome-icon icon="arrow-right" class="button-icon" />
        </button>
      </div>
    </div>
  </div>
</template>



<script>
import { library } from '@fortawesome/fontawesome-svg-core'
import { faCheck, faArrowRight, faMoon, faSun, faGem, faRocket, faCrown, faClose } from '@fortawesome/free-solid-svg-icons'
import { faStar } from '@fortawesome/free-regular-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, onMounted, ref } from "vue";
import { useUserStore, usePopupStore } from "@/store/index.js";
import injustifyIcon from "../assets/injustify.png";
import axios from 'axios';
import { BASE_URL } from "@/utils/index.js";
// import { createFFmpeg, fetchFile } from '@ffmpeg/ffmpeg';


library.add(faCheck, faArrowRight, faMoon, faSun, faGem, faStar, faRocket, faCrown, faClose)

export default {
  components: {
    FontAwesomeIcon
  },
  setup() {
    const userStore = useUserStore();
    const yearlyBilling = ref(false);
    const subscribingLoading = ref(false);
    const popUp = usePopupStore()

    // const subscriptionPlans = [
    //   {
    //     name: "Free",
    //     icon: "gem",
    //     price: "$0",
    //     yearlyPrice: "$0",
    //     period: "per month",
    //     equivalentMonthly: "",
    //     features: [
    //       "Basic access to platform",
    //       "Limited song features and tools",
    //       "Community support only",
    //       "Audio downloads only (no video)",
    //       "Up to 15 song downloads per day",
    //       "1 mix download per day (up to 50 songs)",
    //       "Controlled/licensed songs only"
    //     ],
    //     buttonText: "Get Started Free",
    //     popular: false,
    //     yearlySavings: ""
    //   },
    //   {
    //     name: "Basic",
    //     icon: "star",
    //     price: "$9",
    //     yearlyPrice: "$86", // 20% discount
    //     period: "per month",
    //     equivalentMonthly: "$7.17/month billed annually",
    //     features: [
    //       "Includes all Free plan features",
    //       "Faster download speed",
    //       "Priority customer support",
    //       "Audio formats up to 720p quality",
    //       "Up to 45 song downloads per day",
    //       "3 mix downloads per day",
    //       "Access to all downloadable songs",
    //       "Basic analytics and insights"
    //     ],
    //     buttonText: "Choose Basic",
    //     popular: false,
    //     yearlySavings: "Save $22/year"
    //   },
    //   {
    //     name: "Pro",
    //     icon: "rocket",
    //     price: "$29",
    //     yearlyPrice: "$278", // 20% discount
    //     period: "per month",
    //     equivalentMonthly: "$23.17/month billed annually",
    //     features: [
    //       "Includes all Basic plan features",
    //       "Advanced analytics and performance tracking",
    //       "Audio formats up to 2K resolution",
    //       "Up to 100 song downloads per day",
    //       "7 mix downloads per day",
    //       "Access to all songs and formats"
    //     ],
    //     buttonText: "Choose Pro",
    //     popular: true,
    //     yearlySavings: "Save $70/year"
    //   },
    //   {
    //     name: "Premium",
    //     icon: "crown",
    //     price: "$59",
    //     yearlyPrice: "$566", // 20% discount
    //     period: "per month",
    //     equivalentMonthly: "$47.17/month billed annually",
    //     features: [
    //       "Includes all Pro plan features",
    //       "Audio and video formats up to 8K quality",
    //       "Unlimited song downloads per day",
    //       "Unlimited mix downloads per day",
    //       "Download music directly from Spotify",
    //       "Full access with zero limitations"
    //     ],
    //     buttonText: "Unlock Premium",
    //     popular: false,
    //     yearlySavings: "Save $142/year"
    //   }
    // ];
    const subscriptionPlans = ref([]);



    // const ffmpeg = createFFmpeg({
    //   log: true,
    //   corePath: 'https://unpkg.com/@ffmpeg/core@0.11.0/dist/ffmpeg-core.js',
    // });

    // const addMetadata = async (inputFile, metadata, coverImage) => {
    //   await ffmpeg.load();

    //   ffmpeg.FS('writeFile', 'input.mp3', await fetchFile(inputFile));
    //   ffmpeg.FS('writeFile', 'cover.jpg', await fetchFile(coverImage));

    //   await ffmpeg.run(
    //     '-i', 'input.mp3',
    //     '-i', 'cover.jpg',
    //     '-map', '0',
    //     '-map', '1',
    //     '-c', 'copy',
    //     '-metadata', `title=${metadata.title}`,
    //     '-metadata', `artist=${metadata.artist}`,
    //     '-metadata', `album=${metadata.album}`,
    //     '-metadata', `date=${metadata.year}`,
    //     '-disposition:v', 'attached_pic',
    //     'output.m4a'
    //   );

    //   const data = ffmpeg.FS('readFile', 'output.m4a');
    //   return new Blob([data.buffer], { type: 'audio/mp4' });
    // };

    // // Delay execution by 3 seconds
    // setTimeout(() => {
    //   addMetadata(
    //     "BlocBoy JB, Drake - Look Alive (feat. Drake).mp3", // must be a File/Blob/URL
    //     {
    //       title: "Look Alive",
    //       artist: "BlocBoy JB, Drake",
    //       album: "Look Alive",
    //       year: "2018"
    //     },
    //     "bg2.jpg" // should be a path that browser can fetch
    //   ).then(blob => {
    //     const url = URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = 'output.m4a';
    //     document.body.appendChild(a);
    //     a.click();
    //     document.body.removeChild(a);
    //     URL.revokeObjectURL(url);
    //   }).catch(err => console.error("Error adding metadata:", err));
    // }, 3000);


    const computedPlans = computed(() => {
      return subscriptionPlans.value.map(plan => {
        return {
          ...plan,
          buttonText: yearlyBilling.value ? 'Get Yearly Plan' : plan.buttonText
        };
      });
    });

    const closeModal = () => {
      userStore.showSubscriptionCards = false;
    };

    const reloadPage = () => {
      window.location.reload();
    };


    const selectPlan = async (plan) => {
      if (!plan || !plan.name) {
        console.error("Invalid plan selected");
        return;
      }

      const billingCycle = yearlyBilling.value ? 'yearly' : 'monthly';

      const result = await popUp.showPopup(
        "Choose Payment Method",
        `You selected the ${plan.name} (${billingCycle}) plan.\nChoose how you want to pay:`,
        [
          { label: "💳 Upgrade with Stripe (Card)", type: "primary", value: "stripe" },
          { label: "📱 Upgrade with Paystack (M-Pesa/Card)", type: "secondary", value: "paystack" }
        ],
        false,//close on overlay
        true//closeable
      );

      switch (result) {
        case "stripe":
          try {
            await pay(plan);
          } catch (err) {
            console.error("Stripe payment failed:", err);
          }
          break;

        case "paystack":
          try {
            await payWithPaystack(plan);
          } catch (err) {
            console.error("Paystack payment failed:", err);
          }
          break;

        default:
          console.warn("No valid payment method selected or user cancelled");
      }
    };




    const get_subscriptions = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/sub/subscription-plans`);
        if (response && response.data) {
          subscriptionPlans.value = response.data;
        }
      } catch (err) {
        console.error("Failed to fetch subscription plans:", err);
      }
    };

    onMounted(get_subscriptions);

const pay = async (selectedPlan) => {
  subscribingLoading.value = true;

  try {
    console.log("Importing Stripe...");
    const { loadStripe } = await import('@stripe/stripe-js');

    if (!loadStripe) {
      throw new Error("Stripe SDK failed to import.");
    }

    const stripe = await loadStripe("pk_test_51RSQLjR8BZxwkVNTkwEh2qPjzzZGxRHxem2q0Ou4XULLrDAk27E2CRfQGU0elACkv3VuRslAM4rfl0eqmJn2eNzC0075YD2vse");

    if (!stripe) {
      throw new Error("Stripe failed to initialize. Check your publishable key.");
    }

    const res = await axios.post(`${BASE_URL}/api/sub/create-checkout-session`, {
      plan_name: selectedPlan.name,
      billing_cycle: yearlyBilling.value,
      user_id: userStore.userId
    });

    if (!res?.data?.id) {
      throw new Error("No session ID returned from backend.");
    }

    const result = await stripe.redirectToCheckout({ sessionId: res.data.id });

    if (result.error) {
      console.error("Stripe redirect error:", result.error.message);
    }

  } catch (err) {
    console.error("Payment error:", err.message || err);
  } finally {
    subscribingLoading.value = false;
  }
};


    const payWithPaystack = async (selectedPlan) => {
      subscribingLoading.value = true;

      try {
        const res = await axios.post(`${BASE_URL}/api/sub/paystack/create-checkout-session`, {
          plan_name: selectedPlan.name,
          billing_cycle: yearlyBilling.value,
          email: userStore.email,
          user_id: userStore.userId
        });

        window.location.href = res.data.checkout_url;
      } catch (err) {
        console.error("Paystack payment error", err);
      } finally {
        subscribingLoading.value = false;

      }
    };



    return {
      isDarkMode: computed(() => userStore.isdarkmode),
      showSubscriptionCards: computed(() => userStore.showSubscriptionCards),
      userId: computed(() => userStore.userId),
      userStore,
      injustifyIcon,
      yearlyBilling,
      computedPlans,
      subscribingLoading,
      closeModal,
      reloadPage,
      selectPlan,
    };
  },

};
</script>

<style scoped>
/* Base Styles */
#modal_header {
  position: relative;
  top: 0;
  padding: 10px;
  display: flex;
  flex-direction: row;
  background-color: rgba(54, 53, 53, 0.615);
  padding: 10px;
  z-index: 100;
  justify-content: space-between;
  align-items: center;
}

.closeM0dal {
  background-color: rgba(30, 31, 35, 0.626);
  color: rgb(121, 118, 118);
  border-radius: 5px;
  padding: 8px 12px;
  cursor: pointer;
  border: none;
  font-size: 0.9rem;
  transition: all 0.2s ease;
}

.closeM0dal:hover {
  color: rgb(207, 9, 9);
  transform: translateY(-1px);
}

.app-container {
  height: 100vh;
  transition: all 0.3s ease;
  z-index: 100;
  position: fixed;
  top: 0;
  overflow-y: auto;
  padding: 15px;
  width: 100vw;
  backdrop-filter: blur(5px);
}

/* Billing Toggle Styles */
.billing-toggle-container {
  display: flex;
  justify-content: center;
  margin: 20px 0 40px;
}

.billing-toggle {
  display: flex;
  align-items: center;
  gap: 15px;
  position: relative;
  background: var(--toggle-bg);
  padding: 8px 20px;
  border-radius: 50px;
  box-shadow: var(--toggle-shadow);
}

.billing-toggle span {
  font-weight: 600;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.billing-toggle span.active {
  color: var(--text-primary);
}

.switch {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 24px;
}

.switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.slider {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: var(--slider-bg);
  transition: .4s;
  border-radius: 34px;
}

.slider:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 4px;
  bottom: 4px;
  background-color: white;
  transition: .4s;
  border-radius: 50%;
}

input:checked+.slider {
  background: linear-gradient(135deg, var(--primary-button-bg-start), var(--primary-button-bg-end));
}

input:checked+.slider:before {
  transform: translateX(26px);
}

.discount-badge {
  position: absolute;
  right: -70px;
  background: linear-gradient(135deg, #4facfe, #00f2fe);
  color: white;
  padding: 4px 10px;
  border-radius: 50px;
  font-size: 0.7rem;
  font-weight: bold;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.05);
  }

  100% {
    transform: scale(1);
  }
}

/* Subscription Cards */
.subscription-cards {
  display: flex;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  flex-wrap: wrap;
  justify-content: center;
  padding: 15px;
}

.card {
  flex: 1;
  min-width: 280px;
  max-width: 320px;
  background: var(--card-bg);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: var(--card-shadow);
  position: relative;
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.1);
  overflow: hidden;
  border: 1px solid var(--card-border);
}

.card:hover {
  transform: translateY(-10px) scale(1.02);
  box-shadow: var(--card-hover-shadow);
}

.card-corner {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-top-right-radius: 16px;
  border-top: 60px solid var(--card-corner);
  border-left: 60px solid transparent;
  transition: all 0.3s ease;
}

.card-ribbon {
  position: absolute;
  top: 15px;
  right: -30px;
  width: 120px;
  padding: 5px 0;
  background: linear-gradient(135deg, var(--primary-button-bg-start), var(--primary-button-bg-end));
  color: white;
  text-align: center;
  font-size: 0.8rem;
  font-weight: bold;
  transform: rotate(45deg);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.card:hover .card-corner {
  border-top-width: 70px;
  border-left-width: 70px;
}

.card-header {
  margin-bottom: 1.5rem;
  position: relative;
  text-align: center;
}

.plan-icon {
  width: 60px;
  height: 60px;
  background: var(--icon-bg);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: var(--icon-color);
  font-size: 1.5rem;
  transition: all 0.3s ease;
}

.card:hover .plan-icon {
  transform: scale(1.1) rotate(10deg);
}

.card-header h3 {
  margin: 0;
  font-size: 1.8rem;
  color: var(--text-primary);
  font-weight: 700;
}

.price-savings {
  margin-top: 5px;
  font-size: 0.8rem;
  color: var(--icon-color);
  font-weight: 600;
}

.card-price {
  margin-bottom: 2rem;
  text-align: center;
}

.price {
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--text-primary);
  display: block;
  line-height: 1;
}

.period {
  font-size: 0.9rem;
  color: var(--text-secondary);
  font-weight: 500;
}

.equivalent {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-top: 5px;
  font-style: italic;
}

.features {
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
}

.features li {
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--feature-border);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  gap: 0.7rem;
}

.icon {
  color: var(--icon-color);
  font-size: 0.9rem;
}

.select-button {
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 50px;
  background: var(--button-bg);
  color: var(--button-text);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.select-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.2);
}

.select-button.primary {
  background: linear-gradient(135deg, var(--primary-button-bg-start), var(--primary-button-bg-end));
  color: white;
}

.button-icon {
  transition: transform 0.3s ease;
}

.select-button:hover .button-icon {
  transform: translateX(5px);
}

/* Card Specific Styles */
.card.free {
  --icon-color: #3498db;
  --icon-bg: rgba(52, 152, 219, 0.1);
  --card-corner: rgba(52, 152, 219, 0.1);
}

.card.basic {
  --icon-color: #9b59b6;
  --icon-bg: rgba(155, 89, 182, 0.1);
  --card-corner: rgba(155, 89, 182, 0.1);
}

.card.pro {
  --icon-color: #e74c3c;
  --icon-bg: rgba(231, 76, 60, 0.1);
  --card-corner: rgba(231, 76, 60, 0.1);
  --primary-button-bg-start: #ff8a00;
  --primary-button-bg-end: #e52e71;
}

.card.premium {
  --icon-color: #f39c12;
  --icon-bg: rgba(243, 156, 18, 0.1);
  --card-corner: rgba(243, 156, 18, 0.1);
}

/* Light Mode Variables */
.app-container {
  --bg-color: #585a5ccf;
  --text-primary: #2c3e50;
  --text-secondary: #7f8c8d;
  --card-bg: #ffffff;
  --card-border: rgba(0, 0, 0, 0.05);
  --card-shadow: 0 10px 20px rgba(0, 0, 0, 0.05);
  --card-hover-shadow: 0 15px 30px rgba(0, 0, 0, 0.1);
  --feature-border: rgba(0, 0, 0, 0.05);
  --button-bg: #f1f3f5;
  --button-text: #2c3e50;
  --toggle-bg: #f1f3f5;
  --toggle-shadow: 0 4px 8px rgba(0, 0, 0, 0.05);
  --slider-bg: #ccc;
  background-color: var(--bg-color);
}

/* Dark Mode Variables */
.app-container.dark-mode-sb {
  --bg-color: #585a5ccf;
  --text-primary: #f8f9fa;
  --text-secondary: #adb5bd;
  --card-bg: #16213e;
  --card-border: rgba(255, 255, 255, 0.05);
  --card-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  --card-hover-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
  --feature-border: rgba(255, 255, 255, 0.05);
  --button-bg: #0f3460;
  --button-text: #f8f9fa;
  --toggle-bg: #0f3460;
  --toggle-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  --slider-bg: #555;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .card {
    min-width: 250px;
  }
}

@media (max-width: 768px) {
  .billing-toggle {
    padding: 6px 15px;
  }

  .discount-badge {
    position: static;
    margin-left: 10px;
  }

  .subscription-cards {
    flex-direction: column;
    align-items: center;
  }

  .card {
    max-width: 100%;
    width: 100%;
  }
}

@media (max-width: 480px) {
  .billing-toggle {
    gap: 10px;
    font-size: 0.8rem;
  }

  .switch {
    width: 40px;
    height: 20px;
  }

  .slider:before {
    height: 14px;
    width: 14px;
    left: 3px;
    bottom: 3px;
  }

  input:checked+.slider:before {
    transform: translateX(20px);
  }
}
</style>