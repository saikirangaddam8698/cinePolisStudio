<template>
  <div class="skeleton-hero shimmer">
    <div class="skeleton-hero__content">
      <div class="skeleton-pill shimmer"></div>
      <div class="skeleton-headline shimmer"></div>
      <div class="skeleton-meta d-flex gap-3 my-3">
        <div class="skeleton-circle shimmer"></div>
        <div class="skeleton-line w-25 shimmer"></div>
      </div>
      <div class="skeleton-paragraph shimmer"></div>
      <div class="skeleton-paragraph w-75 shimmer"></div>
      <div class="skeleton-buttons d-flex gap-3 mt-4">
        <div class="skeleton-btn shimmer"></div>
        <div class="skeleton-btn skeleton-btn-sm shimmer"></div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SkeletonHero",
};
</script>

<style scoped>
.skeleton-hero {
  min-height: 520px;
  background: var(--skeleton-hero-bg, #031c33);
  display: flex;
  align-items: flex-end;
  padding: 4rem 3rem;
  position: relative;
  overflow: hidden;
}

.skeleton-hero__content {
  width: 100%;
  max-width: 800px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.skeleton-pill {
  width: 140px;
  height: 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
}

.skeleton-headline {
  width: 65%;
  height: 48px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.15);
}

.skeleton-circle {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
}

.skeleton-paragraph {
  width: 90%;
  height: 16px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.08);
}

.skeleton-buttons .skeleton-btn {
  width: 180px;
  height: 42px;
  border-radius: 25px;
  background: rgba(255, 255, 255, 0.12);
}

.skeleton-buttons .skeleton-btn-sm {
  width: 130px;
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
