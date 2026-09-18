<template>
  <div class="legal-page-container container-fluid px-4 px-md-5 py-5">
    <div class="legal-content-wrapper mx-auto">
      
      <!-- Page Header -->
      <div class="text-center mb-5 pb-3 border-bottom border-secondary border-opacity-25">
        <div class="legal-badge mb-2">
          <span>📬 GET IN TOUCH</span>
        </div>
        <h1 class="legal-title mb-2">Contact CinePolis Studio</h1>
        <p class="text-muted mb-0">
          Have feedback, inquiries, or film suggestions? We'd love to hear from you.
        </p>
      </div>

      <!-- Support Pillars -->
      <div class="row g-4 mb-5">
        <div class="col-12 col-md-4">
          <div class="legal-card h-100 p-4 text-center">
            <div class="channel-icon mb-3">💬</div>
            <h5 class="channel-title">Community Support</h5>
            <p class="channel-desc text-muted mb-3">
              Need assistance navigating features, trailers, or your CinePolis Studio account?
            </p>
            <a href="mailto:support@cinepolisstudio.io" class="btn-channel-link">support@cinepolisstudio.io ↗</a>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="legal-card h-100 p-4 text-center">
            <div class="channel-icon mb-3">✨</div>
            <h5 class="channel-title">Gemini AI Feedback</h5>
            <p class="channel-desc text-muted mb-3">
              Have suggestions for our CineBot concierge or AI Mood Matcher recommendations?
            </p>
            <a href="mailto:ai@cinepolisstudio.io" class="btn-channel-link">ai@cinepolisstudio.io ↗</a>
          </div>
        </div>

        <div class="col-12 col-md-4">
          <div class="legal-card h-100 p-4 text-center">
            <div class="channel-icon mb-3">🤝</div>
            <h5 class="channel-title">Studio Partnerships</h5>
            <p class="channel-desc text-muted mb-3">
              Interested in metadata integration, promotions, or film festival collaboration?
            </p>
            <a href="mailto:partners@cinepolisstudio.io" class="btn-channel-link">partners@cinepolisstudio.io ↗</a>
          </div>
        </div>
      </div>

      <!-- Interactive Contact Form -->
      <div class="legal-card p-4 p-md-5">
        <h3 class="section-title mb-1">Send us a Message</h3>
        <p class="text-muted mb-4">Our studio team typically responds within 24–48 hours.</p>

        <form @submit.prevent="submitForm" v-if="!isSubmitted">
          <div class="row g-3">
            <div class="col-12 col-md-6">
              <label class="form-label text-secondary small fw-bold">YOUR NAME</label>
              <input
                type="text"
                v-model="form.name"
                class="form-control form-control-custom"
                placeholder="e.g. Alex Morgan"
                required
              />
            </div>
            <div class="col-12 col-md-6">
              <label class="form-label text-secondary small fw-bold">EMAIL ADDRESS</label>
              <input
                type="email"
                v-model="form.email"
                class="form-control form-control-custom"
                placeholder="name@example.com"
                required
              />
            </div>
            <div class="col-12">
              <label class="form-label text-secondary small fw-bold">TOPIC</label>
              <select v-model="form.topic" class="form-select form-control-custom">
                <option value="general">General Film Question</option>
                <option value="ai">Gemini AI / CineBot Feedback</option>
                <option value="metadata">Movie / TV Data Correction</option>
                <option value="partnership">Studio / Partnership Opportunity</option>
              </select>
            </div>
            <div class="col-12">
              <label class="form-label text-secondary small fw-bold">MESSAGE</label>
              <textarea
                v-model="form.message"
                rows="4"
                class="form-control form-control-custom"
                placeholder="How can CinePolis Studio help you today?"
                required
              ></textarea>
            </div>
            <div class="col-12 mt-4">
              <button
                type="submit"
                class="btn btn-submit-message rounded-pill px-5 py-2 fw-bold"
                :disabled="isSubmitting"
              >
                <span v-if="isSubmitting" class="d-inline-flex align-items-center gap-2">
                  <span class="spinner-border spinner-border-sm text-info" role="status"></span>
                  Sending...
                </span>
                <span v-else class="d-inline-flex align-items-center gap-2">
                  <span>Send Message</span>
                  <svg
                    class="send-message-logo"
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill="none"
                    aria-hidden="true"
                  >
                    <defs>
                      <linearGradient id="cinepolisSendGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#06b6d4" />
                        <stop offset="100%" stop-color="#10b981" />
                      </linearGradient>
                    </defs>
                    <path
                      d="M3 8L10.89 13.26C11.56 13.71 12.44 13.71 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z"
                      stroke="url(#cinepolisSendGrad)"
                      stroke-width="2.2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </div>
        </form>

        <div v-else class="text-center py-4 animate-fade-in">
          <div class="sent-icon mb-2">🎉</div>
          <h4>Thank You, {{ form.name }}!</h4>
          <p class="text-muted">Your message has been sent to CinePolis Studio team. We'll be in touch soon.</p>
          <button class="btn btn-outline-secondary rounded-pill px-4 mt-2" @click="resetForm">
            Send Another Message
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script>
export default {
  name: "contactUs",
  data() {
    return {
      isSubmitting: false,
      isSubmitted: false,
      form: {
        name: "",
        email: "",
        topic: "general",
        message: "",
      },
    };
  },
  methods: {
    submitForm() {
      this.isSubmitting = true;
      setTimeout(() => {
        this.isSubmitting = false;
        this.isSubmitted = true;
      }, 700);
    },
    resetForm() {
      this.isSubmitted = false;
      this.form = {
        name: "",
        email: "",
        topic: "general",
        message: "",
      };
    },
  },
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
  max-width: 920px;
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

.channel-icon {
  font-size: 2.2rem;
}

.channel-title {
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--text-primary);
}

