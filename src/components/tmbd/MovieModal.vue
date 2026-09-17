<template>
  <div v-if="activeItem" class="modal-backdrop-custom" @click.self="close">
    <div class="cinematic-modal animate-fade-in" :style="modalBackdropStyle">
      <div class="cinematic-modal__overlay">
        <!-- Close Button -->
        <button class="cinematic-modal__close" @click="close" aria-label="Close modal">
          ✕
        </button>

        <div class="cinematic-modal__body">
          <div class="row g-4">
            <!-- Poster column -->
            <div class="col-12 col-md-4 text-center text-md-start">
              <div class="cinematic-modal__poster-wrap">
                <img
                  :src="getPosterUrl(activeItem.poster_path)"
                  :alt="itemTitle"
                  class="cinematic-modal__poster"
                />
                <div class="cinematic-modal__rating-badge">
                  <RatingCircle :score="activeItem.vote_average" :size="54" />
                </div>
              </div>

              <!-- Quick Meta -->
              <div class="cinematic-modal__meta mt-3">
                <div class="meta-item">
                  <span class="meta-label">Release:</span>
                  <span class="meta-val">{{ releaseDate }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Original Language:</span>
                  <span class="meta-val text-uppercase">{{ activeItem.original_language || 'en' }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">User Score:</span>
                  <span class="meta-val">{{ Math.round((activeItem.vote_average || 0) * 10) }}% ({{ activeItem.vote_count }} votes)</span>
                </div>
              </div>
            </div>

            <!-- Details column -->
            <div class="col-12 col-md-8">
              <div class="cinematic-modal__header">
                <h1 class="cinematic-modal__title">
                  {{ itemTitle }}
                  <span class="cinematic-modal__year" v-if="releaseYear">({{ releaseYear }})</span>
                </h1>
                <p class="cinematic-modal__tagline" v-if="activeItem.tagline">
                  "{{ activeItem.tagline }}"
                </p>
              </div>

              <!-- Overview -->
              <div class="cinematic-modal__section">
                <h3 class="section-title">Overview</h3>
                <p class="section-text">{{ activeItem.overview || 'No overview available for this title.' }}</p>
              </div>

              <!-- AI Smart Analysis Box -->
              <div class="cinematic-modal__gemini-box">
                <div class="gemini-box__header d-flex justify-content-between align-items-center mb-2">
                  <div class="d-flex align-items-center gap-2">
                    <span class="gemini-sparkle">✨</span>
                    <span class="gemini-label">AI Smart Analysis</span>
                  </div>
                  <button
                    class="btn btn-sm btn-gemini"
                    @click="generateAiInsight"
                    :disabled="isGeneratingInsight"
                  >
                    <span v-if="isGeneratingInsight">Analyzing...</span>
                    <span v-else>{{ aiInsight ? 'Regenerate' : 'Ask AI: Why Watch?' }}</span>
                  </button>
                </div>
                <div v-if="aiInsight" class="gemini-insight-content">
                  <p class="mb-0" style="white-space: pre-line;">{{ aiInsight }}</p>
                </div>
                <div v-else-if="!isGeneratingInsight" class="gemini-box__placeholder">
                  Get instant AI pitch, mood match, and why you'll love this title.
                </div>
              </div>

              <!-- Trailer section with Skeleton Loader to avoid UI jump -->
              <div class="cinematic-modal__section mt-4">
                <h3 class="section-title">Official Trailer</h3>
                <!-- Skeleton Loader while trailer is loading from TMDB API -->
                <div v-if="isLoading" class="trailer-skeleton ratio ratio-16x9 shimmer">
                  <div class="trailer-skeleton-inner d-flex flex-column align-items-center justify-content-center">
                    <span class="trailer-play-icon">▶</span>
                    <span class="trailer-skeleton-text mt-2">Loading official trailer...</span>
                  </div>
                </div>
                <!-- Embedded YouTube Player once loaded -->
                <div v-else-if="trailerKey" class="trailer-container ratio ratio-16x9">
                  <iframe
                    :src="`https://www.youtube.com/embed/${trailerKey}?autoplay=0`"
                    title="YouTube video player"
                    frameborder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowfullscreen
                  ></iframe>
                </div>
                <!-- Empty state if no trailer found -->
                <div v-else class="trailer-empty p-4 text-center rounded-3">
                  <span class="text-muted">No official video trailer available for this title.</span>
                </div>
              </div>

              <!-- Top Cast section with Skeleton Loader -->
              <div class="cinematic-modal__section mt-4">
                <h3 class="section-title">Top Billed Cast</h3>
                <div v-if="isLoading" class="cast-row">
                  <div v-for="n in 6" :key="n" class="cast-card">
                    <div class="cast-avatar shimmer"></div>
                    <div class="cast-skeleton-name shimmer mt-2"></div>
                  </div>
                </div>
                <div v-else-if="castList.length > 0" class="cast-row">
                  <div
                    v-for="person in castList.slice(0, 8)"
                    :key="person.id"
                    class="cast-card"
                  >
                    <img
                      :src="getProfileUrl(person.profile_path)"
                      :alt="person.name"
                      class="cast-avatar"
                    />
                    <div class="cast-name">{{ person.name }}</div>
                    <div class="cast-character">{{ person.character }}</div>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import RatingCircle from "./RatingCircle.vue";
import { geminiService } from "@/services/geminiService";

export default {
  name: "MovieModal",
  components: {
    RatingCircle,
  },
  data() {
    return {
      aiInsight: "",
      isGeneratingInsight: false,
    };
  },
  computed: {
    ...mapState({
      activeItem: (state) => state.activeDetailItem,
      videos: (state) => state.activeItemVideos,
      credits: (state) => state.activeItemCredits,
      isLoading: (state) => state.isDetailLoading,
    }),
    itemTitle() {
      if (!this.activeItem) return "";
      return this.activeItem.title || this.activeItem.name || this.activeItem.original_name || "Unknown Title";
    },
    releaseDate() {
      if (!this.activeItem) return "N/A";
      return this.activeItem.release_date || this.activeItem.first_air_date || "N/A";
    },
    releaseYear() {
      const date = this.releaseDate;
      return date && date !== "N/A" ? date.split("-")[0] : "";
    },
    trailerKey() {
      if (!this.videos || !this.videos.length) return null;
      const trailer =
        this.videos.find((v) => v.type === "Trailer" && v.site === "YouTube") ||
        this.videos.find((v) => v.site === "YouTube");
      return trailer ? trailer.key : null;
    },
    castList() {
      return this.credits?.cast || [];
    },
    modalBackdropStyle() {
      if (this.activeItem?.backdrop_path) {
        return {
          backgroundImage: `linear-gradient(to right, var(--bg-modal) 25%, rgba(17, 26, 46, 0.85) 100%), url('https://image.tmdb.org/t/p/w1280${this.activeItem.backdrop_path}')`,
          backgroundSize: "cover",
          backgroundPosition: "center top",
        };
      }
      return {
        background: "var(--bg-modal)",
      };
    },
  },
  watch: {
    activeItem() {
      this.aiInsight = "";
      this.isGeneratingInsight = false;
    },
  },
  methods: {
    ...mapActions(["closeDetailModal"]),
    close() {
      this.closeDetailModal();
    },
    getPosterUrl(path) {
      if (!path) return require("@/assets/cinema_logo.jpg");
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
    getProfileUrl(path) {
      if (!path) return require("@/assets/cinema_logo.jpg");
      return `https://image.tmdb.org/t/p/w185${path}`;
    },
    async generateAiInsight() {
      if (!this.activeItem) return;
      this.isGeneratingInsight = true;
      try {
        const insight = await geminiService.getMovieInsight(
          this.itemTitle,
          this.activeItem.overview,
          this.releaseYear
        );
        this.aiInsight = insight;
      } catch (err) {
        console.error("Failed to generate AI insight:", err);
        this.aiInsight = "Could not generate insight at this moment.";
      } finally {
        this.isGeneratingInsight = false;
      }
    },
  },
  mounted() {
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.activeItem) {
        this.close();
      }
    });
  },
};
</script>

