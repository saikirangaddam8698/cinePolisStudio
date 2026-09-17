<template>
  <div class="movies-view container-fluid px-4 px-md-5 py-4">
    <!-- Page Header & Controls -->
    <div class="page-header d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
      <div>
        <h1 class="page-title mb-1">Discover Movies</h1>
        <p class="page-subtitle mb-0">Explore trending blockbusters, Hollywood, Bollywood, anime, and world cinema</p>
      </div>

      <!-- Controls: Sort & Reset -->
      <div class="d-flex flex-wrap gap-2 align-items-center">
        <!-- Custom Sort Dropdown matching Region Dropdown styling -->
        <div class="dropdown custom-sort-dropdown">
          <button
            class="btn btn-custom-dropdown dropdown-toggle"
            type="button"
            id="movieSortDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span class="sort-icon">⚡</span>
            <span>{{ currentSortLabel }}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-custom shadow" aria-labelledby="movieSortDropdown">
            <li v-for="opt in sortOptions" :key="opt.value">
              <a
                class="dropdown-item d-flex justify-content-between align-items-center"
                :class="{ active: sortBy === opt.value }"
                href="#"
                @click.prevent="selectSort(opt.value)"
              >
                <span>{{ opt.label }}</span>
                <span v-if="sortBy === opt.value" class="check-icon">✓</span>
              </a>
            </li>
          </ul>
        </div>

        <button
          v-if="selectedGenre || selectedLanguage || searchTxt"
          class="btn btn-reset-filters btn-sm rounded-pill"
          @click="resetFilters"
        >
          Reset Filters ✕
        </button>
      </div>
    </div>

    <!-- Genre Filter Pills -->
    <div class="genre-bar d-flex gap-2 overflow-auto pb-3 mb-4">
      <button
        :class="['genre-pill', { 'genre-pill--active': selectedGenre === null }]"
        @click="selectGenre(null)"
      >
        All Genres
      </button>
      <button
        v-for="genre in movieGenres"
        :key="genre.id"
        :class="['genre-pill', { 'genre-pill--active': selectedGenre === genre.id }]"
        @click="selectGenre(genre.id)"
      >
        {{ genre.name }}
      </button>
    </div>

    <!-- Active Filter Notice -->
    <div v-if="searchTxt" class="alert alert-info-custom d-flex justify-content-between align-items-center mb-4">
      <span>Searching for: <strong>"{{ searchTxt }}"</strong></span>
      <button class="btn btn-sm btn-link text-inherit p-0" @click="clearSearch">Clear Search</button>
    </div>

    <!-- Skeletons when initial data is loading -->
    <div class="row g-4" v-if="isLoadingInitial">
      <div v-for="n in 12" :key="n" class="col-6 col-sm-4 col-md-3 col-xl-2">
        <SkeletonCard />
      </div>
    </div>

    <!-- Movies Grid -->
    <div class="row g-4" v-else-if="filteredMovies.length > 0">
      <div
        v-for="item in filteredMovies"
        :key="item.id"
        class="col-6 col-sm-4 col-md-3 col-xl-2"
      >
        <div class="movie-card" @click="openDetails(item)">
          <div class="movie-card__poster-wrap">
            <img
              :src="getImageUrl(item.poster_path)"
              :alt="item.title"
              class="movie-card__poster"
              loading="lazy"
            />
            <div class="movie-card__rating">
              <RatingCircle :score="item.vote_average" :size="38" />
            </div>
            <div class="movie-card__hover-overlay">
              <span class="hover-play-btn">▶</span>
              <span class="hover-text">Details & Trailer</span>
            </div>
          </div>
          <div class="movie-card__info">
            <h6 class="movie-card__title" :title="item.title">{{ item.title }}</h6>
            <div class="d-flex justify-content-between align-items-center">
              <span class="movie-card__date">{{ formatDate(item.release_date) }}</span>
              <span class="badge badge-lang text-uppercase">{{ item.original_language || 'en' }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="text-center py-5 my-5">
      <div class="empty-icon mb-3">🎬</div>
      <h3>No Movies Found</h3>
      <p class="text-muted">Try adjusting your region, genre, or search filters.</p>
      <button class="btn btn-primary rounded-pill px-4" @click="resetFilters">Reset Filters</button>
    </div>

    <!-- Load More Skeletons or Button -->
    <div class="row g-4 mt-2" v-if="isLoadingMore">
      <div v-for="n in 6" :key="n" class="col-6 col-sm-4 col-md-3 col-xl-2">
        <SkeletonCard />
      </div>
    </div>

    <div class="text-center mt-5 mb-4" v-else-if="filteredMovies.length > 0">
      <button
        class="btn btn-load-more"
        @click="loadMore"
      >
        Load More Movies ▾
      </button>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import RatingCircle from "./RatingCircle.vue";
import SkeletonCard from "../common/SkeletonCard.vue";

export default {
  name: "moviesPage",
  components: {
    RatingCircle,
    SkeletonCard,
  },
  data() {
    return {
      selectedGenre: null,
      sortBy: "popularity.desc",
      currentPage: 1,
      isLoadingInitial: false,
      isLoadingMore: false,
      sortOptions: [
        { value: "popularity.desc", label: "Most Popular" },
        { value: "vote_average.desc", label: "Highest Rated" },
        { value: "release_date.desc", label: "Newest Releases" },
        { value: "title.asc", label: "Title (A-Z)" },
      ],
    };
  },
  computed: {
    ...mapState(["moviesData", "searchTxt", "movieGenres", "selectedLanguage"]),
    currentSortLabel() {
      const match = this.sortOptions.find((o) => o.value === this.sortBy);
      return match ? match.label : "Most Popular";
    },
    filteredMovies() {
      let list = [...this.moviesData];

      if (this.searchTxt && this.searchTxt.trim()) {
        const query = this.searchTxt.toLowerCase();
        list = list.filter(
          (m) =>
            (m.title && m.title.toLowerCase().includes(query)) ||
            (m.overview && m.overview.toLowerCase().includes(query))
        );
      }

      if (this.selectedGenre) {
        list = list.filter(
          (m) => m.genre_ids && m.genre_ids.includes(this.selectedGenre)
        );
      }

      return list;
    },
  },
  watch: {
    selectedLanguage() {
      this.fetchMoviesData();
    },
  },
  methods: {
    ...mapActions(["fetchData", "openDetailModal", "fetchGenres"]),
    getImageUrl(path) {
      if (!path) return require("@/assets/cinema_logo.jpg");
      return `https://image.tmdb.org/t/p/w500${path}`;
    },
    formatDate(dateStr) {
      if (!dateStr) return "N/A";
      const options = { year: "numeric", month: "short", day: "numeric" };
      return new Date(dateStr).toLocaleDateString("en-US", options);
    },
    openDetails(item) {
      this.openDetailModal({ item, type: "movie" });
    },
    clearSearch() {
      this.$store.commit("setSearchTxt", "");
    },
    selectGenre(id) {
      this.selectedGenre = id;
      this.currentPage = 1;
      this.fetchMoviesData();
    },
    selectSort(val) {
      this.sortBy = val;
      this.currentPage = 1;
      this.fetchMoviesData();
    },
    resetFilters() {
      this.selectedGenre = null;
      this.sortBy = "popularity.desc";
      this.$store.commit("setSelectedLanguage", "");
      this.clearSearch();
      this.currentPage = 1;
      this.fetchMoviesData();
    },
    async fetchMoviesData() {
      this.isLoadingInitial = true;
      try {
        await this.fetchData({
          apiType: "movies",
          page: 1,
          language: this.selectedLanguage,
          genre: this.selectedGenre,
          sortBy: this.sortBy,
        });
      } finally {
        this.isLoadingInitial = false;
      }
    },
    async loadMore() {
      this.isLoadingMore = true;
      this.currentPage += 1;
      try {
        await this.fetchData({
          apiType: "movies",
          page: this.currentPage,
          append: true,
          existing: this.moviesData,
          language: this.selectedLanguage,
          genre: this.selectedGenre,
          sortBy: this.sortBy,
        });
      } finally {
        this.isLoadingMore = false;
      }
    },
  },
  async mounted() {
    this.fetchMoviesData();
    this.fetchGenres();
  },
};
</script>

<style scoped>
.movies-view {
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

/* Custom Sort Dropdown */
.btn-custom-dropdown {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.85rem;
  border-radius: 20px;
  padding: 6px 16px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
  box-shadow: var(--card-shadow);
}

.btn-custom-dropdown:hover,
.btn-custom-dropdown[aria-expanded="true"] {
  border-color: var(--tmdb-cyan);
  background: rgba(6, 182, 212, 0.12);
  color: var(--text-primary);
  box-shadow: 0 0 12px var(--tmdb-cyan-glow);
}

.sort-icon {
  color: var(--tmdb-cyan);
  font-size: 0.9rem;
}

.dropdown-menu-custom {
  background: var(--bg-modal) !important;
  border: 1px solid var(--border-color) !important;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
  border-radius: 14px;
  padding: 6px;
  min-width: 180px;
  z-index: 1050;
}

.dropdown-menu-custom .dropdown-item {
  color: var(--text-primary);
  font-size: 0.86rem;
  font-weight: 600;
  padding: 8px 14px;
  border-radius: 8px;
  transition: all 0.15s ease;
}

.dropdown-menu-custom .dropdown-item:hover {
  background: rgba(6, 182, 212, 0.15);
  color: var(--tmdb-cyan);
}

.dropdown-menu-custom .dropdown-item.active {
  background: linear-gradient(135deg, var(--tmdb-cyan), var(--tmdb-green)) !important;
  color: #032541 !important;
  font-weight: 700;
}

.check-icon {
  font-weight: 900;
  font-size: 0.85rem;
}

.btn-reset-filters {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 6px 14px;
  transition: all 0.2s ease;
}

.btn-reset-filters:hover {
  background: rgba(239, 68, 68, 0.15);
  border-color: #ef4444;
  color: #ef4444;
}

.sort-select {
  background: var(--bg-secondary) !important;
  color: var(--text-primary) !important;
  border: 1px solid var(--border-color) !important;
  border-radius: 20px;
  padding: 6px 16px;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
}

/* Region Pills */
.region-bar {
  scrollbar-width: thin;
  scrollbar-color: rgba(6, 182, 212, 0.3) transparent;
}

.region-pill {
  background: var(--border-color);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.84rem;
  font-weight: 700;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

.region-pill:hover,
.region-pill--active {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.25), rgba(16, 185, 129, 0.25));
  border-color: var(--tmdb-cyan);
  color: var(--text-primary);
  box-shadow: 0 0 10px var(--tmdb-cyan-glow);
}

/* Genre Pills */
.genre-bar {
  scrollbar-width: thin;
  scrollbar-color: rgba(6, 182, 212, 0.3) transparent;
}

.genre-pill {
  background: var(--border-color);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  padding: 5px 14px;
  border-radius: 18px;
  font-size: 0.8rem;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

.genre-pill:hover,
.genre-pill--active {
  background: rgba(6, 182, 212, 0.15);
  border-color: var(--tmdb-cyan);
  color: var(--text-primary);
}

.alert-info-custom {
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid rgba(6, 182, 212, 0.4);
  color: var(--text-primary);
  border-radius: 12px;
  padding: 10px 18px;
}

.movie-card {
  cursor: pointer;
  transition: transform 0.25s ease;
}

.movie-card:hover {
  transform: translateY(-6px);
}

.movie-card__poster-wrap {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  box-shadow: var(--card-shadow);
  background: var(--border-color);
  aspect-ratio: 2/3;
}

.movie-card__poster {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}

.movie-card:hover .movie-card__poster {
  transform: scale(1.06);
}

.movie-card__hover-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(11, 17, 32, 0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.25s ease;
  backdrop-filter: blur(2px);
}

.movie-card:hover .movie-card__hover-overlay {
  opacity: 1;
}

.hover-play-btn {
  font-size: 2rem;
  color: var(--tmdb-cyan);
  margin-bottom: 6px;
}

.hover-text {
  font-size: 0.75rem;
  font-weight: 700;
  color: #fff;
}

.movie-card__rating {
  position: absolute;
  bottom: -14px;
  left: 12px;
  z-index: 2;
}

.movie-card__info {
  margin-top: 22px;
  padding: 0 4px;
  min-height: 52px;
  max-height: 52px;
  overflow: hidden;
}

.movie-card__title {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.movie-card__date {
  font-size: 0.76rem;
  color: var(--text-secondary);
}

.badge-lang {
  background: var(--border-color);
  color: var(--tmdb-cyan);
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
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
  background: var(--tmdb-gradient);
  color: #0b1120;
  border-color: transparent;
  transform: translateY(-2px);
}

.empty-icon {
  font-size: 3rem;
}
</style>