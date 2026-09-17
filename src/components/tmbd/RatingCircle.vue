<template>
  <div class="rating-circle" :style="{ width: `${size}px`, height: `${size}px` }">
    <svg :width="size" :height="size" viewBox="0 0 40 40">
      <circle
        class="rating-circle__bg"
        cx="20"
        cy="20"
        r="17"
      />
      <circle
        class="rating-circle__track"
        cx="20"
        cy="20"
        r="15"
        :stroke="trackColor"
      />
      <circle
        class="rating-circle__progress"
        cx="20"
        cy="20"
        r="15"
        :stroke="progressColor"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="strokeDashoffset"
      />
    </svg>
    <div class="rating-circle__value">
      <span v-if="percentage > 0">{{ percentage }}<small>%</small></span>
      <span v-else class="nr">NR</span>
    </div>
  </div>
</template>

<script>
export default {
  name: "RatingCircle",
  props: {
    score: {
      type: Number,
      default: 0,
    },
    size: {
      type: Number,
      default: 42,
    },
  },
  computed: {
    percentage() {
      if (!this.score || isNaN(this.score)) return 0;
      return Math.round(this.score * 10);
    },
    circumference() {
      return 2 * Math.PI * 15; // r = 15 => ~94.24
    },
    strokeDashoffset() {
      const p = Math.min(Math.max(this.percentage, 0), 100);
      return this.circumference - (p / 100) * this.circumference;
    },
    progressColor() {
      if (this.percentage >= 70) return "#21d07a"; // TMDB bright green
      if (this.percentage >= 50) return "#d2d531"; // TMDB yellow/lime
      if (this.percentage > 0) return "#db2360";  // TMDB pink/red
      return "#666666";
    },
    trackColor() {
      if (this.percentage >= 70) return "#204529";
      if (this.percentage >= 50) return "#423d0f";
      if (this.percentage > 0) return "#571435";
      return "#333333";
    },
  },
};
</script>

<style scoped>
.rating-circle {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #081c22;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  user-select: none;
}

.rating-circle svg {
  transform: rotate(-90deg);
  display: block;
}

.rating-circle__bg {
  fill: #081c22;
}

.rating-circle__track {
  fill: none;
  stroke-width: 3;
}

.rating-circle__progress {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
  transition: stroke-dashoffset 0.8s ease;
}

.rating-circle__value {
  position: absolute;
  color: #ffffff;
  font-weight: 700;
  font-size: 11px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  display: flex;
  align-items: baseline;
  justify-content: center;
  line-height: 1;
}

.rating-circle__value small {
  font-size: 6px;
  margin-left: 1px;
  font-weight: 600;
}

.rating-circle__value .nr {
  font-size: 9px;
  color: #aaa;
}
</style>