<style scoped>
.modal-backdrop-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.cinematic-modal {
  position: relative;
  width: 100%;
  max-width: 1000px;
  max-height: 90vh;
  border-radius: 20px;
  overflow-y: auto;
  overflow-x: hidden;
  border: 1px solid var(--border-color);
  box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.7), 0 0 35px var(--tmdb-cyan-glow);
  color: var(--text-primary);
  background: var(--bg-modal);
  scrollbar-width: thin;
  scrollbar-color: rgba(1, 180, 228, 0.45) transparent;
}

/* Custom Sleek Rounded Scrollbar that stays inside the 20px rounded curves */
.cinematic-modal::-webkit-scrollbar {
  width: 7px;
}

.cinematic-modal::-webkit-scrollbar-track {
  background: transparent;
  margin: 18px 0; /* Insets the scrollbar away from top and bottom rounded corners */
  border-radius: 10px;
}

.cinematic-modal::-webkit-scrollbar-thumb {
  background: rgba(1, 180, 228, 0.45);
  border-radius: 10px;
  transition: background 0.2s;
}

.cinematic-modal::-webkit-scrollbar-thumb:hover {
  background: var(--tmdb-cyan);
}

.cinematic-modal__overlay {
  background: var(--bg-modal);
  opacity: 0.97;
  padding: 2.2rem;
  border-radius: 20px;
}

