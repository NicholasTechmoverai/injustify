<template>
  <div class="not-found-container">
    <div class="stars"></div>
    <div class="twinkling"></div>
    
    <div class="not-found-content">
      <div class="astronaut" @click="flipAstronaut">
        <div class="astronaut-inner" :class="{ flipped: isFlipped }">
          <div class="astronaut-front">
            <img src="https://assets.codepen.io/1538474/astronaut.svg" alt="Astronaut">
          </div>
          <div class="astronaut-back">
            <img src="https://assets.codepen.io/1538474/alien.svg" alt="Alien">
          </div>
        </div>
      </div>
      
      <div class="error-message">
        <h1 class="error-code">4<span class="zero">0</span>4</h1>
        <h2 class="error-title">Lost in Space</h2>
        <p class="error-description">
          Oops! The page you're looking for has been lost in the cosmos.
          <br>
          Don't worry, you can always return to safety.
        </p>
        
        <div class="action-buttons">
          <button @click="goHome" class="home-button">
            <span>Return to Earth</span>
            <svg width="13px" height="10px" viewBox="0 0 13 10">
              <path d="M1,5 L11,5"></path>
              <polyline points="8 1 12 5 8 9"></polyline>
            </svg>
          </button>
          
          <button @click="contactSupport" class="contact-button">
            <span>Contact Mission Control</span>
          </button>
        </div>
      </div>
    </div>
    
    <div class="floating-rocks">
      <div class="rock rock-1"></div>
      <div class="rock rock-2"></div>
      <div class="rock rock-3"></div>
      <div class="rock rock-4"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NotFoundPage',
  data() {
    return {
      isFlipped: false
    }
  },
  methods: {
    flipAstronaut() {
      this.isFlipped = !this.isFlipped;
    },
    goHome() {
      this.$router.push('/');
    },
    contactSupport() {
      // Implement your contact logic here
      console.log('Contact support clicked');
    }
  },
  mounted() {
    // Add any initialization logic here
  }
}
</script>

<style scoped>
/* Base Styles */
.not-found-container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  color: white;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Starfield Background */
.stars, .twinkling {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100%;
  display: block;
}

.stars {
  background: #000 url('https://assets.codepen.io/1538474/stars.png') repeat top center;
  z-index: 0;
}

.twinkling {
  background: transparent url('https://assets.codepen.io/1538474/twinkling.png') repeat top center;
  z-index: 1;
  animation: twinkle 200s linear infinite;
}

@keyframes twinkle {
  from { background-position: 0 0; }
  to { background-position: -10000px 5000px; }
}

/* Content Container */
.not-found-content {
  position: relative;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 1200px;
  width: 90%;
  margin: 0 auto;
  gap: 60px;
}

/* Astronaut/Character */
.astronaut {
  perspective: 1000px;
  width: 300px;
  height: 300px;
  cursor: pointer;
}

.astronaut-inner {
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.8s;
  transform-style: preserve-3d;
}

.astronaut-inner.flipped {
  transform: rotateY(180deg);
}

.astronaut-front, .astronaut-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.astronaut-front img, .astronaut-back img {
  width: 100%;
  height: auto;
  filter: drop-shadow(0 0 20px rgba(255, 255, 255, 0.3));
  animation: float 6s ease-in-out infinite;
}

.astronaut-back {
  transform: rotateY(180deg);
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
  100% { transform: translateY(0px); }
}

/* Error Message */
.error-message {
  max-width: 500px;
}

.error-code {
  font-size: 8rem;
  margin: 0;
  line-height: 1;
  font-weight: 900;
  background: linear-gradient(135deg, #ffffff, #a7a7a7);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  position: relative;
  display: inline-block;
}

.zero {
  position: relative;
  display: inline-block;
  width: 120px;
  height: 120px;
}

.zero::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  background: url('https://assets.codepen.io/1538474/planet.svg') no-repeat center center;
  background-size: contain;
  animation: spin 20s linear infinite;
}

@keyframes spin {
  0% { transform: translate(-50%, -50%) rotate(0deg); }
  100% { transform: translate(-50%, -50%) rotate(360deg); }
}

.error-title {
  font-size: 2.5rem;
  margin: 20px 0 10px;
  font-weight: 600;
}

.error-description {
  font-size: 1.1rem;
  line-height: 1.6;
  margin-bottom: 30px;
  opacity: 0.9;
}

/* Action Buttons */
.action-buttons {
  display: flex;
  gap: 15px;
  flex-wrap: wrap;
}

.home-button, .contact-button {
  padding: 12px 24px;
  border-radius: 50px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.home-button {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border: none;
  color: white;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.home-button:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
}

.home-button svg {
  margin-left: 10px;
  transition: all 0.3s ease;
}

.home-button:hover svg {
  transform: translateX(5px);
}

.home-button svg path, .home-button svg polyline {
  stroke: white;
}

.contact-button {
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: white;
}

.contact-button:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

/* Floating Rocks */
.floating-rocks {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  z-index: 5;
}

.rock {
  position: absolute;
  background-size: contain;
  background-repeat: no-repeat;
  opacity: 0.7;
}

.rock-1 {
  width: 100px;
  height: 100px;
  background-image: url('https://assets.codepen.io/1538474/rock1.svg');
  top: 20%;
  left: 10%;
  animation: float-rock 15s ease-in-out infinite;
}

.rock-2 {
  width: 80px;
  height: 80px;
  background-image: url('https://assets.codepen.io/1538474/rock2.svg');
  top: 60%;
  left: 15%;
  animation: float-rock 18s ease-in-out infinite 2s;
}

.rock-3 {
  width: 120px;
  height: 120px;
  background-image: url('https://assets.codepen.io/1538474/rock3.svg');
  top: 30%;
  right: 10%;
  animation: float-rock 20s ease-in-out infinite 1s;
}

.rock-4 {
  width: 60px;
  height: 60px;
  background-image: url('https://assets.codepen.io/1538474/rock4.svg');
  bottom: 20%;
  right: 20%;
  animation: float-rock 12s ease-in-out infinite 3s;
}

@keyframes float-rock {
  0% { transform: translate(0, 0) rotate(0deg); }
  25% { transform: translate(20px, 30px) rotate(5deg); }
  50% { transform: translate(0, 50px) rotate(0deg); }
  75% { transform: translate(-20px, 30px) rotate(-5deg); }
  100% { transform: translate(0, 0) rotate(0deg); }
}

/* Responsive Design */
@media (max-width: 768px) {
  .not-found-content {
    flex-direction: column;
    text-align: center;
    gap: 30px;
  }
  
  .astronaut {
    width: 200px;
    height: 200px;
  }
  
  .error-code {
    font-size: 6rem;
  }
  
  .zero {
    width: 90px;
    height: 90px;
  }
  
  .error-title {
    font-size: 2rem;
  }
  
  .action-buttons {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .error-code {
    font-size: 4.5rem;
  }
  
  .zero {
    width: 70px;
    height: 70px;
  }
  
  .error-title {
    font-size: 1.8rem;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 10px;
  }
  
  .home-button, .contact-button {
    width: 100%;
  }
}
</style>