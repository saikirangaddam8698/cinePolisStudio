<template>
  <div class="legal-page-container container-fluid px-4 px-md-5 py-5">
    <div class="legal-content-wrapper mx-auto">
      
      <!-- Page Header -->
      <div class="mb-5 pb-3 border-bottom border-secondary border-opacity-25 text-center">
        <div class="legal-badge mb-2">
          <span>🤝 COMMUNITY STANDARDS</span>
        </div>
        <h1 class="legal-title mb-2">CinePolis Studio Guidelines</h1>
        <p class="text-muted mb-0">
          Our core values and standards for a safe, welcoming, and high-standard movie ecosystem
        </p>
      </div>

      <!-- Core Principles Grid -->
      <div class="row g-4 mb-4">
        <div class="col-12 col-md-6">
          <div class="legal-card h-100 p-4">
            <div class="icon-circle mb-3">💬</div>
            <h4 class="card-title">Be Respectful & Welcoming</h4>
            <p class="text-secondary leading-relaxed mb-0">
              Cinema brings people of diverse backgrounds together. Treat other cinephiles, actors, and contributors with kindness and respect. Constructive movie critique is always encouraged, but personal attacks and bigotry are strictly barred.
            </p>
          </div>
        </div>

        <div class="col-12 col-md-6">
          <div class="legal-card h-100 p-4">
            <div class="icon-circle mb-3">🎯</div>
            <h4 class="card-title">Data Accuracy & Quality</h4>
            <p class="text-secondary leading-relaxed mb-0">
              CinePolis Studio thrives on high-fidelity entertainment metadata. When submitting feedback, reporting broken trailers, or requesting title corrections, ensure information is backed by verified release schedules and official studios.
            </p>
          </div>
        </div>
      </div>

      <!-- Prohibited Behavior Card -->
      <div class="legal-card p-4 p-md-5 mb-4">
        <h3 class="section-title text-danger mb-3">Prohibited Content & Actions</h3>
        <p class="text-secondary mb-4">
          To maintain an environment suitable for all movie fans, CinePolis Studio strictly prohibits the following:
        </p>
        <div class="row g-3">
          <div class="col-12 col-md-6">
            <div class="guideline-item p-3 rounded-3 d-flex align-items-start gap-2">
              <span class="badge-number">1</span>
              <div>
                <strong class="d-block text-primary">No Hate Speech or Harassment</strong>
                <small class="text-secondary">Defamatory, obscene, or threatening language directed at any user or group is zero-tolerance.</small>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="guideline-item p-3 rounded-3 d-flex align-items-start gap-2">
              <span class="badge-number">2</span>
              <div>
                <strong class="d-block text-primary">No Piracy or Copyright Infringement</strong>
                <small class="text-secondary">Do not share links to illicit streaming sites or unreleased media copies.</small>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="guideline-item p-3 rounded-3 d-flex align-items-start gap-2">
              <span class="badge-number">3</span>
              <div>
                <strong class="d-block text-primary">No Spam or Commercial Advertising</strong>
                <small class="text-secondary">Do not exploit CineBot prompts or feedback channels for unsolicited product promotions.</small>
              </div>
            </div>
          </div>
          <div class="col-12 col-md-6">
            <div class="guideline-item p-3 rounded-3 d-flex align-items-start gap-2">
              <span class="badge-number">4</span>
              <div>
                <strong class="d-block text-primary">No Trolling or Metadata Sabotage</strong>
                <small class="text-secondary">Deliberately injecting false titles, incorrect release dates, or fake cast members is prohibited.</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Moderation & Enforcement -->
      <div class="legal-card p-4 p-md-5 mb-4">
        <h3 class="section-title mb-3">Moderation & Enforcement</h3>
        <p class="text-secondary leading-relaxed mb-0">
          CinePolis Studio reserves the right to moderate, restrict, or revoke access to any user or API token violating these community standards. If you encounter content or conduct that violates our policies, please submit a report to our team.
        </p>
      </div>

      <!-- Action Buttons -->
      <div class="d-flex justify-content-center gap-3 mt-4">
        <router-link to="/abouttmbd" class="btn btn-outline-secondary rounded-pill px-4">
          About CinePolis Studio
        </router-link>
        <router-link to="/termspage" class="btn btn-primary rounded-pill px-4">
          View Terms of Service
        </router-link>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "guidlinesPage",
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

.icon-circle {
  font-size: 1.8rem;
}

.card-title {
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 800;
}

.leading-relaxed {
  line-height: 1.7;
}

.guideline-item {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
}

.badge-number {
  background: linear-gradient(135deg, var(--tmdb-cyan), var(--tmdb-green));
  color: #032541;
  font-weight: 900;
  font-size: 0.75rem;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-top: 2px;
}
</style>