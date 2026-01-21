<template>
  <div class="min-h-full">
    <!-- Hero About -->
    <div class="hero-about">
      <div class="container mx-auto px-6 py-16">
        <router-link 
          to="/" 
          class="inline-flex items-center text-blue-400 hover:text-blue-300 mb-8"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali ke Home
        </router-link>
        
        <h1 class="text-5xl md:text-6xl font-bold text-white mb-6">
          🚀 Tentang Aplikasi Ini
        </h1>
        <p class="text-xl text-gray-300 max-w-3xl">
          Sebuah aplikasi desktop modern yang dibangun dengan teknologi terbaru
        </p>
      </div>
    </div>

    <!-- Konten About -->
    <div class="container mx-auto px-6 py-12">
      <!-- Isi konten About Anda di sini -->
      <!-- ... (tetap sama seperti sebelumnya) ... -->
    </div>
  </div>
</template>

<style scoped>
.hero-about {
  background: linear-gradient(135deg, rgba(79, 70, 229, 0.9) 0%, rgba(99, 102, 241, 0.9) 100%);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}
</style>