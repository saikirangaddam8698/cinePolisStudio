<template>
  <div class="legal-page-container container-fluid px-4 px-md-5 py-5">
    <div class="legal-content-wrapper mx-auto">
      
      <!-- Page Header -->
      <div class="mb-5 pb-3 border-bottom border-secondary border-opacity-25">
        <div class="legal-badge mb-2">
          <span>📜 LEGAL DOCUMENTATION</span>
        </div>
        <h1 class="legal-title mb-2">Terms of Service</h1>
        <p class="text-muted mb-0">
          Last updated: September 2026 • CinePolis Studio Entertainment Platform
        </p>
      </div>

      <!-- Introduction Card -->
      <div class="legal-card p-4 p-md-5 mb-4">
        <h3 class="section-title mb-3">1. Acceptance of Terms</h3>
        <p class="text-secondary leading-relaxed mb-0">
          Welcome to CinePolis Studio ("we", "us", or "our"). By accessing or using our website, AI concierge, mood discovery engines, or entertainment catalog (collectively, the "Services"), you acknowledge and agree to comply with and be bound by these Terms of Service. If you do not agree to these terms, please do not use our Services.
        </p>
      </div>

      <!-- Services & Metadata Card -->
      <div class="legal-card p-4 p-md-5 mb-4">
        <h3 class="section-title mb-3">2. CinePolis Studio Services & Media</h3>
        <p class="text-secondary leading-relaxed mb-3">
          CinePolis Studio provides movie, TV show, and actor discovery features, video trailers, ratings, and AI-driven conversational guidance. The platform utilizes licensed metadata, high-resolution imagery, and public YouTube streaming players for trailers.
        </p>
        <ul class="text-secondary ps-3 mb-0 leading-relaxed">
          <li class="mb-2">Services are intended solely for personal, non-commercial entertainment and research.</li>
          <li class="mb-2">You agree not to scrape, reverse engineer, or deploy automated bots that compromise service integrity or exceed API rate boundaries.</li>
          <li>Trailer videos and third-party media remain the property of their respective film distributors and studios.</li>
        </ul>
      </div>

      <!-- AI Features & Gemini -->
      <div class="legal-card p-4 p-md-5 mb-4">
        <h3 class="section-title mb-3">3. Artificial Intelligence & Gemini 3.5 Features</h3>
        <p class="text-secondary leading-relaxed mb-0">
          Our platform integrates Google Gemini 3.5 Flash to power the CineBot Concierge, contextual plot analysis, and the AI Mood Matcher. AI-generated responses are provided for creative entertainment purposes. While we strive for accuracy in cast credits, trivia, and release dates, CinePolis Studio does not guarantee absolute precision for generated film interpretations.
        </p>
      </div>

      <!-- User Conduct & Community Safety -->
      <div class="legal-card p-4 p-md-5 mb-4">
        <h3 class="section-title mb-3">4. User Conduct & Acceptable Use</h3>
        <p class="text-secondary leading-relaxed mb-3">
          When submitting search queries, conversational prompts to CineBot, or interacting with community features, you agree not to:
        </p>
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <div class="rule-box p-3 rounded-3">
              <span class="text-danger me-2">✕</span> Submit abusive, offensive, or infringing content.
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="rule-box p-3 rounded-3">
              <span class="text-danger me-2">✕</span> Exploit or inject unauthorized malicious scripts or keys.
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="rule-box p-3 rounded-3">
              <span class="text-danger me-2">✕</span> Attempt to bypass rate limits or system security features.
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="rule-box p-3 rounded-3">
              <span class="text-danger me-2">✕</span> Misrepresent affiliation with CinePolis Studio or copyright holders.
            </div>
          </div>
        </div>
      </div>

      <!-- Limitation of Liability -->
      <div class="legal-card p-4 p-md-5 mb-4">
        <h3 class="section-title mb-3">5. Disclaimer & Limitation of Liability</h3>
        <p class="text-secondary leading-relaxed mb-0">
          The Services and all materials, metadata, and AI interactions are provided on an "as is" and "as available" basis without warranty of any kind. In no event shall CinePolis Studio or its creators be liable for indirect, incidental, or consequential damages resulting from the use or inability to use the platform.
        </p>
      </div>

      <!-- Back Navigation -->
      <div class="d-flex justify-content-between align-items-center mt-5 pt-3 border-top border-secondary border-opacity-25">
        <router-link to="/" class="btn btn-outline-secondary rounded-pill px-4">
          ← Return Home
        </router-link>
        <router-link to="/guidlinespage" class="btn btn-primary rounded-pill px-4">
          Read Community Guidelines →
        </router-link>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "termsPage",
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
  max-width: 900px;
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

.legal-card {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: var(--card-shadow);
  transition: all 0.25s ease;
}

.legal-card:hover {
  border-color: var(--tmdb-cyan);
}

.section-title {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--text-primary);
}

.leading-relaxed {
  line-height: 1.7;
}

.rule-box {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--text-primary);
}
</style>