// Composables/UseTestingSession.js
export function useTestingSession() {
    // Simpan ke localStorage agar tetap ada meskipun page direfresh
    function saveSession(testInfo) {
        localStorage.setItem('testingData', JSON.stringify(testInfo))
    }

    function getSession() {
        const data = localStorage.getItem('testingData')
        return data ? JSON.parse(data) : null
    }

    function clearSession() {
        localStorage.removeItem('testingData')
    }

    return {
        saveSession,
        getSession,
        clearSession
    }
}