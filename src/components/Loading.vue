<template>
  <div class="loading-overlay">
    <div class="loading-spinner">
      <svg viewBox="0 0 50 50">
        <circle
          cx="25"
          cy="25"
          r="20"
          fill="none"
          stroke-width="4"
        />
      </svg>
    </div>
    <span class="loading-text">加载中...</span>
  </div>
</template>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 16px;
  z-index: 1000;
}

.loading-spinner {
  width: 48px;
  height: 48px;
}

.loading-spinner svg {
  width: 100%;
  height: 100%;
  animation: rotate 1.4s linear infinite;
}

.loading-spinner circle {
  stroke: var(--primary-color);
  stroke-linecap: round;
  stroke-dasharray: 80, 200;
  stroke-dashoffset: 0;
  animation: dash 1.4s ease-in-out infinite;
}

.loading-text {
  font-size: 14px;
  color: var(--text-secondary);
}

@keyframes rotate {
  100% {
    transform: rotate(360deg);
  }
}

@keyframes dash {
  0% {
    stroke-dasharray: 1, 200;
    stroke-dashoffset: 0;
  }
  50% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -35px;
  }
  100% {
    stroke-dasharray: 89, 200;
    stroke-dashoffset: -124px;
  }
}
</style>
