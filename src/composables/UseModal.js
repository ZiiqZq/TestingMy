// composables/useModal.js
import { ref } from 'vue'

export function useModal() {
    const showModal = ref(false)
    const modalMessage = ref('')
    const modalType = ref('warning') // 'warning', 'error', 'success'
    const modalTitle = ref('')
    const modalCallback = ref(null)

    const showWarning = (message, title = 'Perhatian', callback = null) => {
        modalMessage.value = message
        modalType.value = 'warning'
        modalTitle.value = title
        modalCallback.value = callback
        showModal.value = true
    }

    const showError = (message, title = 'Error', callback = null) => {
        modalMessage.value = message
        modalType.value = 'error'
        modalTitle.value = title
        modalCallback.value = callback
        showModal.value = true
    }

    const showSuccess = (message, title = 'Sukses', callback = null) => {
        modalMessage.value = message
        modalType.value = 'success'
        modalTitle.value = title
        modalCallback.value = callback
        showModal.value = true
    }

    const hideModal = () => {
        showModal.value = false
        if (modalCallback.value) {
            modalCallback.value()
            modalCallback.value = null
        }
    }

    return {
        showModal,
        modalMessage,
        modalType,
        modalTitle,
        showWarning,
        showError,
        showSuccess,
        hideModal
    }
}