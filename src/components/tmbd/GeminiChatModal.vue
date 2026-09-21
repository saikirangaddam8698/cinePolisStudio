<template>
  <div>
    <!-- Floating AI Trigger Button -->
    <button
      class="cinebot-trigger-btn shadow-lg"
      @click="toggleChat"
      :class="{ 'cinebot-trigger-btn--active': isOpen }"
      title="Ask AI"
    >
      <span class="cinebot-sparkles">✨</span>
      <span class="cinebot-label d-none d-md-inline">Ask AI</span>
      <span v-if="unreadCount > 0" class="cinebot-badge">{{ unreadCount }}</span>
    </button>

    <!-- Chat Modal / Drawer -->
    <div v-if="isOpen" class="cinebot-window animate-slide-up shadow-2xl" :class="{ 'cinebot-closing': isClosing }">
      <!-- Header -->
      <div class="cinebot-header d-flex justify-content-between align-items-center">
        <div class="d-flex align-items-center gap-2">
          <div class="cinebot-avatar">✨</div>
          <div>
            <div class="cinebot-title">Ask AI <span class="ai-pill">Gemini 3.5 Flash</span></div>
            <div class="cinebot-subtitle">AI Movie Concierge & Discovery</div>
          </div>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="header-icon-btn header-icon-btn--close" :class="{ 'is-closing': isClosing }" @click="closeChat" title="Close">
            ✕
          </button>
        </div>
      </div>

      <!-- Messages Body -->
      <div class="cinebot-body" ref="chatBody">
        <div
          v-for="(msg, idx) in messages"
          :key="idx"
          :class="['chat-bubble', msg.role === 'user' ? 'chat-bubble--user' : 'chat-bubble--bot']"
        >
          <div class="bubble-content" v-html="formatMessage(msg.text)"></div>
        </div>

        <div v-if="isTyping" class="chat-bubble chat-bubble--bot typing-indicator">
          <span class="dot"></span>
          <span class="dot"></span>
          <span class="dot"></span>
        </div>
      </div>

      <!-- Quick prompts -->
      <div class="cinebot-quick-chips">
        <button
          v-for="(chip, i) in quickPrompts"
          :key="i"
          class="chip-btn"
          @click="sendPrompt(chip)"
        >
          {{ chip }}
        </button>
      </div>

      <!-- Input Footer -->
      <div class="cinebot-footer">
        <form @submit.prevent="sendMessage" class="d-flex gap-2">
          <input
            type="text"
            v-model="userInput"
            placeholder="Ask about movies, plots, recommendations..."
            class="cinebot-input form-control"
            :disabled="isTyping"
          />
          <button
            type="submit"
            class="btn cinebot-send-btn"
            :disabled="!userInput.trim() || isTyping"
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { geminiService } from "@/services/geminiService";

export default {
  name: "GeminiChatModal",
  data() {
    return {
      isOpen: false,
      isClosing: false,
      isTyping: false,
      unreadCount: 0,
      userInput: "",
      messages: [
        {
          role: "bot",
          text: `👋 Hey there! I'm your **AI Movie & TV Guide**.\n\nAsk me anything! For example:\n- *"Suggest 5 edge-of-your-seat thrillers like Inception"*\n- *"What should I watch if I love Stranger Things?"*\n- *"Cozy feel-good movies for date night"*`,
        },
      ],
      quickPrompts: [
        "🍿 Mind-bending Sci-Fi",
        "🔥 Action like John Wick",
        "😂 Feel-Good Comedy",
        "😱 Creepy Horror & Thrillers",
      ],
    };
  },
  methods: {
    toggleChat() {
      if (this.isOpen) {
        this.closeChat();
      } else {
        this.isOpen = true;
        this.isClosing = false;
        this.unreadCount = 0;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    closeChat() {
      if (this.isClosing) return;
      this.isClosing = true;
      setTimeout(() => {
        this.isOpen = false;
        this.isClosing = false;
      }, 180);
    },
    sendPrompt(promptText) {
      this.userInput = promptText;
      this.sendMessage();
    },
    async sendMessage() {
      const text = this.userInput.trim();
      if (!text || this.isTyping) return;

      this.messages.push({ role: "user", text });
      this.userInput = "";
      this.isTyping = true;
      this.scrollToBottom();

      try {
        const history = this.messages.slice(0, -1);
        const result = await geminiService.chatWithCineBot(history, text);
        this.messages.push({ role: "bot", text: result.reply });
      } catch (err) {
        console.error("CineBot error:", err);
        this.messages.push({
          role: "bot",
          text: "Oops! Something went wrong communicating with Gemini AI. Please wait a moment and try again.",
        });
      } finally {
        this.isTyping = false;
        this.scrollToBottom();
      }
    },
    formatMessage(text) {
      if (!text) return "";
      let parsed = text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");

      // Replace bold **text**
      parsed = parsed.replace(/\*\*(.*?)\*\*/g, '<strong class="highlight-title">$1</strong>');
      // Replace italics *text*
      parsed = parsed.replace(/\*(.*?)\*/g, "<em>$1</em>");
      // Replace newlines
      parsed = parsed.replace(/\n/g, "<br/>");
      return parsed;
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const el = this.$refs.chatBody;
        if (el) {
          el.scrollTop = el.scrollHeight;
        }
      });
    },
  },
  mounted() {
    this.apiKeyInput = geminiService.getApiKey();
    this.selectedModel = geminiService.getModel();
    if (this.apiKeyInput && !localStorage.getItem("gemini_api_key")) {
      geminiService.setApiKey(this.apiKeyInput);
    }
  },
};
</script>

