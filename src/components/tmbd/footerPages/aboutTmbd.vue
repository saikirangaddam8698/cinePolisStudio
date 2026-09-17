<template>
  <div class="legal-page-container container-fluid px-4 px-md-5 py-5">
    <div class="legal-content-wrapper mx-auto">
      
      <!-- Hero Banner -->
      <div class="legal-hero text-center mb-5">
        <div class="legal-badge mb-2">
          <span>🎬 ABOUT CINEPOLIS STUDIO</span>
        </div>
        <h1 class="legal-title mb-3">The Next Generation of Cinematic Discovery</h1>
        <p class="legal-lead text-muted mx-auto">
          CinePolis Studio is a modern, AI-powered entertainment destination bringing together the world of cinema—from Hollywood blockbusters and Indian regional powerhouses (Tollywood, Bollywood, Kollywood) to Asian K-Dramas and Japanese Anime.
        </p>
      </div>

      <!-- Key Pillars Grid -->
      <div class="row g-4 mb-5">
        <div class="col-12 col-md-4">
          <div class="legal-card h-100 p-4">
            <div class="card-icon-glow mb-3">🌐</div>
            <h4 class="card-title">Global Cinematic Reach</h4>
            <p class="card-text text-muted mb-0">
              Discover localized cinema across continents with seamless region filtering. Experience Tollywood, Bollywood, Kollywood, Hollywood, K-Drama, and Anime with real-time updates and native titles.
            </p>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="legal-card h-100 p-4">
            <div class="card-icon-glow mb-3">✨</div>
            <h4 class="card-title">Google Gemini 3.5 AI</h4>
            <p class="card-text text-muted mb-0">
              Elevate movie night with intelligent AI mood matching, custom watchlist generation, and instant answering of trivia or "Why watch?" insights powered by Google Gemini 3.5 Flash.
            </p>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="legal-card h-100 p-4">
            <div class="card-icon-glow mb-3">🎥</div>
            <h4 class="card-title">Rich Metadata & Trailers</h4>
            <p class="card-text text-muted mb-0">
              Powered by comprehensive film archives and YouTube trailer streams, enjoy high-resolution posters, detailed cast filmographies, and unified community ratings in both dark and light modes.
            </p>
          </div>
        </div>
      </div>

      <!-- Platform Stats -->
      <div class="stats-banner p-4 p-md-5 rounded-4 mb-5 text-center">
        <div class="row g-4 align-items-center">
          <div class="col-6 col-md-3">
            <div class="stat-number">1,000,000+</div>
            <div class="stat-label">Movies & Shows</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-number">180+</div>
            <div class="stat-label">Global Regions</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-number">Gemini 3.5</div>
            <div class="stat-label">AI Intelligence</div>
          </div>
          <div class="col-6 col-md-3">
            <div class="stat-number">100%</div>
            <div class="stat-label">Community Focused</div>
          </div>
        </div>
      </div>

      <!-- Mission Statement -->
      <div class="legal-card p-4 p-md-5 mb-4">
        <h3 class="section-title mb-3">Our Mission & Community Commitment</h3>
        <p class="text-secondary leading-relaxed mb-3">
          At CinePolis Studio, we believe storytelling is the universal language that connects cultures across the globe. Whether you are exploring vintage Tollywood classics, streaming the newest K-Drama series, or discovering hidden sci-fi indie gems, our goal is to eliminate decision fatigue and make movie discovery an inspiring, interactive ritual.
        </p>
        <p class="text-secondary leading-relaxed mb-0">
          Every piece of metadata, trailer embed, and AI recommendation is optimized for high performance, accessibility, and visual elegance across all devices. Thank you for making CinePolis Studio your trusted entertainment companion.
        </p>
      </div>

      <!-- Quick Action Navigation -->
      <div class="d-flex justify-content-center gap-3 mt-4">
        <router-link to="/moviespage" class="btn btn-primary rounded-pill px-4 py-2">
          Explore Movies 🎬
        </router-link>
        <router-link to="/contactus" class="btn btn-outline-secondary rounded-pill px-4 py-2">
          Contact CinePolis Studio ✉️
        </router-link>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "aboutTmbd",
};
</script>

<style scoped>
.legal-page-container {
  background: var(--bg-primary);
  min-height: 85vh;
  color: var(--text-primary);
  transition: background-color 0.3s ease, color 0.3s ease;
}

.legal-content-wrapper {
  max-width: 960px;
}

.legal-badge {
  display: inline-block;
  background: rgba(6, 182, 212, 0.15);
  border: 1px solid var(--tmdb-cyan);
  color: var(--tmdb-cyan);
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.5px;
}

.legal-title {
  font-size: 2.3rem;
  font-weight: 800;
  color: var(--text-primary);
}

.legal-lead {
  font-size: 1.05rem;
  line-height: 1.6;
  max-width: 720px;
}

.legal-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: var(--card-shadow);
  transition: all 0.25s ease;
}

.legal-card:hover {
  border-color: var(--tmdb-cyan);
  transform: translateY(-3px);
}

.card-icon-glow {
  font-size: 2rem;
  display: inline-block;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.stats-banner {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.12), rgba(16, 185, 129, 0.12));
  border: 1px solid rgba(6, 182, 212, 0.3);
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 900;
  background: linear-gradient(135deg, var(--tmdb-cyan), var(--tmdb-green));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--text-secondary);
}

.section-title {
  font-size: 1.4rem;
  font-weight: 800;
  color: var(--text-primary);
}

.leading-relaxed {
  line-height: 1.7;
}
</style>