<!-- ConfirmModal.vue -->
<template>
    <div 
        class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[100]"
        v-if="isVisible"
        @click.self="closeModal"
    >
        <div class="bg-white rounded-lg p-7 max-w-sm w-full mx-4 shadow-2xl border border-yellow-200">
            <div class="flex items-start mb-5">
                <div class="bg-yellow-50 p-3 rounded-full mr-4 flex-shrink-0">
                    <svg class="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
                            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                </div>
                <h3 class="text-lg font-bold text-gray-900">Perhatian</h3>
            </div>
            
            <p class="text-sm text-gray-600 mb-6 leading-relaxed whitespace-pre-line">
                {{ message }}
            </p>
            
            <div class="flex justify-end gap-3 pt-2 border-t border-gray-100">
                <button 
                    @click="handleCancel"
                    class="px-5 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
                >
                    {{ cancelText }}
                </button>
                <button 
                    @click="handleConfirm"
                    class="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 text-sm font-semibold shadow-sm hover:shadow-md"
                >
                    {{ confirmText }}
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
    },
    confirmText: {
        type: String,
        default: 'Ya, Tinggalkan'
    },
    cancelText: {
        type: String,
        default: 'Batal'
    }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

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
}

const handleConfirm = () => {
    emit('confirm')
    hide()
}

const handleCancel = () => {
    emit('cancel')
    hide()
}

const closeModal = () => {
    emit('close')
    hide()
}

// Handle ESC key to close
const handleKeydown = (event) => {
    if (event.key === 'Escape' && isVisible.value) {
        handleCancel()
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