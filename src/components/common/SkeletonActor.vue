<template>
  <div class="skeleton-actor">
    <div class="skeleton-actor-photo shimmer">
      <div class="skeleton-actor-badge shimmer"></div>
    </div>
    <div class="skeleton-actor-info">
      <div class="skeleton-line w-75 shimmer"></div>
      <div class="skeleton-line w-50 shimmer"></div>
    </div>
  </div>
</template>

<script>
export default {
  name: "SkeletonActor",
};
</script>

<style scoped>
.skeleton-actor {
  width: 100%;
}

.skeleton-actor-photo {
  position: relative;
  width: 100%;
  aspect-ratio: 2/3;
  border-radius: 14px;
  background: var(--skeleton-bg, rgba(255, 255, 255, 0.07));
  overflow: hidden;
}

.skeleton-actor-badge {
  position: absolute;
  bottom: 8px;
  left: 8px;
  width: 60px;
  height: 18px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.15);
}

.skeleton-actor-info {
  margin-top: 10px;
  padding: 0 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: var(--skeleton-bg, rgba(255, 255, 255, 0.08));
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
