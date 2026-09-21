<template>
  <div class="home-container">
    <!-- Cinematic Hero Section (Auto-Advancing Top 5 Carousel) -->
    <div
      v-if="top5Trending.length > 0"
      class="hero-banner"
      :style="currentHeroStyle"
      @mouseenter="pauseCarousel"
      @mouseleave="startCarousel"
    >
      <div class="hero-overlay">
        <!-- Navigation Arrows -->
        <button
          class="hero-carousel-arrow hero-carousel-arrow--left"
          @click="prevSlide"
          aria-label="Previous Slide"
        >
          ❮
        </button>
        <button
          class="hero-carousel-arrow hero-carousel-arrow--right"
          @click="nextSlide"
          aria-label="Next Slide"
        >
          ❯
        </button>

        <div class="container-fluid px-2 px-sm-3 px-md-4 px-lg-5 hero-content">
          <div class="hero-badge">
            <span class="hero-badge__dot"></span>
            <span>#{{ activeSlideIndex + 1 }} TRENDING TODAY</span>
          </div>

          <transition name="fade-slide" mode="out-in">
            <div :key="currentFeaturedItem?.id || activeSlideIndex">
              <h1 class="hero-title">{{ currentFeaturedTitle }}</h1>
              
              <div class="hero-meta d-flex align-items-center gap-3 my-3">
                <RatingCircle :score="currentFeaturedItem?.vote_average" :size="48" />
                <span class="hero-meta__text">{{ currentFeaturedYear }}</span>
                <span class="hero-meta__bullet">•</span>
                <span class="hero-meta__text text-uppercase">{{ currentFeaturedItem?.original_language || 'en' }}</span>
                <span class="hero-meta__bullet">•</span>
                <span class="hero-meta__text">Rating {{ currentFeaturedItem?.vote_average?.toFixed(1) }} / 10</span>
              </div>

              <p class="hero-overview">{{ currentFeaturedItem?.overview }}</p>

              <div class="hero-actions d-flex flex-wrap gap-3 mt-4">
                <button class="btn btn-hero-primary" @click="openItemDetail(currentFeaturedItem, 'movie')">
                  <span class="play-icon">▶</span> Explore & Watch Trailer
                </button>
                <button class="btn btn-hero-secondary" @click="triggerAiForFeatured">
                  <span class="sparkle">✨</span> Ask AI
                </button>
              </div>
            </div>
          </transition>

          <!-- Carousel Indicator Dots (5 Slides, 2s Interval) -->
          <div class="hero-carousel-dots d-flex align-items-center gap-2 mt-4">
            <button
              v-for="(item, idx) in top5Trending"
              :key="item.id"
              :class="['dot-indicator', { 'dot-indicator--active': activeSlideIndex === idx }]"
              @click="goToSlide(idx)"
              :aria-label="`Slide ${idx + 1}`"
            ></button>
          </div>
        </div>
      </div>
    </div>

    <!-- Skeleton Hero while loading -->
    <SkeletonHero v-else />

    <div class="container-fluid px-2 px-sm-3 px-md-4 px-lg-5 main-content">
      <!-- AI Mood Matcher Section -->
      <section class="ai-mood-section my-5 p-4 rounded-4 shadow-lg">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
          <div>
            <div class="d-flex align-items-center gap-2">
              <span class="sparkle-icon">✨</span>
              <h2 class="mood-title mb-0">AI Mood Matcher</h2>
            </div>
            <p class="mood-subtitle mb-0">Tell AI what you're craving to watch, or select a vibe below</p>
          </div>
          <div class="mood-input-wrap d-flex gap-2">
            <input
              type="text"
              v-model="customMood"
              @keyup.enter="fetchMoodRecommendations(customMood)"
              placeholder="e.g. 90s thriller with a massive twist..."
              class="form-control mood-input"
            />
            <button
              class="btn btn-mood-search"
              @click="fetchMoodRecommendations(customMood)"
              :disabled="isLoadingMood || !customMood.trim()"
            >
              <span class="sparkle">✨</span> Match
            </button>
          </div>
        </div>

        <!-- Quick Mood Chips -->
        <div class="mood-chips d-flex flex-wrap gap-2 mb-4">
          <button
            v-for="mood in moodOptions"
            :key="mood.label"
            :class="['mood-chip', { 'mood-chip--active': activeMood === mood.label }]"
            @click="fetchMoodRecommendations(mood.prompt, mood.label)"
          >
            <span>{{ mood.icon }}</span> {{ mood.label }}
          </button>
        </div>

        <!-- Skeleton Mood Loaders while AI is processing -->
        <SkeletonMood v-if="isLoadingMood" />

        <!-- Mood Results Grid -->
        <div v-else-if="moodResults.length > 0" class="row g-3">
          <div
            v-for="(item, idx) in moodResults"
            :key="idx"
            class="col-12 col-sm-6 col-lg-3"
          >
            <div class="card mood-card h-100 p-3" @click="searchAndOpenMoodItem(item.title)">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="mood-card__vibe">{{ item.vibe }}</span>
                <span class="mood-card__year">{{ item.year }}</span>
              </div>
              <h5 class="mood-card__title">{{ item.title }}</h5>
              <p class="mood-card__reason">{{ item.reason }}</p>
              <div class="mood-card__footer mt-auto pt-2 d-flex justify-content-between align-items-center">
                <span class="click-hint">Click to discover ↗</span>
                <span class="ai-pick-tag">✨ AI Pick</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- Trending Movies Section -->
      <section class="carousel-section my-5">
        <div class="section-header d-flex justify-content-between align-items-center mb-3">
          <div class="d-flex align-items-center gap-3">
            <h2 class="carousel-heading mb-0">Trending Movies</h2>
            <span class="trending-badge">Hot Today</span>
          </div>
          <router-link to="/moviespage" class="view-all-link">View All Movies ↗</router-link>
        </div>

        <!-- Horizontal Scroll Cards or Skeletons -->
        <div class="horizontal-scroll-container">
          <div class="horizontal-scroll-track" v-if="trendingData.length > 0">
            <div
              v-for="item in trendingData"
              :key="item.id"
              class="media-card-item"
              @click="openItemDetail(item, 'movie')"
            >
              <div class="media-card-poster-wrap">
                <img
                  :src="getImageUrl(item.poster_path)"
                  :alt="item.title"
                  class="media-card-poster"
                  loading="lazy"
                />
                <div class="media-card-rating">
                  <RatingCircle :score="item.vote_average" :size="38" />
                </div>
              </div>
              <div class="media-card-info">
                <h4 class="media-card-title">{{ item.title }}</h4>
                <p class="media-card-date">{{ formatDate(item.release_date) }}</p>
              </div>
            </div>
          </div>

          <!-- Skeletons for Trending Movies -->
          <div class="horizontal-scroll-track" v-else>
            <div v-for="n in 7" :key="n" class="media-card-item">
              <SkeletonCard />
            </div>
          </div>
        </div>
      </section>

      <!-- Trending TV Shows Section -->
      <section class="carousel-section my-5">
        <div class="section-header d-flex justify-content-between align-items-center mb-3">
          <div class="d-flex align-items-center gap-3">
            <h2 class="carousel-heading mb-0">Trending TV Shows</h2>
            <span class="trending-badge tv-badge">Binge Worthy</span>
          </div>
          <router-link to="/tvshowspage" class="view-all-link">View All TV Shows ↗</router-link>
        </div>

        <div class="horizontal-scroll-container">
          <div class="horizontal-scroll-track" v-if="trendingTvData.length > 0">
            <div
              v-for="item in trendingTvData"
              :key="item.id"
              class="media-card-item"
              @click="openItemDetail(item, 'tv')"
            >
              <div class="media-card-poster-wrap">
                <img
                  :src="getImageUrl(item.poster_path)"
                  :alt="item.name"
                  class="media-card-poster"
                  loading="lazy"
                />
                <div class="media-card-rating">
                  <RatingCircle :score="item.vote_average" :size="38" />
                </div>
              </div>
              <div class="media-card-info">
                <h4 class="media-card-title">{{ item.name }}</h4>
                <p class="media-card-date">{{ formatDate(item.first_air_date) }}</p>
              </div>
            </div>
          </div>

          <!-- Skeletons for TV Shows -->
          <div class="horizontal-scroll-track" v-else>
            <div v-for="n in 7" :key="n" class="media-card-item">
              <SkeletonCard />
            </div>
          </div>
        </div>
      </section>

      <!-- Top Rated Section -->
      <section class="carousel-section my-5">
        <div class="section-header d-flex justify-content-between align-items-center mb-3">
          <div class="d-flex align-items-center gap-3">
            <h2 class="carousel-heading mb-0">Top Rated Masterpieces</h2>
            <span class="trending-badge top-badge">All-Time Hits</span>
          </div>
          <router-link to="/moviespage" class="view-all-link">Browse Catalog ↗</router-link>
        </div>

        <div class="horizontal-scroll-container">
          <div class="horizontal-scroll-track" v-if="topRatedMovies && topRatedMovies.length > 0">
            <div
              v-for="item in topRatedMovies"
              :key="item.id"
              class="media-card-item"
              @click="openItemDetail(item, 'movie')"
            >
              <div class="media-card-poster-wrap">
                <img
                  :src="getImageUrl(item.poster_path)"
                  :alt="item.title"
                  class="media-card-poster"
                  loading="lazy"
                />
                <div class="media-card-rating">
                  <RatingCircle :score="item.vote_average" :size="38" />
                </div>
              </div>
              <div class="media-card-info">
                <h4 class="media-card-title">{{ item.title }}</h4>
                <p class="media-card-date">{{ formatDate(item.release_date) }}</p>
              </div>
            </div>
          </div>

          <!-- Skeletons for Top Rated -->
          <div class="horizontal-scroll-track" v-else>
            <div v-for="n in 7" :key="n" class="media-card-item">
              <SkeletonCard />
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import RatingCircle from "./RatingCircle.vue";
import SkeletonCard from "../common/SkeletonCard.vue";
import SkeletonHero from "../common/SkeletonHero.vue";
import SkeletonMood from "../common/SkeletonMood.vue";
import { geminiService } from "@/services/geminiService";

