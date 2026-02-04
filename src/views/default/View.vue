<template>
  <div class="generate-container">
    <div class="spreadsheet-wrapper">
      <UniverSheet />
    </div>
  </div>
</template>

<script setup lang="ts">
import UniverSheet from '../../components/layouts/UniverSheet.vue';
</script>

<style scoped>
.generate-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.spreadsheet-wrapper {
  flex: 1;
  margin-bottom: 20px;
  overflow: hidden;
}
</style>