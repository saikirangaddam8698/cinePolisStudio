<template>
  <div class="cinematic-app d-flex flex-column min-vh-100" :data-theme="currentTheme">
    <!-- Premium Navigation Bar -->
    <header class="app-header sticky-top">
      <div class="container-fluid px-2 px-sm-3 px-md-4 py-2">
        <div class="d-flex align-items-center justify-content-between">
          
          <!-- Left: Brand Logo & Navigation Links (Single instance) -->
          <div class="d-flex align-items-center gap-3">
            <!-- Brand Logo -->
            <router-link to="/" class="navbar-brand d-flex align-items-center gap-2 me-2">
              <div class="brand-logo-glow">
                <span class="brand-icon">🎬</span>
              </div>
              <div class="brand-text">
                <span class="brand-name">CinePolis</span>
                <span class="brand-badge">STUDIO</span>
              </div>
            </router-link>

            <!-- Nav Links (Desktop Only - Only rendered once!) -->
            <nav class="d-none d-lg-flex align-items-center gap-1">
              <router-link to="/" class="nav-item-link" active-class="nav-item-link--active" exact>
                Home
              </router-link>
              <router-link to="/moviespage" class="nav-item-link" active-class="nav-item-link--active">
                Movies
              </router-link>
              <router-link to="/tvshowspage" class="nav-item-link" active-class="nav-item-link--active">
                TV Shows
              </router-link>
              <router-link to="/actorspage" class="nav-item-link" active-class="nav-item-link--active">
                Actors
              </router-link>

              <!-- Region / Language Dropdown Filter -->
              <div class="dropdown ms-1">
                <button
                  class="btn btn-region-dropdown dropdown-toggle"
                  type="button"
                  id="regionDropdown"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <span class="globe-icon">🌐</span>
                  <span>{{ currentRegionLabel }}</span>
                </button>
                <ul class="dropdown-menu dropdown-menu-custom shadow" aria-labelledby="regionDropdown">
                  <li v-for="reg in regionsList" :key="reg.code">
                    <a
                      class="dropdown-item d-flex justify-content-between align-items-center"
                      :class="{ active: selectedLanguage === reg.code }"
                      href="#"
                      @click.prevent="selectRegion(reg)"
                    >
                      <span>{{ reg.flag }} {{ reg.name }}</span>
                      <small class="text-muted ms-2">{{ reg.sub }}</small>
                    </a>
                  </li>
                </ul>
              </div>
            </nav>
          </div>

          <!-- Right: Search Bar + Theme Toggle + Ask AI + Mobile Menu Toggle -->
          <div class="d-flex align-items-center gap-1 gap-sm-2 gap-md-3">
            <!-- Search bar with responsive max width -->
            <div class="search-nav-box">
              <searchPage />
            </div>

            <!-- Theme Switcher (Dark / Light) -->
            <button
              class="btn btn-theme-toggle"
              @click="toggleTheme"
              :title="currentTheme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'"
              aria-label="Toggle Theme"
            >
              <span v-if="currentTheme === 'dark'">☀️</span>
              <span v-else>🌙</span>
            </button>

            <!-- Ask AI Button (Spacious, Uncropped) -->
            <button
              class="btn btn-ai-nav"
              @click="openCineBot"
              title="Open AI Concierge"
            >
              <span class="sparkle-gemini">✨</span>
              <span class="ai-text d-none d-sm-inline">Ask AI</span>
            </button>

            <!-- Mobile Hamburger Button -->
            <button
              class="btn btn-mobile-toggle d-lg-none"
              type="button"
              @click="isMobileOpen = !isMobileOpen"
              aria-label="Toggle Navigation"
            >
              ☰
            </button>
          </div>

        </div>

        <!-- Mobile Drawer (Only visible when isMobileOpen is true) -->
        <div v-if="isMobileOpen" class="mobile-nav-panel d-lg-none mt-3 p-3 rounded-3 shadow">
          <ul class="list-unstyled mb-0 d-flex flex-column gap-2">
            <li>
              <router-link to="/" class="mobile-nav-link" @click="isMobileOpen = false" exact>
                Home
              </router-link>
            </li>
            <li>
              <router-link to="/moviespage" class="mobile-nav-link" @click="isMobileOpen = false">
                Movies
              </router-link>
            </li>
            <li>
              <router-link to="/tvshowspage" class="mobile-nav-link" @click="isMobileOpen = false">
                TV Shows
              </router-link>
            </li>
            <li>
              <router-link to="/actorspage" class="mobile-nav-link" @click="isMobileOpen = false">
                Actors
              </router-link>
            </li>
          </ul>
        </div>

      </div>
    </header>

    <!-- Mobile & Tablet Quick Region Bar (Outside header, directly above page lists) -->
    <div class="mobile-region-bar d-lg-none">
      <div class="container-fluid px-2 px-sm-3 py-2 d-flex align-items-center gap-2 overflow-hidden">
        <!-- Region Dropdown Picker -->
        <div class="dropdown flex-shrink-0">
          <button
            class="btn btn-mobile-region-dropdown dropdown-toggle"
            type="button"
            id="mobileRegionDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            <span class="globe-icon">🌐</span>
            <span class="mobile-region-label">{{ currentRegionLabel }}</span>
          </button>
          <ul class="dropdown-menu dropdown-menu-custom shadow" aria-labelledby="mobileRegionDropdown">
            <li v-for="reg in regionsList" :key="reg.code">
              <a
                class="dropdown-item d-flex justify-content-between align-items-center"
                :class="{ active: selectedLanguage === reg.code }"
                href="#"
                @click.prevent="selectRegion(reg)"
              >
                <span>{{ reg.flag }} {{ reg.name }}</span>
                <small class="text-muted ms-2">{{ reg.sub }}</small>
              </a>
            </li>
          </ul>
        </div>

        <!-- Quick Tap Region Pills (Horizontal Scroll) -->
        <div class="mobile-region-chips flex-grow-1 d-flex align-items-center gap-1 overflow-auto">
          <button
            v-for="reg in regionsList"
            :key="reg.code"
            :class="['mobile-chip', { 'mobile-chip--active': selectedLanguage === reg.code }]"
            @click="selectRegion(reg)"
          >
            <span>{{ reg.flag }}</span>
            <span>{{ reg.name.split(' ')[0] }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Main Dynamic Route View -->
    <main class="flex-grow-1">
      <router-view></router-view>
    </main>

    <!-- Global Movie / TV Show Details Modal with Trailer & AI Insights -->
    <MovieModal />

    <!-- Global Floating AI CineBot -->
    <GeminiChatModal ref="cineBot" />

    <!-- Premium Cinematic Footer -->
    <footer class="app-footer mt-auto py-5">
      <div class="container px-4 px-md-5">
        <div class="row g-4 align-items-center justify-content-between mb-4">
          <div class="col-12 col-md-4 text-center text-md-start">
            <div class="d-flex align-items-center justify-content-center justify-content-md-start gap-2 mb-2">
              <span class="footer-logo">🎬 CinePolis STUDIO</span>
              <span class="footer-ai-pill">✨ Gemini 3.5 Flash</span>
            </div>
            <p class="footer-desc mb-0">
              Your ultimate gateway to cinematic discovery. Powered by CinePolis Studio intelligence and Google Gemini AI.
            </p>
          </div>

          <div class="col-12 col-md-6">
            <div class="row text-center text-md-start">
              <div class="col-4">
                <h6 class="footer-col-title">NAVIGATION</h6>
                <ul class="list-unstyled footer-links">
                  <li><router-link to="/">Home</router-link></li>
                  <li><router-link to="/moviespage">Movies</router-link></li>
                  <li><router-link to="/tvshowspage">TV Shows</router-link></li>
                  <li><router-link to="/actorspage">Actors</router-link></li>
                </ul>
              </div>

              <div class="col-4">
                <h6 class="footer-col-title">REGIONS</h6>
                <ul class="list-unstyled footer-links">
                  <li><a href="#" @click.prevent="selectRegion({ code: 'en', name: 'Hollywood (US)' })">Hollywood</a></li>
                  <li><a href="#" @click.prevent="selectRegion({ code: 'hi', name: 'Bollywood (IN)' })">Bollywood</a></li>
                  <li><a href="#" @click.prevent="selectRegion({ code: 'te', name: 'Tollywood (IN)' })">Tollywood</a></li>
                  <li><a href="#" @click.prevent="selectRegion({ code: 'ko', name: 'K-Drama' })">K-Drama</a></li>
                </ul>
              </div>

              <div class="col-4">
                <h6 class="footer-col-title">LEGAL & DATA</h6>
                <ul class="list-unstyled footer-links">
                  <li><router-link to="/abouttmbd">About CinePolis Studio</router-link></li>
                  <li><router-link to="/termspage">Terms of Use</router-link></li>
                  <li><router-link to="/guidlinespage">Guidelines</router-link></li>
                  <li><router-link to="/contactus">Contact Us</router-link></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="footer-bottom pt-4 border-top border-secondary border-opacity-25 d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
          <p class="mb-0 text-muted small">
            © 2026 CinePolis Studio. All rights reserved. Powered by CinePolis Studio & Gemini AI.
          </p>
          <div class="d-flex gap-3 small text-muted">
            <span>Themes: Dark & Light Supported</span>
          </div>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
import { mapState } from "vuex";
import searchPage from "./components/tmbd/searchPage.vue";
import MovieModal from "./components/tmbd/MovieModal.vue";
import GeminiChatModal from "./components/tmbd/GeminiChatModal.vue";

export default {
  name: "App",
  components: {
    searchPage,
    MovieModal,
    GeminiChatModal,
  },
  data() {
    return {
      currentTheme: localStorage.getItem("app_theme") || "dark",
      isMobileOpen: false,
      regionsList: [
        { code: "", name: "All Regions", flag: "🌐", sub: "Global" },
        { code: "en", name: "Hollywood (US)", flag: "🇺🇸", sub: "English" },
        { code: "hi", name: "Bollywood (IN)", flag: "🇮🇳", sub: "Hindi" },
        { code: "te", name: "Tollywood (IN)", flag: "🇮🇳", sub: "Telugu" },
        { code: "ta", name: "Kollywood (IN)", flag: "🇮🇳", sub: "Tamil" },
        { code: "ko", name: "Korean / K-Drama", flag: "🇰🇷", sub: "Korean" },
        { code: "ja", name: "Japan / Anime", flag: "🇯🇵", sub: "Japanese" },
        { code: "es", name: "Spanish / Latin", flag: "🇪🇸", sub: "Spanish" },
        { code: "fr", name: "French Cinema", flag: "🇫🇷", sub: "French" },
      ],
    };
  },
  computed: {
    ...mapState(["selectedLanguage"]),
    currentRegionLabel() {
      const match = this.regionsList.find((r) => r.code === this.selectedLanguage);
      return match ? match.name : "All Regions";
    },
  },
  watch: {
    currentTheme(newTheme) {
      document.documentElement.setAttribute("data-theme", newTheme);
      localStorage.setItem("app_theme", newTheme);
    },
    $route(to) {
      // Default to "All Regions" when on Home page
      if (to.name === "homePagee") {
        this.$store.commit("setSelectedLanguage", "");
      }
    },
  },
  methods: {
    toggleTheme() {
      this.currentTheme = this.currentTheme === "dark" ? "light" : "dark";
    },
    selectRegion(region) {
      const code = region.code;
      this.$store.commit("setSelectedLanguage", code);
      const currentRoute = this.$route.name;

      if (currentRoute === "homePagee") {
        // Shift to movies only when in Home
        this.$store.dispatch("fetchData", {
          apiType: "movies",
          page: 1,
          language: code,
        });
        this.$router.push({ name: "moviesPage" });
      } else if (currentRoute === "moviesPage") {
        // In Movies: filter movies without shifting
        this.$store.dispatch("fetchData", {
          apiType: "movies",
          page: 1,
          language: code,
        });
      } else if (currentRoute === "tvshowsPage") {
        // In TV Shows: filter tv shows without shifting
        this.$store.dispatch("fetchData", {
          apiType: "tvshows",
          page: 1,
          language: code,
        });
      } else if (currentRoute === "actorsPage") {
        // In Actors: filter actors based on country/region
        this.$store.dispatch("fetchActorsByRegion", code);
      } else {
        this.$store.dispatch("fetchData", {
          apiType: "movies",
          page: 1,
          language: code,
        });
        this.$router.push({ name: "moviesPage" });
      }
    },
    onMobileRegionChange(code) {
      const reg = this.regionsList.find((r) => r.code === code) || { code: "" };
      this.selectRegion(reg);
      this.isMobileOpen = false;
    },
    openCineBot() {
      if (this.$refs.cineBot) {
        if (!this.$refs.cineBot.isOpen) {
          this.$refs.cineBot.toggleChat();
        }
      }
    },
  },
  mounted() {
    document.documentElement.setAttribute("data-theme", this.currentTheme);
  },
};
</script>

<style scoped>
.cinematic-app {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: "Outfit", "Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Header */
.app-header {
  background: var(--bg-secondary);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border-color);
  z-index: 1000;
  transition: background-color 0.3s ease, border-color 0.3s ease;
}

.brand-logo-glow {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: linear-gradient(135deg, var(--tmdb-cyan) 0%, var(--tmdb-green) 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 14px var(--tmdb-cyan-glow);
  flex-shrink: 0;
}

.brand-icon {
  font-size: 18px;
}

.brand-name {
  font-size: 1.35rem;
  font-weight: 900;
  letter-spacing: -0.5px;
  background: var(--tmdb-gradient);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.brand-badge {
  font-size: 0.62rem;
  font-weight: 800;
  color: var(--text-muted);
  letter-spacing: 1px;
  margin-left: 4px;
}

/* Navigation Links */
.nav-item-link {
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.92rem;
  padding: 6px 12px;
  border-radius: 8px;
  transition: all 0.2s ease;
  text-decoration: none;
  white-space: nowrap;
}

.nav-item-link:hover {
  color: var(--tmdb-cyan);
  background: rgba(6, 182, 212, 0.08);
}

.nav-item-link--active {
  color: var(--text-primary) !important;
  background: rgba(6, 182, 212, 0.15) !important;
  border-bottom: 2px solid var(--tmdb-cyan);
}

/* Region Dropdown */
.btn-region-dropdown {
  background: var(--border-color);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.85rem;
  border-radius: 20px;
  padding: 5px 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: all 0.2s ease;
}

.btn-region-dropdown:hover {
  color: var(--text-primary);
  border-color: var(--tmdb-cyan);
  background: rgba(6, 182, 212, 0.1);
}

.dropdown-menu-custom {
  background: var(--bg-modal) !important;
  border: 1px solid var(--border-color) !important;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.4);
  border-radius: 12px;
  max-height: 340px;
  overflow-y: auto;
}

.dropdown-menu-custom .dropdown-item {
  color: var(--text-primary) !important;
  font-size: 0.86rem;
  padding: 7px 14px;
}

.dropdown-menu-custom .dropdown-item:hover,
.dropdown-menu-custom .dropdown-item.active {
  background: rgba(6, 182, 212, 0.18) !important;
  color: var(--tmdb-cyan) !important;
}

/* Search Nav Box */
.search-nav-box {
  width: 220px;
  max-width: 240px;
}

@media (max-width: 768px) {
  .search-nav-box {
    width: 140px;
  }
}

/* Theme Toggle Button */
.btn-theme-toggle {
  background: var(--border-color);
  border: 1px solid var(--border-color);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: all 0.2s ease;
  color: var(--text-primary);
}

.btn-theme-toggle:hover {
  transform: scale(1.08);
  background: rgba(6, 182, 212, 0.15);
}

/* Ask AI Button: spacious, uncropped, non-breaking */
.btn-ai-nav {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.18), rgba(16, 185, 129, 0.18));
  border: 1.5px solid rgba(16, 185, 129, 0.5);
  color: var(--tmdb-green);
  font-weight: 800;
  font-size: 0.88rem;
  padding: 6px 16px !important;
  border-radius: 25px;
  display: inline-flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 6px;
  white-space: nowrap !important;
  flex-shrink: 0 !important;
  height: 36px;
  transition: all 0.25s ease;
}