export default {
  name: "homePagee",
  components: {
    RatingCircle,
    SkeletonCard,
    SkeletonHero,
    SkeletonMood,
  },
  data() {
    return {
      activeSlideIndex: 0,
      carouselTimer: null,
      customMood: "",
      activeMood: "Mind-Bending",
      isLoadingMood: false,
      moodResults: [],
      moodOptions: [
        { label: "Mind-Bending", icon: "🧠", prompt: "mind-bending sci-fi or psychological thrillers with unexpected twists" },
        { label: "Adrenaline Rush", icon: "⚡", prompt: "intense high-octane action movies with exhilarating pacing" },
        { label: "Cozy & Feel Good", icon: "☕", prompt: "warm, uplifting, heartwarming movies that put a smile on your face" },
        { label: "Dark Mystery", icon: "🕵️", prompt: "gritty detective mystery neo-noir films" },
        { label: "Epic Sci-Fi", icon: "🚀", prompt: "grand scale space exploration and futuristic worlds" },
      ],
    };
  },
  computed: {
    ...mapState(["trendingData", "trendingTvData", "topRatedMovies"]),
    top5Trending() {
      return (this.trendingData || []).slice(0, 5);
    },
    currentFeaturedItem() {
      if (!this.top5Trending.length) return null;
      return this.top5Trending[this.activeSlideIndex] || this.top5Trending[0];
    },
    currentFeaturedTitle() {
      if (!this.currentFeaturedItem) return "";
      return this.currentFeaturedItem.title || this.currentFeaturedItem.name || "";
    },
    currentFeaturedYear() {
      if (!this.currentFeaturedItem) return "";
      const d = this.currentFeaturedItem.release_date || this.currentFeaturedItem.first_air_date;
      return d ? d.split("-")[0] : "";
    },
    currentHeroStyle() {
      if (this.currentFeaturedItem?.backdrop_path) {
        return {
          backgroundImage: `linear-gradient(to bottom, rgba(11, 17, 32, 0.25) 0%, rgba(11, 17, 32, 0.68) 60%, rgba(11, 17, 32, 0.95) 100%), url('https://image.tmdb.org/t/p/original${this.currentFeaturedItem.backdrop_path}')`,
        };
      }
      return {
        background: "#0b1120",
      };
    },
  },
  methods: {
    ...mapActions(["fetchTrending", "openDetailModal", "fetchMovieByTitle"]),
    getImageUrl(path) {
      if (!path) return require("@/assets/cinema_logo.jpg");
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
    formatDate(dateStr) {
      if (!dateStr) return "N/A";
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateStr).toLocaleDateString("en-US", options);
    },
    openItemDetail(item, type = "movie") {
      this.openDetailModal({ item, type });
    },
    triggerAiForFeatured() {
      if (this.currentFeaturedItem) {
        this.openItemDetail(this.currentFeaturedItem, "movie");
      }
    },
    startCarousel() {
      this.stopCarousel();
      this.carouselTimer = setInterval(() => {
        this.nextSlide();
      }, 2000); // Advances every 2 seconds
    },
    pauseCarousel() {
      this.stopCarousel();
    },
    stopCarousel() {
      if (this.carouselTimer) {
        clearInterval(this.carouselTimer);
        this.carouselTimer = null;
      }
    },
    nextSlide() {
      if (!this.top5Trending.length) return;
      this.activeSlideIndex = (this.activeSlideIndex + 1) % this.top5Trending.length;
    },
    prevSlide() {
      if (!this.top5Trending.length) return;
      this.activeSlideIndex =
        (this.activeSlideIndex - 1 + this.top5Trending.length) % this.top5Trending.length;
    },
    goToSlide(idx) {
      this.activeSlideIndex = idx;
      this.startCarousel();
    },
    async fetchMoodRecommendations(prompt, label = "") {
      if (label) this.activeMood = label;
      this.isLoadingMood = true;
      try {
        const results = await geminiService.getMoodRecommendations(prompt);
        this.moodResults = results;
      } catch (err) {
        console.error("Failed to fetch mood:", err);
      } finally {
        this.isLoadingMood = false;
      }
    },
    async searchAndOpenMoodItem(title) {
      const found = await this.fetchMovieByTitle(title);
      if (!found) {
        this.$store.commit("setSearchTxt", title);
        this.$router.push({ name: "moviesPage" });
      }
    },
  },
  mounted() {
    this.fetchTrending().then(() => {
      this.startCarousel();
    });
    this.startCarousel();
    this.fetchMoodRecommendations(this.moodOptions[0].prompt, this.moodOptions[0].label);
  },
  beforeUnmount() {
    this.stopCarousel();
  },
};
</script>

