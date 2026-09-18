<template>
  <div class="search-container position-relative" ref="searchWrapper">
    <div class="search-bar d-flex align-items-center">
      <span class="search-icon">🔍</span>
      <input
        type="text"
        placeholder="Search movies, TV shows, actors..."
        class="search-input form-control"
        v-model="query"
        @input="onInput"
        @focus="isFocused = true"
        @keyup.enter="handleEnter"
      />
      <button v-if="query" class="clear-btn" @click="clearSearch" title="Clear">✕</button>
    </div>

    <!-- Live Autocomplete Dropdown -->
    <div
      v-if="isFocused && (searchResults.length > 0 || isSearching)"
      class="search-dropdown shadow-2xl animate-fade-in"
    >
      <div v-if="isSearching" class="p-3 text-center text-muted">
        <div class="spinner-border spinner-border-sm text-info me-2"></div>
        Searching catalog...
      </div>

      <div v-else class="results-list">
        <div
          v-for="item in searchResults.slice(0, 7)"
          :key="item.id"
          class="result-item d-flex align-items-center gap-3 p-2"
          @click="selectItem(item)"
        >
          <img
            :src="getItemThumbnail(item)"
            :alt="getItemTitle(item)"
            class="result-thumb"
          />
          <div class="result-info flex-grow-1">
            <div class="result-title">{{ getItemTitle(item) }}</div>
            <div class="result-meta">
              <span class="badge badge-media-type me-2">{{ item.media_type }}</span>
              <span>{{ getItemDate(item) }}</span>
            </div>
          </div>
          <div class="result-arrow">↗</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";

export default {
  name: "searchPage",
  data() {
    return {
      query: "",
      isFocused: false,
      debounceTimer: null,
    };
  },
  computed: {
    ...mapState(["searchResults", "isSearching"]),
  },
  methods: {
    ...mapActions(["searchMulti", "openDetailModal"]),
    onInput() {
      this.$store.commit("setSearchTxt", this.query);
      clearTimeout(this.debounceTimer);
      if (!this.query.trim() || this.query.length < 2) {
        this.$store.commit("setSearchResults", []);
        return;
      }
      this.debounceTimer = setTimeout(() => {
        this.searchMulti(this.query.trim());
      }, 300);
    },
    handleEnter() {
      if (this.query.trim()) {
        this.isFocused = false;
        if (this.$route.name !== "moviesPage") {
          this.$router.push({ name: "moviesPage" });
        }
      }
    },
    selectItem(item) {
      this.isFocused = false;
      if (item.media_type === "person") {
        this.$store.commit("setSearchTxt", item.name);
        this.$router.push({ name: "actorsPage" });
      } else {
        this.openDetailModal({ item, type: item.media_type || "movie" });
      }
    },
    clearSearch() {
      this.query = "";
      this.$store.commit("setSearchTxt", "");
      this.$store.commit("setSearchResults", []);
    },
    getItemTitle(item) {
      return item.title || item.name || "Unknown";
    },
    getItemDate(item) {
      const d = item.release_date || item.first_air_date;
      return d ? d.split("-")[0] : (item.known_for_department || "");
    },
    getItemThumbnail(item) {
      const path = item.poster_path || item.profile_path;
      if (!path) return require("@/assets/cinema_logo.jpg");
      return `https://image.tmdb.org/t/p/w92${path}`;
    },
    handleClickOutside(e) {
      if (this.$refs.searchWrapper && !this.$refs.searchWrapper.contains(e.target)) {
        this.isFocused = false;
      }
    },
  },
  mounted() {
    document.addEventListener("click", this.handleClickOutside);
  },
  beforeUnmount() {
    document.removeEventListener("click", this.handleClickOutside);
  },
};
</script>

<style scoped>
.search-container {
  width: 100%;
  max-width: 380px;
}

.search-bar {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 25px;
  padding: 4px 14px;
  transition: all 0.2s ease;
}

.search-bar:focus-within {
  border-color: var(--tmdb-cyan);
  box-shadow: 0 0 15px var(--tmdb-cyan-glow);
}

.search-icon {
  font-size: 13px;
  margin-right: 8px;
  opacity: 0.7;
}

.search-input {
  background: transparent !important;
  border: none !important;
  color: var(--text-primary) !important;
  font-size: 0.88rem;
  padding: 4px 0;
  box-shadow: none !important;
}

.search-input::placeholder {
  color: var(--text-secondary);
}

.clear-btn {
  background: none;
  border: none;
  color: var(--text-secondary);
  font-size: 12px;
  cursor: pointer;
  padding: 0 4px;
}

.clear-btn:hover {
  color: var(--text-primary);
}

.search-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: var(--bg-card);
  backdrop-filter: blur(16px);
  border: 1px solid var(--border-highlight);
  border-radius: 14px;
  z-index: 1000;
  max-height: 400px;
  overflow-y: auto;
  box-shadow: var(--card-shadow);
}

.result-item {
  cursor: pointer;
  border-bottom: 1px solid var(--border-color);
  transition: background 0.15s ease;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item:hover {
  background: rgba(6, 182, 212, 0.15);
}

.result-thumb {
  width: 40px;
  height: 55px;
  object-fit: cover;
  border-radius: 6px;
  flex-shrink: 0;
}

.result-title {
  color: var(--text-primary);
  font-weight: 600;
  font-size: 0.88rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 230px;
}

.result-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
  display: flex;
  align-items: center;
}

.badge-media-type {
  background: rgba(6, 182, 212, 0.2);
  color: var(--tmdb-cyan);
  text-transform: uppercase;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 4px;
}

.result-arrow {
  color: var(--tmdb-green);
  font-size: 0.9rem;
  margin-right: 6px;
}
</style>