<style scoped>
.cinebot-trigger-btn {
  position: fixed;
  bottom: 20px;
  right: 20px;
  background: linear-gradient(135deg, #01b4e4 0%, #90cea1 100%);
  color: #032541;
  border: none;
  border-radius: 30px;
  padding: 6px 14px;
  height: 34px;
  font-weight: 700;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 5px;
  z-index: 9000;
  cursor: pointer;
  box-shadow: 0 6px 18px rgba(1, 180, 228, 0.35);
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.cinebot-trigger-btn:hover {
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 8px 22px rgba(1, 180, 228, 0.5);
}

.cinebot-sparkles {
  font-size: 13px;
  animation: pulse 2s infinite;
}

.cinebot-badge {
  background: #db2360;
  color: #fff;
  border-radius: 50%;
  padding: 1px 5px;
  font-size: 10px;
}

.cinebot-window {
  position: fixed;
  bottom: 84px;
  right: 24px;
  width: 400px;
  max-width: calc(100vw - 48px);
  height: 560px;
  max-height: calc(100vh - 120px);
  background: rgba(4, 21, 45, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(1, 180, 228, 0.3);
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  z-index: 9001;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.8), 0 0 30px rgba(1, 180, 228, 0.2);
}

.cinebot-header {
  background: rgba(3, 37, 65, 0.9);
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.cinebot-avatar {
  font-size: 24px;
}

.cinebot-title {
  color: #fff;
  font-weight: 800;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.ai-pill {
  background: linear-gradient(90deg, #01b4e4, #90cea1);
  color: #032541;
  font-size: 10px;
  font-weight: 800;
  padding: 1px 6px;
  border-radius: 10px;
}

.cinebot-subtitle {
  color: #94a3b8;
  font-size: 11px;
}

.header-icon-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #fff;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

.header-icon-btn--settings:hover {
  background: var(--tmdb-cyan) !important;
  color: #032541 !important;
  transform: rotate(45deg) scale(1.1) !important;
  border-color: transparent !important;
  box-shadow: 0 4px 14px var(--tmdb-cyan-glow) !important;
}

.header-icon-btn--close:hover,
.header-icon-btn--close:focus,
.header-icon-btn--close:active,
.header-icon-btn--close.is-closing {
  background: var(--tmdb-pink) !important;
  color: #ffffff !important;
  transform: rotate(90deg) scale(1.1) !important;
  border-color: transparent !important;
  box-shadow: 0 4px 14px rgba(244, 63, 94, 0.5) !important;
}

.cinebot-window.cinebot-closing {
  opacity: 0 !important;
  transform: translateY(20px) scale(0.95) !important;
  transition: opacity 0.18s ease-out, transform 0.18s ease-out !important;
}

.cinebot-body {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.chat-bubble {
  max-width: 85%;
  padding: 10px 14px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.5;
  word-break: break-word;
}

.chat-bubble--user {
  align-self: flex-end;
  background: linear-gradient(135deg, #01b4e4 0%, #0077b6 100%);
  color: #ffffff;
  border-bottom-right-radius: 4px;
}

.chat-bubble--bot {
  align-self: flex-start;
  background: rgba(30, 41, 59, 0.85);
  color: #e2e8f0;
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

:deep(.highlight-title) {
  color: #90cea1;
  font-weight: 700;
}

.typing-indicator {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 10px 16px;
}

.dot {
  width: 6px;
  height: 6px;
  background: #01b4e4;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.dot:nth-child(1) { animation-delay: -0.32s; }
.dot:nth-child(2) { animation-delay: -0.16s; }

@keyframes bounce {
  0%, 80%, 100% { transform: scale(0); }
  40% { transform: scale(1); }
}

.cinebot-quick-chips {
  display: flex;
  gap: 6px;
  padding: 8px 14px;
  overflow-x: auto;
  background: rgba(3, 37, 65, 0.4);
}

.chip-btn {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.15);
  color: #94a3b8;
  font-size: 11px;
  padding: 4px 10px;
  border-radius: 20px;
  white-space: nowrap;
  cursor: pointer;
  transition: all 0.2s ease;
}

.chip-btn:hover {
  background: rgba(1, 180, 228, 0.25);
  color: #fff;
  border-color: #01b4e4;
}

.cinebot-footer {
  padding: 12px 14px;
  background: rgba(3, 37, 65, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.cinebot-input {
  background: rgba(15, 23, 42, 0.9) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  color: #fff !important;
  border-radius: 20px;
  font-size: 13px;
  padding: 8px 16px;
}

.cinebot-input:focus {
  border-color: #01b4e4 !important;
  box-shadow: 0 0 10px rgba(1, 180, 228, 0.3) !important;
}

.cinebot-send-btn {
  background: linear-gradient(135deg, #01b4e4, #90cea1);
  color: #032541;
  font-weight: 800;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: transform 0.2s;
}

.cinebot-send-btn:hover:not(:disabled) {
  transform: scale(1.08);
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}

.animate-slide-up {
  animation: slideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
}

@media (max-width: 576px) {
  .cinebot-window {
    width: calc(100vw - 20px) !important;
    max-width: calc(100vw - 20px) !important;
    right: 10px !important;
    bottom: 74px !important;
    height: 76vh !important;
    max-height: 76vh !important;
    border-radius: 16px !important;
  }
}
</style>
