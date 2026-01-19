<!-- src/components/AppLoading.vue -->
<template>
  <div class="app-loading">
    <div class="loading-container">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading B.Y.O.B...</p>
    </div>
  </div>
</template>

<style scoped>
.app-loading {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-container {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #e5e7eb;
  border-top: 4px solid #52796F;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  color: #52796F;
  font-size: 1rem;
  font-weight: 500;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>