<style scoped>
.home-container {
  background: var(--bg-primary);
  min-height: 100vh;
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Hero Section Carousel */
.hero-banner {
  position: relative;
  min-height: 540px;
  background-size: cover;
  background-position: center top;
  display: flex;
  align-items: flex-end;
  padding-bottom: 4rem;
  transition: background-image 0.6s ease-in-out;
}

.hero-overlay {
  width: 100%;
  padding-top: 6rem;
  position: relative;
}

/* Carousel Navigation Arrows */
.hero-carousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #ffffff;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 5;
  transition: all 0.2s ease;
}

.hero-carousel-arrow:hover {
  background: var(--tmdb-cyan);
  color: #032541;
  transform: translateY(-50%) scale(1.1);
  border-color: transparent;
}

.hero-carousel-arrow--left {
  left: 20px;
}

.hero-carousel-arrow--right {
  right: 20px;
}

.hero-content {
  max-width: 900px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: rgba(1, 180, 228, 0.2);
  border: 1px solid var(--tmdb-cyan);
  color: var(--tmdb-cyan);
  font-size: 11px;
  font-weight: 800;
  padding: 4px 12px;
  border-radius: 20px;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
}

.hero-badge__dot {
  width: 6px;
  height: 6px;
  background: var(--tmdb-cyan);
  border-radius: 50%;
  animation: pulse 2s infinite;
}

