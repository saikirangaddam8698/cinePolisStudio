<template>
  <div class="row g-3">
    <div v-for="n in 4" :key="n" class="col-12 col-sm-6 col-lg-3">
      <div class="skeleton-mood-card p-3 rounded-3 shimmer">
        <div class="d-flex justify-content-between mb-3">
          <div class="skeleton-chip shimmer"></div>
          <div class="skeleton-year shimmer"></div>
        </div>
        <div class="skeleton-title-mood shimmer mb-2"></div>
        <div class="skeleton-text-mood shimmer mb-1"></div>
        <div class="skeleton-text-mood w-75 shimmer mb-3"></div>
        <div class="skeleton-footer-mood shimmer"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SkeletonMood",
};
</script>

<style scoped>
.skeleton-mood-card {
  background: var(--skeleton-card-bg, rgba(4, 21, 45, 0.7));
  border: 1px solid var(--skeleton-border, rgba(255, 255, 255, 0.08));
  min-height: 150px;
}

.skeleton-chip {
  width: 70px;
  height: 18px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
}

.skeleton-year {
  width: 40px;
  height: 14px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
}

.skeleton-title-mood {
  width: 80%;
  height: 20px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
}

.skeleton-text-mood {
  width: 95%;
  height: 12px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.08);
}

.skeleton-footer-mood {
  width: 40%;
  height: 12px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.1);
}

.shimmer {
  position: relative;
  overflow: hidden;
}

.shimmer::after {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: translateX(-100%);
  background-image: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0,
    rgba(255, 255, 255, 0.06) 20%,
    rgba(255, 255, 255, 0.15) 60%,
    rgba(255, 255, 255, 0)
  );
  animation: shimmer 1.5s infinite;
  content: "";
}

@keyframes shimmer {
  100% {
    transform: translateX(100%);
  }
}
</style>
