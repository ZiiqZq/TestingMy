<template>
    <div class="flex flex-col gap-4 h-full mx-4 py-4">
        <!-- Column Info -->
        <div class="bg-white rounded-3xl shadow-md w-full hover:shadow-xl transition duration-200 ease-in-out p-4">
            <input type="checkbox" id="accordion-column" class="peer hidden" checked />
            <label for="accordion-column" class="group flex justify-between cursor-pointer select-none">
                <div class="flex gap-2">
                    <div class="w-8 h-8 bg-[#9079E5] rounded-full"></div>
                    <div class="pt-1">
                        <p class="font-semibold text-[#1F2937]">Column Info</p>
                    </div>
                </div>
                <div class="text-center pt-0.5">
                    <div class="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center hover:shadow-sm hover:bg-gray-50 transition-transform duration-200 peer-checked:group-[]:rotate-90">
                        <svg class="block" width="5" height="7" viewBox="0 0 5 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.5 6.5L3.5 3.5L0.5 0.5" stroke="#4B5563" stroke-linecap="round"/>
                        </svg>
                    </div>
                </div>
            </label>
            <div class="grid overflow-hidden grid-rows-[0fr] peer-checked:grid-rows-[1fr] transition-all duration-300 ease-in-out">
                <div class="overflow-hidden">
                    <div class="mt-5 space-y-2 pl-1">
                        <div class="grid grid-cols-3">
                            <div class="text-[#4B5563] text-xs pt-0.5">Column :</div>
                            <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">{{ currentColumn.name }}</div>
                        </div>
                        <div class="grid grid-cols-3">
                            <div class="text-[#4B5563] text-xs pt-0.5">LSL :</div>
                            <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">
                                {{ currentColumn.lsl && currentColumn.lsl !== '-' && currentColumn.lsl !== 'Tidak ada' ? `${currentColumn.lsl} ${currentColumn.unit}` : '-' }}
                            </div>
                        </div>
                        <div class="grid grid-cols-3">
                            <div class="text-[#4B5563] text-xs pt-0.5">USL :</div>
                            <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">
                                {{ currentColumn.usl && currentColumn.usl !== '-' && currentColumn.usl !== 'Tidak ada' ? `${currentColumn.usl} ${currentColumn.unit}` : '-' }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Test Info -->
        <div v-if="testInfo" class="bg-white rounded-3xl shadow-md w-full hover:shadow-xl transition duration-200 ease-in-out p-4">
            <input type="checkbox" id="accordion-testinfo" class="peer hidden" checked />
            <label for="accordion-testinfo" class="group flex justify-between cursor-pointer select-none">
                <div class="flex gap-2">
                    <div class="w-8 h-8 bg-[#CDFC8E] rounded-full"></div>
                    <div class="pt-1">
                        <p class="font-semibold text-[#1F2937]">Test Info</p>
                    </div>
                </div>
                <div class="text-center pt-0.5">
                    <div class="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center hover:shadow-sm hover:bg-gray-50 transition-transform duration-200 peer-checked:group-[]:rotate-90">
                        <svg class="block" width="5" height="7" viewBox="0 0 5 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.5 6.5L3.5 3.5L0.5 0.5" stroke="#4B5563" stroke-linecap="round"/>
                        </svg>
                    </div>
                </div>
            </label>
            <div class="grid overflow-hidden grid-rows-[0fr] peer-checked:grid-rows-[1fr] transition-all duration-300 ease-in-out">
                <div class="overflow-hidden">
                    <div class="mt-5 space-y-2 pl-1">
                        <div class="grid grid-cols-3 gap-1">
                            <div class="text-[#4B5563] text-xs pt-0.5">Device :</div>
                            <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">{{ testInfo.product?.name || 'Belum dipilih' }}</div>
                        </div>
                        <div class="grid grid-cols-3 gap-1">
                            <div class="text-[#4B5563] text-xs pt-0.5">Test Type :</div>
                            <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">{{ testInfo.testType?.name || 'Belum dipilih' }}</div>
                        </div>
                        <div class="grid grid-cols-3 gap-1">
                            <div class="text-[#4B5563] text-xs pt-0.5">Operator :</div>
                            <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">{{ testInfo.operatorName || 'Belum diisi' }}</div>
                        </div>
                        <div class="grid grid-cols-3 gap-1">
                            <div class="text-[#4B5563] text-xs pt-0.5">Date :</div>
                            <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">{{ testInfo.testDate || 'Belum diisi' }}</div>
                        </div>
                        <div class="grid grid-cols-3 gap-1">
                            <div class="text-[#4B5563] text-xs pt-0.5">PO Number :</div>
                            <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">{{ testInfo.poNumber || 'Belum diisi' }}</div>
                        </div>
                        <div class="grid grid-cols-3 gap-1">
                            <div class="text-[#4B5563] text-xs pt-0.5">SN :</div>
                            <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">
                                {{ testInfo.serialNumber || '0' }} - {{ (testInfo.serialNumber || 0) + (testInfo.quantity || 1) - 1 }}
                            </div>
                        </div>
                        <div class="grid grid-cols-3 gap-1">
                            <div class="text-[#4B5563] text-xs pt-0.5">Quantity :</div>
                            <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">{{ testInfo.quantity || '1' }}</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Test Setup -->
        <div class="bg-white rounded-3xl shadow-md w-full hover:shadow-xl transition duration-200 ease-in-out p-4">
            <input type="checkbox" id="accordion-testsetup" class="peer hidden" checked />
            <label for="accordion-testsetup" class="group flex justify-between cursor-pointer select-none">
                <div class="flex gap-2">
                    <div class="w-8 h-8 bg-[#FCF98E] rounded-full"></div>
                    <div class="pt-1">
                        <p class="font-semibold text-[#1F2937]">Test Set Up</p>
                    </div>
                </div>
                <div class="text-center pt-0.5">
                    <div class="w-7 h-7 border border-gray-300 rounded-full flex items-center justify-center hover:shadow-sm hover:bg-gray-50 transition-transform duration-200 peer-checked:group-[]:rotate-90">
                        <svg class="block" width="5" height="7" viewBox="0 0 5 7" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M0.5 6.5L3.5 3.5L0.5 0.5" stroke="#4B5563" stroke-linecap="round"/>
                        </svg>
                    </div>
                </div>
            </label>
            <div class="grid overflow-hidden grid-rows-[0fr] peer-checked:grid-rows-[1fr] transition-all duration-300 ease-in-out">
                <div class="overflow-hidden">
                    <div class="mt-5 space-y-2 pl-1">
                        <div v-for="param in testParameters" :key="param.id" class="grid grid-cols-3 gap-1">
                            <div class="text-[#4B5563] text-xs pt-0.5">{{ param.parameter_name }} :</div>
                            <div class="border border-gray-300 pl-3 text-sm text-[#4B5563] rounded-lg bg-gray-100 col-span-2">
                                {{ param.parameter_value }}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>

import { ref, onMounted, onUnmounted } from 'vue'
import { useTestingSession } from '@/composables/useTestingSession'
import { useRouter } from 'vue-router'

const router = useRouter()
const { getSession } = useTestingSession()

// SET DEFAULT VALUES
const testInfo = ref({})
const currentColumn = ref({
    name: 'Pilih kolom di tabel',
    lsl: '-',
    usl: '-',
    unit: ''
})

const testParameters = ref([])

// Fungsi untuk membaca currentColumn dari localStorage
const readCurrentColumn = () => {
    try {
        const saved = localStorage.getItem('currentColumn')
        if (saved) {
            const parsed = JSON.parse(saved)
            if (parsed && typeof parsed === 'object') {
                currentColumn.value = {
                    name: parsed.name || 'Kolom',
                    lsl: parsed.lsl || '-',
                    usl: parsed.usl || '-',
                    unit: parsed.unit || ''
                }
            }
        }
    } catch (error) {
        console.log('Error reading currentColumn:', error)
    }
}

// Event listener untuk storage changes
const storageListener = (event) => {
    if (event.key === 'currentColumn') {
        readCurrentColumn()
    }
}

onMounted(() => {
    const session = getSession()
    
    if (!session) {
        console.log('Tidak ada data session, kembali ke Testing')
        router.push({ name: 'Testing' })
        return
    }
    
    testInfo.value = session

    if (session.parameters && Array.isArray(session.parameters)) {
        testParameters.value = session.parameters
    }
    
    // Baca currentColumn dari localStorage
    readCurrentColumn()

    // Polling untuk update (fallback)
    const intervalId = setInterval(readCurrentColumn, 1000)
    
    console.log('LeftTestingTable mounted with session:', session)
    
    
})
</script>