.hero-title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 900;
  color: #ffffff;
  line-height: 1.1;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.85);
}

.hero-meta__text {
  font-size: 0.95rem;
  color: #e2e8f0;
  font-weight: 600;
}

.hero-meta__bullet {
  color: #94a3b8;
}

.hero-overview {
  font-size: 1rem;
  color: #f1f5f9;
  line-height: 1.6;
  max-width: 750px;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.9);
}

.btn-hero-primary {
  background: linear-gradient(135deg, #01b4e4 0%, #0077b6 100%);
  color: #fff;
  font-weight: 700;
  padding: 10px 24px;
  border-radius: 30px;
  border: none;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: 0 8px 20px rgba(1, 180, 228, 0.4);
}

.btn-hero-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 25px rgba(1, 180, 228, 0.6);
  color: #fff;
}

.btn-hero-secondary {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  font-weight: 700;
  padding: 10px 22px;
  border-radius: 30px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-hero-secondary:hover {
  background: linear-gradient(90deg, #01b4e4, #90cea1);
  color: #032541;
  border-color: transparent;
  transform: translateY(-2px);
}

/* Dots Indicator */
.hero-carousel-dots {
  margin-top: 1.5rem;
}

.dot-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
  border: none;
  cursor: pointer;
  padding: 0;
  transition: all 0.3s ease;
}

.dot-indicator--active {
  width: 28px;
  border-radius: 10px;
  background: linear-gradient(90deg, #01b4e4, #90cea1);
  box-shadow: 0 0 10px rgba(1, 180, 228, 0.8);
}

/* AI Mood Matcher */
.ai-mood-section {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  position: relative;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

[data-theme="light"] .ai-mood-section {
  background: #f8fafc; /* Gentle soft off-white / light-slate tinted white */
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.05);
}

.sparkle-icon {
  font-size: 1.6rem;
}

.mood-title {
  font-size: 1.5rem;
  font-weight: 800;
  background: linear-gradient(90deg, #01b4e4, #90cea1);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.mood-subtitle {
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.mood-input {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
  border-radius: 25px;
  padding: 8px 18px;
  min-width: 260px;
  font-size: 0.85rem;
}

[data-theme="light"] .mood-input {
  background: #ffffff !important;
  border: 1px solid #cbd5e1 !important;
}

.btn-mood-search {
  background: linear-gradient(90deg, #01b4e4, #90cea1);
  color: #032541;
  font-weight: 800;
  border-radius: 25px;
  border: none;
  padding: 8px 20px;
  font-size: 0.85rem;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}

.mood-chip {
  background: var(--border-color);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

[data-theme="light"] .mood-chip {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  color: #475569;
}

.mood-chip:hover,
.mood-chip--active {
  background: rgba(1, 180, 228, 0.2);
  border-color: var(--tmdb-cyan);
  color: var(--text-primary);
  transform: translateY(-1px);
}

[data-theme="light"] .mood-chip:hover,
[data-theme="light"] .mood-chip--active {
  background: #e0f2fe;
  border-color: #0284c7;
  color: #0369a1;
}

.mood-card {
  background: var(--bg-card);
  border: 1.5px solid var(--border-color);
  border-radius: 16px;
  padding: 16px;
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  position: relative;
  overflow: hidden;
}

[data-theme="light"] .mood-card {
  background: #ffffff;
  border: 1.5px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.04);
}

[data-theme="dark"] .mood-card {
  background: rgba(15, 23, 42, 0.75);
  border: 1.5px solid rgba(1, 180, 228, 0.28);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.mood-card:hover {
  transform: translateY(-5px);
  border-color: var(--tmdb-cyan) !important;
  box-shadow: 0 12px 28px rgba(1, 180, 228, 0.25) !important;
}

[data-theme="light"] .mood-card:hover {
  border-color: #0284c7 !important;
  box-shadow: 0 10px 24px rgba(2, 132, 199, 0.12) !important;
}

.mood-card__vibe {
  font-size: 0.72rem;
  background: rgba(1, 180, 228, 0.15);
  color: var(--tmdb-cyan);
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 20px;
  border: 1px solid rgba(1, 180, 228, 0.25);
}

[data-theme="light"] .mood-card__vibe {
  background: #e0f2fe;
  color: #0369a1;
  border-color: #bae6fd;
}

.mood-card__year {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.mood-card__title {
  font-size: 1.1rem;
  font-weight: 800;
  color: var(--text-primary);
  margin-top: 8px;
  margin-bottom: 6px;
  line-height: 1.3;
}

.mood-card__reason {
  font-size: 0.82rem;
  color: var(--text-secondary);
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 12px;
}

.click-hint {
  font-size: 0.75rem;
  color: var(--tmdb-green);
  font-weight: 600;
}

.ai-pick-tag {
  font-size: 0.7rem;
  color: var(--tmdb-cyan);
  font-weight: 700;
}

/* Horizontal Carousels */
.carousel-heading {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
}

.trending-badge {
  background: linear-gradient(90deg, #01b4e4, #0077b6);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 3px 10px;
  border-radius: 12px;
}

.tv-badge {
  background: linear-gradient(90deg, #90cea1, #01b4e4);
  color: #032541;
}

.top-badge {
  background: linear-gradient(90deg, #f59e0b, #d97706);
  color: #fff;
}

.view-all-link {
  color: var(--tmdb-cyan);
  font-size: 0.85rem;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.2s;
}

.view-all-link:hover {
  color: var(--tmdb-green);
}

.horizontal-scroll-container {
  overflow-x: auto;
  width: 100%;
  max-width: 100%;
  -webkit-overflow-scrolling: touch;
  padding-bottom: 1.5rem;
  scrollbar-width: thin;
  scrollbar-color: rgba(1, 180, 228, 0.4) transparent;
}

.horizontal-scroll-track {
  display: flex;
  gap: 1.25rem;
  align-items: flex-start;
}

.media-card-item {
  width: 165px;
  min-width: 165px;
  max-width: 165px;
  flex: 0 0 165px;
  cursor: pointer;
  transition: transform 0.25s ease;
}

.media-card-item:hover {
  transform: translateY(-6px);
}

.media-card-poster-wrap {
  position: relative;
  width: 165px;
  height: 248px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
  background: var(--border-color);
  flex-shrink: 0;
}

.media-card-poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.media-card-item:hover .media-card-poster {
  transform: scale(1.05);
}

.media-card-rating {
  position: absolute;
  bottom: -14px;
  left: 10px;
  z-index: 2;
}

.media-card-info {
  margin-top: 20px;
  padding: 0 4px;
  width: 165px;
  min-height: 48px;
  max-height: 48px;
  overflow: hidden;
}

.media-card-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: block;
  max-width: 157px;
}

.media-card-date {
  font-size: 0.75rem;
  color: var(--text-secondary);
  margin-bottom: 0;
}

/* Fade slide animation */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

@media (max-width: 576px) {
  .mood-input-wrap {
    width: 100%;
    flex-direction: column;
  }
  .mood-input {
    min-width: 0 !important;
    width: 100% !important;
  }
  .btn-mood-search {
    width: 100% !important;
    justify-content: center !important;
  }
}
</style>