.channel-desc {
  font-size: 0.86rem;
  line-height: 1.5;
}

.btn-channel-link {
  color: var(--tmdb-cyan);
  font-weight: 700;
  font-size: 0.88rem;
  text-decoration: none;
  transition: color 0.2s;
}

.btn-channel-link:hover {
  color: var(--tmdb-green);
}

.section-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: var(--text-primary);
}

.form-control-custom {
  background: var(--bg-secondary) !important;
  border: 1px solid var(--border-color) !important;
  color: var(--text-primary) !important;
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 0.9rem;
  transition: border-color 0.2s;
}

.form-control-custom:focus {
  border-color: var(--tmdb-cyan) !important;
  box-shadow: 0 0 10px var(--tmdb-cyan-glow) !important;
}

.sent-icon {
  font-size: 2.5rem;
}

.btn-submit-message {
  background: var(--bg-secondary) !important;
  border: 1.5px solid var(--border-color) !important;
  color: var(--text-primary) !important;
  font-weight: 700;
  padding: 10px 32px;
  border-radius: 30px;
  display: inline-flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  box-shadow: var(--card-shadow);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.btn-submit-message:hover:not(:disabled) {
  border-color: var(--tmdb-cyan) !important;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(6, 182, 212, 0.35) !important;
  color: var(--text-primary) !important;
}

[data-theme="light"] .btn-submit-message {
  background: #ffffff !important;
  border: 1.5px solid #cbd5e1 !important;
  color: #0f172a !important;
}

[data-theme="light"] .btn-submit-message:hover:not(:disabled) {
  border-color: #0284c7 !important;
  box-shadow: 0 8px 22px rgba(2, 132, 199, 0.2) !important;
}

.send-message-logo {
  flex-shrink: 0;
  transition: transform 0.25s ease;
}

.btn-submit-message:hover .send-message-logo {
  transform: translateX(3px) scale(1.08);
}
</style>