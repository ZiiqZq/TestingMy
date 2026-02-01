<!-- components/modals/SuccessModal.vue -->
<template>
    <div 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
        v-if="isVisible"
        @click.self="closeModal"
    >
        <div class="bg-white rounded-lg p-7 max-w-sm w-full mx-4 shadow-2xl border border-green-200\">
            <div class="flex items-start mb-5">
                <div class="bg-green-50 p-3 rounded-full mr-4 flex-shrink-0">
                    <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-900">Sukses</h3>
            </div>
            
            <p class="text-sm text-gray-600 mb-6 leading-relaxed whitespace-pre-line">
                {{ message }}
            </p>
            
            <div class="flex justify-end pt-2 border-t border-gray-100">
                <button 
                    @click="closeModal"
                    class="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
                >
                    OK
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
    message: {
        type: String,
        required: true
    }
})

const emit = defineEmits(['close'])

const isVisible = ref(false)

const show = () => {
    isVisible.value = true
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
}

const hide = () => {
    isVisible.value = false
    // Restore body scroll
    document.body.style.overflow = 'auto'
    emit('close')
}

const closeModal = () => {
    hide()
}

// Handle ESC key to close
const handleKeydown = (event) => {
    if (event.key === 'Escape' && isVisible.value) {
        closeModal()
    }
}

onMounted(() => {
    document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'auto'
})

defineExpose({
    show,
    hide
})
</script>