.cinematic-modal__close {
  position: absolute;
  top: 18px;
  right: 22px;
  background: var(--border-color);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  width: 38px;
  height: 38px;
  border-radius: 50%;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
}

.cinematic-modal__close:hover {
  background: var(--tmdb-pink);
  color: #fff;
  transform: rotate(90deg) scale(1.1);
}

.cinematic-modal__poster-wrap {
  position: relative;
  display: inline-block;
  border-radius: 14px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4);
}

.cinematic-modal__poster {
  width: 100%;
  max-width: 280px;
  border-radius: 14px;
  display: block;
}

.cinematic-modal__rating-badge {
  position: absolute;
  bottom: -15px;
  left: 15px;
}

.cinematic-modal__meta {
  background: var(--border-color);
  padding: 12px 16px;
  border-radius: 10px;
  font-size: 0.85rem;
  text-align: left;
  border: 1px solid var(--border-color);
}

.meta-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 6px;
}

.meta-label {
  color: var(--text-secondary);
}

.meta-val {
  font-weight: 600;
  color: var(--text-primary);
}

.cinematic-modal__title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: 0.3rem;
  line-height: 1.2;
  color: var(--text-primary);
}

.cinematic-modal__year {
  font-size: 1.4rem;
  font-weight: 400;
  color: var(--text-secondary);
}

.cinematic-modal__tagline {
  font-style: italic;
  color: var(--tmdb-cyan);
  margin-bottom: 1.2rem;
  font-size: 1.05rem;
}

.section-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
  border-left: 3px solid var(--tmdb-cyan);
  padding-left: 8px;
}

.section-text {
  color: var(--text-secondary);
  line-height: 1.6;
  font-size: 0.95rem;
}

.cinematic-modal__gemini-box {
  background: var(--border-color);
  border: 1px solid var(--border-highlight);
  border-radius: 12px;
  padding: 14px 18px;
  margin-top: 1rem;
}

.gemini-sparkle {
  font-size: 1.2rem;
}

.gemini-label {
  font-weight: 700;
  background: var(--tmdb-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-size: 0.95rem;
}

.btn-gemini {
  background: var(--tmdb-gradient);
  color: #0b1120;
  font-weight: 700;
  border: none;
  border-radius: 20px;
  padding: 4px 14px;
  transition: all 0.2s ease;
}

.btn-gemini:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px var(--tmdb-cyan-glow);
}

.gemini-insight-content {
  color: var(--text-primary);
  font-size: 0.9rem;
  line-height: 1.5;
  background: var(--bg-primary);
  padding: 12px;
  border-radius: 8px;
  border-left: 3px solid var(--tmdb-green);
}

.gemini-box__placeholder {
  color: var(--text-secondary);
  font-size: 0.85rem;
}

/* Trailer Skeleton & Container */
.trailer-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.4);
}

.trailer-skeleton {
  border-radius: 12px;
  background: var(--skeleton-bg);
  border: 1px solid var(--border-color);
}

.trailer-skeleton-inner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.trailer-play-icon {
  font-size: 2.5rem;
  color: var(--tmdb-cyan);
  opacity: 0.6;
}

.trailer-skeleton-text {
  font-size: 0.88rem;
  color: var(--text-secondary);
  font-weight: 600;
}

.trailer-empty {
  background: var(--border-color);
  border: 1px dashed var(--border-color);
}

/* Cast */
.cast-row {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 8px;
}

.cast-card {
  flex: 0 0 90px;
  text-align: center;
}

.cast-avatar {
  width: 70px;
  height: 70px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--tmdb-cyan);
  margin-bottom: 6px;
  background: var(--skeleton-bg);
}

.cast-name {
  font-size: 0.75rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-primary);
}

.cast-character {
  font-size: 0.68rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.cast-skeleton-name {
  width: 80%;
  height: 10px;
  margin: 0 auto;
  border-radius: 4px;
  background: var(--skeleton-bg);
}

/* Shimmer animation */
.shimmer {
  position: relative;
  overflow: hidden;
}

.shimmer::after {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.08) 20%,
    rgba(255, 255, 255, 0.18) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 1.5s infinite;
  content: "";
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

@keyframes fadeIn {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: scale(1); }
}

.animate-fade-in {
  animation: fadeIn 0.22s ease-out;
}
</style>
