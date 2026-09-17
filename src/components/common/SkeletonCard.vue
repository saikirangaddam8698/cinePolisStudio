<template>
  <div class="skeleton-card">
    <div class="skeleton-poster shimmer">
      <div class="skeleton-rating shimmer"></div>
    </div>
    <div class="skeleton-info">
      <div class="skeleton-line skeleton-title shimmer"></div>
      <div class="skeleton-line skeleton-date shimmer"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SkeletonCard",
};
</script>

<style scoped>
.skeleton-card {
  width: 100%;
}

.skeleton-poster {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 14px;
  background: var(--skeleton-bg, rgba(255, 255, 255, 0.07));
  overflow: hidden;
}

.skeleton-rating {
  position: absolute;
  bottom: -14px;
  left: 12px;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: var(--skeleton-rating-bg, #081c22);
  border: 2px solid var(--skeleton-bg, rgba(255, 255, 255, 0.12));
}

.skeleton-info {
  margin-top: 22px;
  padding: 0 4px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: var(--skeleton-bg, rgba(255, 255, 255, 0.08));
}

.skeleton-title {
  width: 85%;
  height: 14px;
}

.skeleton-date {
  width: 50%;
  height: 10px;
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
    rgba(255, 255, 255, 0.08) 20%,
    rgba(255, 255, 255, 0.18) 60%,
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
