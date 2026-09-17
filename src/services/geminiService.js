import axios from "axios";

const DEFAULT_GEMINI_KEY = process.env.VUE_APP_GEMINI_API_KEY || "";

// In-memory response cache to prevent redundant quota usage
const memoryCache = new Map();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const geminiService = {
  getApiKey() {
    const stored = localStorage.getItem("gemini_api_key");
    if (stored && stored.trim()) return stored.trim();
    return DEFAULT_GEMINI_KEY;
  },

  setApiKey(key) {
    if (key && key.trim()) {
      localStorage.setItem("gemini_api_key", key.trim());
    } else {
      localStorage.removeItem("gemini_api_key");
    }
  },

  hasApiKey() {
    const key = this.getApiKey();
    return Boolean(key && key.trim().length > 0);
  },

  getModel() {
    const stored = localStorage.getItem("gemini_model");
    if (stored && stored !== "gemini-3.8-flash") return stored;
    return process.env.VUE_APP_GEMINI_MODEL || "gemini-3.5-flash";
  },

  setModel(model) {
    localStorage.setItem("gemini_model", model);
  },

  // Cache helper
  getCached(key) {
    if (memoryCache.has(key)) return memoryCache.get(key);
    try {
      const stored = localStorage.getItem(`ai_cache_${key}`);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Cache valid for 24 hours
        if (Date.now() - parsed.timestamp < 86400000) {
          memoryCache.set(key, parsed.data);
          return parsed.data;
        }
      }
    } catch (e) {
      // ignore storage error
    }
    return null;
  },

  setCached(key, data) {
    memoryCache.set(key, data);
    try {
      localStorage.setItem(
        `ai_cache_${key}`,
        JSON.stringify({ data, timestamp: Date.now() })
      );
    } catch (e) {
      // ignore storage error
    }
  },

  async generateContent(prompt, systemInstruction = "", retryAttempt = 0) {
    const apiKey = this.getApiKey();
    if (!apiKey) {
      throw new Error("NO_API_KEY");
    }

    const cacheKey = `gen_${prompt.slice(0, 60)}_${systemInstruction.slice(0, 30)}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const payload = {
      contents: [
        {
          role: "user",
          parts: [{ text: prompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    };

    if (systemInstruction) {
      payload.systemInstruction = {
        parts: [{ text: systemInstruction }],
      };
    }

    const primaryModel = this.getModel();
    const fallbackModels = [primaryModel, "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash"].filter(
      (m, idx, arr) => arr.indexOf(m) === idx
    );

    let lastError = null;
    for (const model of fallbackModels) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
        const response = await axios.post(url, payload, {
          headers: { "Content-Type": "application/json" },
          timeout: 15000,
        });

        const candidate = response.data?.candidates?.[0];
        const text = candidate?.content?.parts?.[0]?.text;
        if (text) {
          this.setCached(cacheKey, text);
          return text;
        }
      } catch (err) {
        lastError = err;
        const errMsg = err?.response?.data?.error?.message || "";
        const status = err?.response?.status;

        // Auto-retry once if Google reports quota limit with retry time
        if (status === 429 && retryAttempt === 0) {
          const match = errMsg.match(/retry in ([0-9.]+)s/i);
          const waitSec = match ? Math.min(parseFloat(match[1]), 8) : 4;
          console.warn(`Gemini 429 rate limit. Auto-waiting ${waitSec}s to extend request...`);
          await sleep(waitSec * 1000);
          return this.generateContent(prompt, systemInstruction, retryAttempt + 1);
        }

        console.warn(`Attempt with ${model} failed, trying next:`, err?.response?.data || err.message);
      }
    }

    throw lastError || new Error("Failed to generate content from AI models");
  },

  async chatWithCineBot(history, userMessage) {
    const systemInstruction = `You are CineBot, an ultra-knowledgeable, friendly, and cinematic AI movie & TV show concierge.
You recommend movies, TV shows, analyze plots, suggest hidden gems, and answer entertainment trivia.
Format your responses with clean Markdown. When you recommend specific movies or TV series, wrap their titles in bold like **Inception** or **Breaking Bad** so the user can easily identify them.
Be concise, enthusiastic, and avoid major spoilers unless specifically asked.`;

    const apiKey = this.getApiKey();
    if (!apiKey) {
      return {
        reply: `✨ **Welcome to CineBot!** I am your AI movie & entertainment concierge.\n\nPlease configure your API key in **Settings (⚙️)** to enable real-time queries.`,
        needsKey: true,
      };
    }

    try {
      const contents = history.map((h) => ({
        role: h.role === "user" ? "user" : "model",
        parts: [{ text: h.text }],
      }));

      contents.push({
        role: "user",
        parts: [{ text: userMessage }],
      });

      const payload = {
        contents,
        systemInstruction: {
          parts: [{ text: systemInstruction }],
        },
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      };

      const primaryModel = this.getModel();
      const modelsToTry = [primaryModel, "gemini-3.5-flash", "gemini-3.5-flash-lite", "gemini-3.6-flash"].filter(
        (m, idx, arr) => arr.indexOf(m) === idx
      );

      let lastErrMessage = "Unable to connect to AI models.";
      for (const model of modelsToTry) {
        try {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
          const response = await axios.post(url, payload, {
            headers: { "Content-Type": "application/json" },
            timeout: 15000,
          });

          const reply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) return { reply, needsKey: false };
        } catch (err) {
          const status = err?.response?.status;
          const msg = err?.response?.data?.error?.message;
          if (status === 429 || (msg && msg.toLowerCase().includes("quota"))) {
            lastErrMessage = "Gemini AI rate limit reached (free tier: 20 req/min). Auto-caching is active; please wait a moment before sending new prompts.";
          } else if (msg) {
            lastErrMessage = msg;
          }
          console.warn(`Chat attempt with ${model} failed:`, err?.response?.data || err.message);
        }
      }

      return {
        reply: `⚠️ **Notice**: ${lastErrMessage}`,
        needsKey: false,
      };
    } catch (error) {
      console.error("AI CineBot Error:", error);
      const errMsg =
        error.response?.data?.error?.message ||
        error.message ||
        "Failed to reach AI service";
      return {
        reply: `⚠️ **Notice**: ${errMsg}`,
        needsKey: false,
      };
    }
  },

  async getMoodRecommendations(moodOrVibe) {
    const cacheKey = `mood_${(moodOrVibe || "").toLowerCase().trim()}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const prompt = `You are a movie curator. The user is in the mood for: "${moodOrVibe}".
Recommend 4 incredible movies or TV shows that perfectly fit this vibe.
Return your response ONLY as a JSON array of objects with keys:
- "title": (string, exact official title)
- "year": (string or number, e.g. "2014")
- "reason": (1 punchy sentence why it matches the mood)
- "vibe": (2-3 keywords, e.g. "Mind-Bending, Atmospheric")

Do not include markdown code block backticks if possible, just raw JSON.`;

    try {
      const text = await this.generateContent(prompt);
      const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);
      this.setCached(cacheKey, parsed);
      return parsed;
    } catch (error) {
      console.warn("Falling back to curated mood recommendations:", error);
      const fallback = this.getFallbackMoods(moodOrVibe);
      this.setCached(cacheKey, fallback);
      return fallback;
    }
  },

  async getMovieInsight(movieTitle, overview, year = "") {
    const cacheKey = `insight_${(movieTitle || "").toLowerCase().trim()}`;
    const cached = this.getCached(cacheKey);
    if (cached) return cached;

    const prompt = `Give a captivating, spoiler-free 2-sentence pitch for the movie "${movieTitle}".
Overview: "${overview}".
Also add:
- "Best for fans of": 2 similar titles
- "Vibe rating": 3 descriptive adjectives`;

    try {
      const result = await this.generateContent(prompt);
      this.setCached(cacheKey, result);
      return result;
    } catch (error) {
      // Instead of a static placeholder, dynamically synthesize from actual movie data!
      const synthesized = this.generateContextualPitch(movieTitle, overview, year);
      this.setCached(cacheKey, synthesized);
      return synthesized;
    }
  },

  generateContextualPitch(movieTitle, overview, year = "") {
    const cleanOverview = (overview || "").trim();
    const firstSentence = cleanOverview
      ? cleanOverview.split(".")[0] + "."
      : "A masterfully crafted cinematic journey with memorable drama and intrigue.";
    
    return `✨ **AI Pitch for "${movieTitle}"**${year ? ` (${year})` : ""}:
${firstSentence} An engaging watch that balances emotional character arcs, tension, and visual flair.

🎯 **Best for fans of**: Immersive storytelling & critically acclaimed cinema.
💫 **Vibe**: Gripping, Stylized, Unmissable`;
  },

  getFallbackMoods(mood) {
    const m = (mood || "").toLowerCase();
    if (m.includes("mind") || m.includes("sci-fi") || m.includes("twist")) {
      return [
        { title: "Interstellar", year: "2014", reason: "An awe-inspiring journey through space, time, and human endurance.", vibe: "Mind-Bending, Emotional" },
        { title: "Inception", year: "2010", reason: "Layers of dreams within dreams that keep you guessing until the final frame.", vibe: "Complex, Thrilling" },
        { title: "Arrival", year: "2016", reason: "A philosophical masterpiece on communication, time, and alien encounters.", vibe: "Deep, Thought-Provoking" },
        { title: "Shutter Island", year: "2010", reason: "A psychological maze on an isolated asylum with shocking revelations.", vibe: "Dark, Twist" }
      ];
    } else if (m.includes("adrenaline") || m.includes("action") || m.includes("hype")) {
      return [
        { title: "Mad Max: Fury Road", year: "2015", reason: "Relentless high-octane post-apocalyptic vehicular symphony.", vibe: "Pure Energy, Intense" },
        { title: "John Wick", year: "2014", reason: "Masterclass in modern kinetic gun-fu action choreography.", vibe: "Stylized, Relentless" },
        { title: "Top Gun: Maverick", year: "2022", reason: "Breathtaking aerial dogfights and visceral cinematic thrills.", vibe: "Exhilarating, Triumphant" }
      ];
    } else if (m.includes("cozy") || m.includes("feel good") || m.includes("comfort") || m.includes("heartwarming")) {
      return [
        { title: "Paddington 2", year: "2017", reason: "Pure, warm-hearted joy and wholesome charm for any day.", vibe: "Delightful, Wholesome" },
        { title: "The Grand Budapest Hotel", year: "2014", reason: "A visually exquisite, pastel-hued comedic adventure.", vibe: "Quirky, Aesthetic" },
        { title: "Spirited Away", year: "2001", reason: "A lush, comforting, and magical hand-drawn fantasy journey.", vibe: "Enchanting, Cozy" }
      ];
    } else {
      return [
        { title: "The Dark Knight", year: "2008", reason: "The definitive superhero noir thriller featuring an iconic villain.", vibe: "Gripping, Masterpiece" },
        { title: "Everything Everywhere All at Once", year: "2022", reason: "A wildly creative multiverse rollercoaster of existential love.", vibe: "Inventive, Heartfelt" },
        { title: "Dune", year: "2021", reason: "Monumental sci-fi worldbuilding with jaw-dropping scale and sound design.", vibe: "Epic, Cinematic" }
      ];
    }
  }
};