[data-theme="light"] .btn-ai-nav {
  color: #047857;
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.15), rgba(16, 185, 129, 0.25));
  border-color: #10b981;
}

.btn-ai-nav:hover {
  background: var(--tmdb-gradient);
  color: #0b1120 !important;
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(6, 182, 212, 0.4);
  border-color: transparent;
}

.sparkle-gemini {
  font-size: 14px;
}

.ai-text {
  letter-spacing: 0.3px;
}

/* Mobile Toggle */
.btn-mobile-toggle {
  background: var(--border-color);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-nav-panel {
  background: var(--bg-modal);
  border: 1px solid var(--border-color);
}

.mobile-nav-link {
  display: block;
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 8px;
}

.mobile-nav-link:hover {
  background: rgba(6, 182, 212, 0.1);
  color: var(--tmdb-cyan);
}

/* Mobile & Tablet Region Bar - Sticky outside header above content */
.mobile-region-bar {
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: sticky;
  top: 54px;
  z-index: 1010;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  width: 100%;
  max-width: 100vw;
  overflow-x: hidden;
}

.btn-mobile-region-dropdown {
  background: var(--border-color);
  border: 1px solid var(--border-color);
  color: var(--text-primary);
  font-size: 0.78rem;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 5px;
  white-space: nowrap;
}

.btn-mobile-region-dropdown:hover,
.btn-mobile-region-dropdown:focus {
  border-color: var(--tmdb-cyan);
  color: var(--text-primary);
}

.mobile-region-chips {
  flex: 1 1 0% !important;
  min-width: 0 !important;
  width: 100%;
  overflow-x: auto !important;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

@media (max-width: 576px) {
  .brand-name {
    font-size: 1.15rem;
  }
  .brand-badge {
    display: none;
  }
  .brand-logo-glow {
    width: 32px;
    height: 32px;
    border-radius: 8px;
  }
  .brand-icon {
    font-size: 15px;
  }
  .search-nav-box {
    width: 120px;
  }
  .btn-ai-nav {
    padding: 4px 10px !important;
    height: 32px;
    font-size: 0.8rem;
  }
  .btn-theme-toggle,
  .btn-mobile-toggle {
    width: 32px;
    height: 32px;
  }
}

@media (max-width: 380px) {
  .brand-name {
    font-size: 1.05rem;
  }
  .search-nav-box {
    width: 95px;
  }
}

.mobile-region-chips::-webkit-scrollbar {
  display: none;
}

.mobile-chip {
  background: var(--border-color);
  border: 1px solid var(--border-color);
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 10px;
  border-radius: 16px;
  white-space: nowrap;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.mobile-chip:hover,
.mobile-chip--active {
  background: rgba(6, 182, 212, 0.2);
  border-color: var(--tmdb-cyan);
  color: var(--tmdb-cyan);
  font-weight: 700;
}

/* Footer */
.app-footer {
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-color);
  transition: background-color 0.3s ease;
}

.footer-logo {
  font-weight: 800;
  font-size: 1.15rem;
  letter-spacing: 0.5px;
  color: var(--text-primary);
}

.footer-ai-pill {
  font-size: 0.68rem;
  font-weight: 800;
  background: rgba(6, 182, 212, 0.15);
  color: var(--tmdb-cyan);
  padding: 2px 8px;
  border-radius: 12px;
}

.footer-desc {
  font-size: 0.85rem;
  max-width: 320px;
  color: var(--text-secondary);
}

.footer-col-title {
  font-size: 0.75rem;
  font-weight: 800;
  color: var(--text-muted);
  letter-spacing: 1px;
  margin-bottom: 1rem;
}

.footer-links li {
  margin-bottom: 0.5rem;
}

.footer-links a {
  color: var(--text-secondary);
  text-decoration: none;
  font-size: 0.85rem;
  transition: color 0.2s ease;
}

.footer-links a:hover {
  color: var(--tmdb-cyan);
}
</style>
