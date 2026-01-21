// src/composables/useMainLayout.js
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRoute } from 'vue-router'

export function useMainLayout() {
    const route = useRoute()  // ✅ Pindahkan ke dalam fungsi

    // Gunakan pageTitle dari meta (router/index.js)
    const pageTitle = computed(() =>
        route.meta.pageTitle || route.name
    )

    // Tittle dari route.meta (router/index.js)
    const navTitle = computed(() => route.meta.navTitle)

    // Tentukan apakah show title di full layout
    const showTitleInFullLayout = computed(() => {
        const hideTitlePages = ['/account', '/settings']
        return !hideTitlePages.includes(route.path)
    })

    // Resizable state
    const leftPanelWidth = ref(300)
    const isResizing = ref(false)

    // Resize functions
    function startResize(e) {
        isResizing.value = true
        document.addEventListener('mousemove', handleResize)
        document.addEventListener('mouseup', stopResize)
        document.body.style.cursor = 'ew-resize'
        document.body.classList.add('resizing')
        e.preventDefault()
    }

    function handleResize(e) {
        if (!isResizing.value) return

        const containerRect = document.querySelector('.main-content').getBoundingClientRect()
        const newWidth = e.clientX - containerRect.left

        const minWidth = 280
        const maxWidth = containerRect.width * 0.5

        if (newWidth >= minWidth && newWidth <= maxWidth) {
            leftPanelWidth.value = newWidth
        }
    }

    function stopResize() {
        isResizing.value = false
        document.removeEventListener('mousemove', handleResize)
        document.removeEventListener('mouseup', stopResize)
        document.body.style.cursor = ''
        document.body.classList.remove('resizing')
        localStorage.setItem('leftPanelWidth', leftPanelWidth.value)
    }

    // Load saved width
    onMounted(() => {
        const savedWidth = localStorage.getItem('leftPanelWidth')
        if (savedWidth) {
            leftPanelWidth.value = parseInt(savedWidth)
        }
    })

    // Cleanup
    onUnmounted(() => {
        stopResize()
    })

    onMounted(async () => {
        const users = await window.electron.db.getUsers();
        console.log(users);
    });


    return {
        pageTitle,
        navTitle,
        showTitleInFullLayout,
        leftPanelWidth,
        isResizing,
        startResize,
        route
    }
}