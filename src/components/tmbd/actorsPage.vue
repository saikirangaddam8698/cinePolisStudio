<template>
  <div class="actors-view container-fluid px-4 px-md-5 py-4">
    <!-- Page Header & Controls -->
    <div class="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-3">
      <div>
        <h1 class="page-title mb-1">Popular People & Actors</h1>
        <p class="page-subtitle mb-0">Discover top stars from Hollywood, Tollywood, Bollywood, K-Drama, and world cinema</p>
      </div>

      <div class="d-flex gap-2">
        <input
          type="text"
          v-model="actorSearch"
          placeholder="Filter by name (e.g.Tom, zendya)..."
          class="form-control actor-search-input"
        />
        <button v-if="actorSearch" class="btn btn-outline-secondary btn-sm rounded-pill" @click="clearActorSearch">
          Clear
        </button>
      </div>
    </div>

    <!-- Quick Region Filter Pills -->
    <div class="region-bar d-flex gap-2 overflow-auto pb-2 mb-4">
      <button
        v-for="reg in regionsList"
        :key="reg.code"
        :class="['region-pill', { 'region-pill--active': (selectedLanguage || '') === reg.code }]"
        @click="changeRegion(reg.code)"
      >
        <span>{{ reg.flag }}</span>
        <span>{{ reg.name }}</span>
      </button>
    </div>

    <!-- Skeletons when initial data is loading -->
    <div class="row g-4" v-if="isLoadingInitial">
      <div v-for="n in 12" :key="n" class="col-6 col-sm-4 col-md-3 col-xl-2">
        <SkeletonActor />
      </div>
    </div>

    <!-- Actors Grid -->
    <div class="row g-4" v-else-if="filteredActors.length > 0">
      <div
        v-for="item in filteredActors"
        :key="item.id"
        class="col-6 col-sm-4 col-md-3 col-xl-2"
      >
        <div class="actor-card" @click="openActorModal(item)">
          <div class="actor-card__photo-wrap">
            <img
              :src="getImageUrl(item.profile_path)"
              :alt="item.name"
              class="actor-card__photo"
              loading="lazy"
            />
            <div class="actor-card__dept-badge">
              {{ item.known_for_department || 'Acting' }}
            </div>
            <div v-if="item.region_name" class="actor-card__region-badge">
              {{ item.region_flag }} {{ item.region_name }}
            </div>
          </div>
          <div class="actor-card__info">
            <h6 class="actor-card__name" :title="item.name">{{ item.name }}</h6>
            <div class="actor-card__known-for" v-if="item.known_for && item.known_for.length">
              <span class="known-title">{{ getKnownForTitle(item.known_for[0]) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5 my-5">
      <div class="empty-icon mb-3">🌟</div>
      <h3>No People Found</h3>
      <p class="text-muted">Try a different name or clear the filter.</p>
    </div>

    <!-- Load More Skeletons or Button -->
    <div class="row g-4 mt-2" v-if="isLoadingMore">
      <div v-for="n in 6" :key="n" class="col-6 col-sm-4 col-md-3 col-xl-2">
        <SkeletonActor />
      </div>
    </div>

    <div class="text-center mt-5 mb-4" v-else-if="filteredActors.length > 0">
      <button
        class="btn btn-load-more"
        @click="loadMore"
      >
        Load More People ▾
      </button>
    </div>

    <!-- Actor Modal -->
    <div v-if="selectedActor" class="modal-backdrop-custom" @click.self="selectedActor = null">
      <div class="actor-modal animate-fade-in">
        <button class="modal-close-btn" @click="selectedActor = null">✕</button>
        <div class="row g-4">
          <div class="col-12 col-md-4 text-center">
            <img
              :src="getImageUrl(selectedActor.profile_path)"
              :alt="selectedActor.name"
              class="actor-modal__photo"
            />
            <div class="mt-3">
              <span class="badge bg-primary px-3 py-2 rounded-pill">
                {{ selectedActor.known_for_department }}
              </span>
            </div>
            <div class="actor-popularity mt-2">
              Popularity Score: <strong>{{ Math.round(selectedActor.popularity) }}</strong>
            </div>
          </div>
          <div class="col-12 col-md-8">
            <h2 class="actor-modal__title">{{ selectedActor.name }}</h2>
            <p class="actor-modal__original" v-if="selectedActor.original_name !== selectedActor.name">
              Also known as: {{ selectedActor.original_name }}
            </p>

            <h5 class="section-subheading mt-4">Known For</h5>
            <div class="known-for-list d-flex flex-column gap-2 mt-2">
              <div
                v-for="work in selectedActor.known_for"
                :key="work.id"
                class="known-for-item d-flex gap-3 p-2 rounded-3"
                @click="openWork(work)"
              >
                <img
                  :src="getImageUrl(work.poster_path)"
                  class="known-for-poster"
                  alt="poster"
                />
                <div>
                  <div class="known-for-name">{{ work.title || work.name }}</div>
                  <div class="known-for-meta">
                    {{ (work.release_date || work.first_air_date || '').split('-')[0] }} •
                    ⭐ {{ work.vote_average?.toFixed(1) }}
                  </div>
                  <p class="known-for-overview mb-0">{{ work.overview }}</p>
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
import SkeletonActor from "../common/SkeletonActor.vue";

export default {
  name: "actorsPage",
  components: {
    SkeletonActor,
  },
  data() {
    return {
      actorSearch: "",
      selectedActor: null,
      currentPage: 1,
      isLoadingInitial: false,
      isLoadingMore: false,
      searchTimeout: null,
      isLiveSearching: false,
      regionsList: [
        { code: "", name: "All Regions", flag: "🌐" },
        { code: "te", name: "Tollywood", flag: "🇮🇳" },
        { code: "hi", name: "Bollywood", flag: "🇮🇳" },
        { code: "ta", name: "Kollywood", flag: "🇮🇳" },
        { code: "ko", name: "K-Drama", flag: "🇰🇷" },
        { code: "en", name: "Hollywood", flag: "🇺🇸" },
        { code: "ja", name: "Japan", flag: "🇯🇵" },
      ],
    };
  },
  computed: {
    ...mapState(["actorsData", "searchTxt", "selectedLanguage"]),
    filteredActors() {
      const list = this.actorsData || [];
      const query = (this.actorSearch || this.searchTxt || "").trim().toLowerCase();
      if (!query) return list;

      // Filter: match actors whose name starts with query OR contains query
      // Prioritize names that start with the query, followed by names containing it
      const startsWithMatches = [];
      const includesMatches = [];

      for (const actor of list) {
        const name = (actor.name || "").toLowerCase();
        const orig = (actor.original_name || "").toLowerCase();
        if (name.startsWith(query) || orig.startsWith(query)) {
          startsWithMatches.push(actor);
        } else if (name.includes(query) || orig.includes(query)) {
          includesMatches.push(actor);
        }
      }

      return [...startsWithMatches, ...includesMatches];
    },
  },
  watch: {
    selectedLanguage(newLang) {
      this.actorSearch = "";
      this.loadActorsForRegion(newLang || "");
    },
    actorSearch(newTerm) {
      this.handleActorSearch(newTerm);
    },
    searchTxt(newTerm) {
      if (this.$route.name === "actorsPage") {
        this.actorSearch = newTerm;
      }
    },
  },
  methods: {
    ...mapActions(["fetchData", "openDetailModal", "fetchActorsByRegion", "searchActors"]),
    changeRegion(code) {
      this.$store.commit("setSelectedLanguage", code);
    },
    clearActorSearch() {
      this.actorSearch = "";
      this.$store.commit("setSearchTxt", "");
      this.handleActorSearch("");
    },
    handleActorSearch(term) {
      clearTimeout(this.searchTimeout);
      const query = (term || "").trim();

      if (!query) {
        this.isLiveSearching = false;
        this.currentPage = 1;
        this.loadActorsForRegion(this.selectedLanguage || "");
        return;
      }

      this.searchTimeout = setTimeout(async () => {
        this.isLiveSearching = true;
        this.currentPage = 1;
        try {
          await this.$store.dispatch("searchActors", {
            query,
            page: 1,
            append: false,
          });
        } finally {
          this.isLiveSearching = false;
        }
      }, 300);
    },
    async loadActorsForRegion(lang) {
      this.isLoadingInitial = true;
      try {
        await this.fetchActorsByRegion(lang || "");
      } finally {
        this.isLoadingInitial = false;
      }
    },
    getImageUrl(path) {
      if (!path) return require("@/assets/cinema_logo.jpg");
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
    getKnownForTitle(work) {
      if (!work) return "";
      return work.title || work.name || "";
    },
    openActorModal(actor) {
      this.selectedActor = actor;
    },
    openWork(work) {
      this.selectedActor = null;
      const mediaType = work.media_type || (work.title ? "movie" : "tv");
      this.openDetailModal({ item: work, type: mediaType });
    },
    async loadMore() {
      this.isLoadingMore = true;
      this.currentPage += 1;
      try {
        const query = (this.actorSearch || this.searchTxt || "").trim();
        if (query) {
          await this.$store.dispatch("searchActors", {
            query,
            page: this.currentPage,
            append: true,
            existing: this.actorsData,
          });
        } else {
          await this.fetchData({
            apiType: "actors",
            page: this.currentPage,
            append: true,
            existing: this.actorsData,
          });
        }
      } finally {
        this.isLoadingMore = false;
      }
    },
  },
  async mounted() {
    if (!this.actorsData || this.actorsData.length === 0 || !this.selectedLanguage) {
      await this.loadActorsForRegion(this.selectedLanguage || "");
    }
  },
};
</script>

<style scoped>
.actors-view {
  background: var(--bg-primary);
  min-height: 100vh;
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: var(--text-primary);
}

.page-subtitle {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

.actor-search-input {
  background: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 0.85rem;
  min-width: 200px;
}

.actor-card {
  cursor: pointer;
  transition: transform 0.25s ease;
}

.actor-card:hover {
  transform: translateY(-6px);
}

.actor-card__photo-wrap {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  background: var(--border-color);
  aspect-ratio: 2/3;
}

.actor-card__photo {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.actor-card:hover .actor-card__photo {
  transform: scale(1.06);
}

.actor-card__dept-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(3, 37, 65, 0.85);
  backdrop-filter: blur(4px);
  color: #01b4e4;
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(1, 180, 228, 0.3);
}

.actor-card__region-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  background: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(4px);
  color: #90cea1;
  font-size: 0.68rem;
  font-weight: 700;
  padding: 2px 8px;
  border-radius: 6px;
  border: 1px solid rgba(144, 206, 161, 0.35);
  display: flex;
  align-items: center;
  gap: 4px;
}

/* Region Filter Pills */
.region-bar {
  scrollbar-width: thin;
  scrollbar-color: var(--tmdb-cyan) transparent;
}

.region-pill {
  padding: 6px 14px;
  border-radius: 20px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.85rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.region-pill:hover,
.region-pill--active {
  background: linear-gradient(90deg, #01b4e4, #90cea1);
  color: #032541;
  font-weight: 700;
  border-color: transparent;
  transform: translateY(-2px);
}

.actor-card__info {
  margin-top: 10px;
  padding: 0 4px;
  min-height: 48px;
  max-height: 48px;
  overflow: hidden;
}

.actor-card__name {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.actor-card__known-for {
  font-size: 0.78rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.btn-load-more {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-weight: 700;
  padding: 10px 28px;
  border-radius: 30px;
  transition: all 0.2s ease;
}

.btn-load-more:hover {
  background: linear-gradient(90deg, #01b4e4, #90cea1);
  color: #032541;
  border-color: transparent;
  transform: translateY(-2px);
}

/* Modal styles */
.modal-backdrop-custom {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
}

.actor-modal {
  position: relative;
  background: var(--bg-secondary);
  width: 100%;
  max-width: 800px;
  max-height: 85vh;
  overflow-y: auto;
  overflow-x: hidden;
  border-radius: 20px;
  padding: 2.2rem;
  border: 1px solid var(--border-color);
  box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.7), 0 0 35px var(--tmdb-cyan-glow);
  color: var(--text-primary);
  scrollbar-width: thin;
  scrollbar-color: rgba(6, 182, 212, 0.45) transparent;
}

.actor-modal::-webkit-scrollbar {
  width: 7px;
}

.actor-modal::-webkit-scrollbar-track {
  background: transparent;
  margin: 18px 0;
  border-radius: 10px;
}

.actor-modal::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.45);
  border-radius: 10px;
  transition: background 0.2s;
}

.actor-modal::-webkit-scrollbar-thumb:hover {
  background: var(--tmdb-cyan);
}

.modal-close-btn {
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
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
  z-index: 10;
}

.modal-close-btn:hover {
  background: var(--tmdb-pink) !important;
  color: #ffffff !important;
  transform: rotate(90deg) scale(1.1) !important;
  border-color: transparent !important;
  box-shadow: 0 4px 14px rgba(244, 63, 94, 0.45) !important;
}

.actor-modal__photo {
  width: 100%;
  max-width: 220px;
  border-radius: 14px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
}

.actor-modal__title {
  font-size: 1.8rem;
  font-weight: 800;
}

.actor-modal__original {
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.section-subheading {
  font-size: 1.1rem;
  font-weight: 700;
  border-left: 3px solid var(--tmdb-cyan);
  padding-left: 8px;
}

.known-for-item {
  background: var(--border-color);
  border: 1px solid var(--border-color);
  cursor: pointer;
  transition: all 0.2s ease;
}

.known-for-item:hover {
  background: rgba(1, 180, 228, 0.15);
  border-color: var(--tmdb-cyan);
}

.known-for-poster {
  width: 50px;
  height: 75px;
  object-fit: cover;
  border-radius: 6px;
}

.known-for-name {
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--text-primary);
}

.known-for-meta {
  font-size: 0.8rem;
  color: var(--tmdb-cyan);
  margin-bottom: 4px;
}

.known-for-overview {
  font-size: 0.75rem;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.empty-icon {
  font-size: 3rem;
}

@media (max-width: 768px) {
  .actor-search-input {
    width: 100% !important;
    min-width: 0 !important;
  }

  .actor-modal {
    padding: 1.5rem 1rem !important;
  }
}
</style>