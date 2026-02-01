// composables/UseConfirmNavigation.js
import { ref } from 'vue'

export function useConfirmNavigation() {
    const showConfirmModal = ref(false)
    const confirmMessage = ref('')
    const confirmCallback = ref(null)

    const askConfirmation = (message, callback) => {
        confirmMessage.value = message
        confirmCallback.value = callback
        showConfirmModal.value = true
    }

    const handleConfirm = () => {
        if (confirmCallback.value) {
            confirmCallback.value()
        }
        closeModal()
    }

    const handleCancel = () => {
        closeModal()
    }

    const closeModal = () => {
        showConfirmModal.value = false
        confirmMessage.value = ''
        confirmCallback.value = null
    }

    return {
        showConfirmModal,
        confirmMessage,
        askConfirmation,
        handleConfirm,
        handleCancel
    }
}