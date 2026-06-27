<template>
    <div class="p-4 space-y-5 min-h-full bg-white mb-14">

        <!-- Page Header -->
        <div class="flex justify-between items-center">
            <div>
                <h1 class="text-xl font-bold tracking-tight text-gray-800">Analytics Dashboard</h1>
                <p class="text-xs mt-0.5 text-gray-400">Quality & yield performance overview</p>
            </div>
            <button @click="isDark = !isDark"
                :class="isDark
                    ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600'
                    : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'"
                class="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium shadow-sm transition-all">
                <span>{{ isDark ? '☀️' : '🌙' }}</span>
                <span>{{ isDark ? 'Light Mode' : 'Dark Mode' }}</span>
            </button>
        </div>

        <div v-if="loading" class="flex justify-center py-20 text-gray-400 text-sm">
            Loading charts...
        </div>

        <template v-else>

            <!-- KPI Row -->
            <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div :class="cardClass" class="rounded-xl shadow-sm p-4 flex flex-col items-center justify-center gap-1">
                    <span :class="labelClass" class="text-xs font-medium uppercase tracking-wide">Total Tested</span>
                    <span :class="valueClass" class="text-3xl font-bold tabular-nums">
                        {{ kpiSummary.total_tested?.toLocaleString() || 0 }}
                    </span>
                    <span :class="labelClass" class="text-xs">units</span>
                </div>

                <div :class="cardClass" class="rounded-xl shadow-sm p-4 flex flex-col items-center justify-center gap-1">
                    <span :class="labelClass" class="text-xs font-medium uppercase tracking-wide">Total Retest</span>
                    <span class="text-3xl font-bold tabular-nums text-amber-500">
                        {{ kpiSummary.total_retest?.toLocaleString() || 0 }}
                    </span>
                    <span :class="labelClass" class="text-xs">units</span>
                </div>

                <!-- First Test Yield Gauge -->
                <div :class="cardClass" class="rounded-xl shadow-sm p-3">
                    <span :class="labelClass" class="text-xs font-medium uppercase tracking-wide block text-center mb-1">
                        First Test Yield
                    </span>
                    <v-chart class="gauge" :option="fpyGaugeOption" autoresize />
                    <div class="text-center mt-1 text-xs" :class="labelClass">
                        Pass {{ kpiSummary.first_test_pass }} / Fail {{ kpiSummary.first_test_fail }}
                    </div>
                </div>

                <!-- Final Test Yield Gauge -->
                <div :class="cardClass" class="rounded-xl shadow-sm p-3">
                    <span :class="labelClass" class="text-xs font-medium uppercase tracking-wide block text-center mb-1">
                        Final Test Yield
                    </span>
                    <v-chart class="gauge" :option="finalPassGaugeOption" autoresize />
                    <div class="text-center mt-1 text-xs" :class="labelClass">
                        Pass {{ kpiSummary.final_test_pass }} / Fail {{ kpiSummary.final_test_fail }}
                    </div>
                </div>
            </div>

            <!-- Stacked Area — Testing Volume -->
            <div :class="cardClass" class="rounded-xl shadow-sm p-4">
                <div class="flex justify-between items-center mb-3">
                    <div>
                        <h2 :class="titleClass" class="text-base font-semibold">Testing Volume Trend</h2>
                        <span :class="labelClass" class="text-xs">Pass & Fail unit count over time (stacked)</span>
                    </div>
                    <div :class="toggleBg" class="flex rounded-lg p-1 text-xs gap-0.5">
                        <button @click="yieldViewMode = 'total'"
                            :class="yieldViewMode === 'total' ? toggleActive : toggleInactive"
                            class="px-3 py-1 rounded-md font-medium transition-all">Total</button>
                        <button @click="yieldViewMode = 'byProduct'"
                            :class="yieldViewMode === 'byProduct' ? toggleActive : toggleInactive"
                            class="px-3 py-1 rounded-md font-medium transition-all">Per Product</button>
                    </div>
                </div>
                <div v-if="yieldData.length === 0" :class="labelClass" class="flex justify-center py-10 text-sm">No data available</div>
                <v-chart v-else class="chart" :option="stackedAreaOption" autoresize />
            </div>

            <!-- Yield % Trend + Donut -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div :class="cardClass" class="rounded-xl shadow-sm p-4 md:col-span-2">
                    <h2 :class="titleClass" class="text-base font-semibold mb-1">Yield % Trend</h2>
                    <span :class="labelClass" class="text-xs block mb-2">Pass rate over time vs 95% target</span>
                    <div v-if="yieldData.length === 0" :class="labelClass" class="flex justify-center py-10 text-sm">No data</div>
                    <v-chart v-else class="chart-sm" :option="yieldTrendOption" autoresize />
                </div>
                <div :class="cardClass" class="rounded-xl shadow-sm p-4">
                    <h2 :class="titleClass" class="text-base font-semibold mb-1">Pass vs Fail</h2>
                    <span :class="labelClass" class="text-xs block mb-2">Overall unit distribution</span>
                    <v-chart class="chart-sm" :option="passFailDonutOption" autoresize />
                </div>
            </div>

            <!-- Yield by Product + Test Type -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div :class="cardClass" class="rounded-xl shadow-sm p-4">
                    <h2 :class="titleClass" class="text-base font-semibold mb-1">Yield by Product</h2>
                    <span :class="labelClass" class="text-xs block mb-2">Red = below 80% threshold</span>
                    <div v-if="yieldByProductSnapshot.length === 0" :class="labelClass" class="flex justify-center py-10 text-sm">No data</div>
                    <v-chart v-else class="chart-sm" :option="yieldByProductOption" autoresize />
                </div>
                <div :class="cardClass" class="rounded-xl shadow-sm p-4">
                    <h2 :class="titleClass" class="text-base font-semibold mb-1">Yield by Test Type</h2>
                    <span :class="labelClass" class="text-xs block mb-2">Yield rate per testing stage</span>
                    <div v-if="yieldByTestTypeSnapshot.length === 0" :class="labelClass" class="flex justify-center py-10 text-sm">No data</div>
                    <v-chart v-else class="chart-sm" :option="yieldByTestTypeOption" autoresize />
                </div>
            </div>

            <!-- Volume & Retest -->
            <div :class="cardClass" class="rounded-xl shadow-sm p-4">
                <h2 :class="titleClass" class="text-base font-semibold mb-1">Volume & Retest Rate</h2>
                <span :class="labelClass" class="text-xs block mb-2">Units tested per day and retest rate %</span>
                <div v-if="yieldDataTotal.length === 0" :class="labelClass" class="flex justify-center py-10 text-sm">No data</div>
                <v-chart v-else class="chart" :option="volumeRetestOption" autoresize />
            </div>

            <!-- Combined Pareto Card -->
            <div :class="cardClass" class="rounded-xl shadow-sm p-4">
                <div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                    <div>
                        <h2 :class="titleClass" class="text-base font-semibold">Pareto Analysis — 80/20 Rule</h2>
                        <span :class="labelClass" class="text-xs">
                            Fixing 20% of root causes eliminates 80% of failures
                        </span>
                    </div>
                    <div :class="toggleBg" class="flex rounded-lg p-1 text-xs gap-0.5 self-start flex-shrink-0">
                        <button v-for="tab in paretoTabs" :key="tab.key"
                            @click="paretoActiveTab = tab.key"
                            :class="paretoActiveTab === tab.key ? toggleActive : toggleInactive"
                            class="px-3 py-1 rounded-md font-medium transition-all whitespace-nowrap">
                            {{ tab.label }}
                        </button>
                    </div>
                </div>

                <div v-if="paretoActiveTab === 'parameter'" class="flex justify-end mb-3">
                    <div :class="toggleBg" class="flex rounded-lg p-1 text-xs gap-0.5">
                        <button @click="paretoViewMode = 'total'"
                            :class="paretoViewMode === 'total' ? toggleActive : toggleInactive"
                            class="px-3 py-1 rounded-md font-medium transition-all">Combined</button>
                        <button @click="paretoViewMode = 'byProduct'"
                            :class="paretoViewMode === 'byProduct' ? toggleActive : toggleInactive"
                            class="px-3 py-1 rounded-md font-medium transition-all">By Product</button>
                    </div>
                </div>

                <div v-if="currentParetoCategories.length === 0" :class="labelClass" class="flex justify-center py-10 text-sm">
                    No failure data available
                </div>
                <template v-else>
                    <v-chart class="chart" :option="currentParetoOption" autoresize />
                    <div v-if="paretoActiveTab === 'parameter' && paretoViewMode === 'total'"
                        class="flex flex-wrap items-center gap-4 mt-3 px-1 text-xs" :class="labelClass">
                        <span class="flex items-center gap-1.5">
                            <span class="w-3 h-3 rounded-sm inline-block" style="background:#C0392B"></span>
                            Vital Few — {{ paretoVitalFewCount }} of {{ paretoCategories.length }} categories
                        </span>
                        <span class="flex items-center gap-1.5">
                            <span class="w-3 h-3 rounded-sm inline-block" style="background:#B0B7B3"></span>
                            Trivial Many
                        </span>
                        <span class="flex items-center gap-1.5">
                            <span class="w-3 h-3 rounded-sm inline-block" style="background:#2C3E50"></span>
                            Cumulative %
                        </span>
                    </div>
                </template>
            </div>

        </template>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAnalytics } from '@/composables/useAnalytics'
import VChart from 'vue-echarts'
import { use, graphic } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { LineChart, BarChart, PieChart, GaugeChart } from 'echarts/charts'
import {
    TooltipComponent, LegendComponent, GridComponent,
    DataZoomComponent, ToolboxComponent, MarkLineComponent, MarkAreaComponent
} from 'echarts/components'

use([
    CanvasRenderer, LineChart, BarChart, PieChart, GaugeChart,
    TooltipComponent, LegendComponent, GridComponent,
    DataZoomComponent, ToolboxComponent, MarkLineComponent, MarkAreaComponent
])

const {
    loading, yieldData, yieldDataTotal, yieldDataByProduct,
    yieldByProductSnapshot, yieldByTestTypeSnapshot, yieldViewMode,
    paretoDataTotal, paretoDataByProduct, paretoByPO, paretoByOperator, paretoViewMode,
    kpiSummary, kpiFirstTestYield, kpiFinalTestYield
} = useAnalytics()

// ─── Dark Mode (cards only, no chart recompute) ───────────────
const isDark = ref(false)

const cardClass    = computed(() => isDark.value
    ? 'bg-gray-800 border border-gray-700/50'
    : 'bg-white border border-gray-100')
const titleClass   = computed(() => isDark.value ? 'text-gray-100' : 'text-gray-700')
const labelClass   = computed(() => isDark.value ? 'text-gray-400' : 'text-gray-400')
const valueClass   = computed(() => isDark.value ? 'text-white'    : 'text-gray-800')
const toggleBg     = computed(() => isDark.value ? 'bg-gray-700'   : 'bg-gray-100')
const toggleActive = computed(() => isDark.value
    ? 'bg-gray-900 text-white shadow'
    : 'bg-white text-gray-800 shadow-sm')
const toggleInactive = computed(() => isDark.value ? 'text-gray-400' : 'text-gray-500')

// ─── Pareto Tabs ─────────────────────────────────────────────
const paretoActiveTab = ref('parameter')
const paretoTabs = [
    { key: 'parameter', label: 'By Parameter' },
    { key: 'po',        label: 'By PO Number' },
    { key: 'operator',  label: 'By Operator'  }
]

// ─── Colour constants (no isDark — charts never recompute on toggle) ──
const COLORS = {
    pass:      '#2F9E6F',
    fail:      '#E63946',
    accent:    '#3A86FF',
    amber:     '#F4A261',
    vitalFew:  '#C0392B',
    trivial:   '#B0B7B3',
    cumLine:   '#2C3E50',
    byProduct: ['#2F6F4E','#3A86FF','#F4A261','#8338EC','#06D6A0','#FF006E']
}

const GRADIENT_PAIRS = [
    ['rgb(128,255,165)', 'rgb(1,191,236)'],
    ['rgb(0,221,255)',   'rgb(77,119,255)'],
    ['rgb(55,162,255)',  'rgb(116,21,219)'],
    ['rgb(255,191,0)',   'rgb(224,62,76)'],
    ['rgb(255,0,135)',   'rgb(135,0,157)'],
]

function lg(c1, c2) {
    return new graphic.LinearGradient(0, 0, 0, 1, [
        { offset: 0, color: c1 },
        { offset: 1, color: c2 }
    ])
}

// ─── Gauges (depend only on KPI data, NOT isDark) ────────────
function buildGauge(value, color, bgColor = '#E5E7EB') {
    return {
        series: [{
            type: 'gauge', startAngle: 200, endAngle: -20, min: 0, max: 100,
            progress: { show: true, width: 12, itemStyle: { color } },
            axisLine: { lineStyle: { width: 12, color: [[1, bgColor]] } },
            pointer: { show: false }, axisTick: { show: false },
            splitLine: { show: false }, axisLabel: { show: false },
            detail: {
                valueAnimation: true, formatter: '{value}%',
                fontSize: 20, fontWeight: 'bold', color: '#1F2937',
                offsetCenter: [0, 0]
            },
            data: [{ value }]
        }]
    }
}

const fpyGaugeOption      = computed(() => buildGauge(kpiFirstTestYield.value,  '#2F9E6F'))
const finalPassGaugeOption = computed(() => buildGauge(kpiFinalTestYield.value,  '#3A86FF'))

// ─── Pass/Fail Donut ─────────────────────────────────────────
const passFailDonutOption = computed(() => ({
    tooltip: { trigger: 'item', formatter: '{b}: {c} ({d}%)' },
    legend: { bottom: 0 },
    series: [{
        type: 'pie', radius: ['52%', '72%'],
        label: { show: true, formatter: '{b}\n{d}%' },
        data: [
            { value: kpiSummary.value.total_pass || 0, name: 'Pass', itemStyle: { color: COLORS.pass } },
            { value: kpiSummary.value.total_fail || 0, name: 'Fail', itemStyle: { color: COLORS.fail } }
        ]
    }]
}))

// ─── Stacked Area (Volume) ────────────────────────────────────
const stackedAreaOption = computed(() => {
    const toolbox = { feature: { saveAsImage: { name: 'testing_volume' } } }

    if (yieldViewMode.value === 'total') {
        const data = yieldDataTotal.value
        if (!data.length) return {}
        return {
            color: [COLORS.pass, COLORS.fail],
            tooltip: {
                trigger: 'axis',
                axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } },
                formatter: (params) => {
                    const d = data[params[0].dataIndex]
                    return `<strong>${d.test_date}</strong><br/>
                        Pass: <b>${d.pass}</b><br/>
                        Fail: <b>${d.fail}</b><br/>
                        Yield: <b>${d.yield}%</b>`
                }
            },
            legend: { data: ['Pass', 'Fail'] },
            toolbox,
            xAxis: [{ type: 'category', boundaryGap: false, data: data.map(d => d.test_date), axisLabel: { rotate: 30, fontSize: 10 } }],
            yAxis: [{ type: 'value', name: 'Units' }],
            series: [
                {
                    name: 'Pass', type: 'line', stack: 'Total', smooth: true,
                    lineStyle: { width: 0 }, showSymbol: false,
                    areaStyle: { opacity: 0.85, color: lg('rgb(47,158,111)', 'rgb(6,214,160)') },
                    emphasis: { focus: 'series' },
                    data: data.map(d => d.pass)
                },
                {
                    name: 'Fail', type: 'line', stack: 'Total', smooth: true,
                    lineStyle: { width: 0 }, showSymbol: false,
                    areaStyle: { opacity: 0.85, color: lg('rgb(230,57,70)', 'rgb(255,140,90)') },
                    emphasis: { focus: 'series' },
                    data: data.map(d => d.fail)
                }
            ],
            grid: { top: 30, bottom: 65, left: 55, right: 20 },
            dataZoom: [{ type: 'inside' }]
        }
    }

    // Per Product — stack total units per product
    const dates = [...new Set(yieldData.value.map(d => d.test_date))].sort()
    const grouped = new Map()
    yieldData.value.forEach(row => {
        const key = row.product_name || `Product #${row.product_id}`
        if (!grouped.has(key)) grouped.set(key, new Map())
        grouped.get(key).set(row.test_date, Number(row.total))
    })
    const series = Array.from(grouped.entries()).map(([name, dateMap], i) => {
        const [c1, c2] = GRADIENT_PAIRS[i % GRADIENT_PAIRS.length]
        return {
            name, type: 'line', stack: 'Total', smooth: true,
            lineStyle: { width: 0 }, showSymbol: false,
            areaStyle: { opacity: 0.8, color: lg(c1, c2) },
            emphasis: { focus: 'series' },
            data: dates.map(d => dateMap.get(d) || 0)
        }
    })
    if (!dates.length) return {}
    return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross', label: { backgroundColor: '#6a7985' } } },
        legend: { data: series.map(s => s.name), bottom: 0, type: 'scroll' },
        toolbox,
        xAxis: [{ type: 'category', boundaryGap: false, data: dates, axisLabel: { rotate: 30, fontSize: 10 } }],
        yAxis: [{ type: 'value', name: 'Units' }],
        series,
        grid: { top: 30, bottom: 70, left: 55, right: 20 },
        dataZoom: [{ type: 'inside' }]
    }
})

// ─── Yield % Trend ────────────────────────────────────────────
const yieldTrendOption = computed(() => {
    const data = yieldDataTotal.value
    if (!data.length) return {}
    return {
        tooltip: {
            trigger: 'axis',
            formatter: (params) => {
                const d = data[params[0].dataIndex]
                return `<strong>${d.test_date}</strong><br/>Yield: <b>${d.yield}%</b><br/>Pass: ${d.pass} / Fail: ${d.fail}`
            }
        },
        xAxis: { type: 'category', data: data.map(d => d.test_date), axisLabel: { rotate: 30, fontSize: 10 } },
        yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
        series: [{
            data: data.map(d => d.yield), type: 'line', smooth: true,
            lineStyle: { color: COLORS.accent, width: 2.5 },
            areaStyle: { color: lg('rgba(58,134,255,0.4)', 'rgba(58,134,255,0.02)') },
            symbol: 'circle', symbolSize: 7, itemStyle: { color: COLORS.accent },
            markLine: {
                silent: true,
                data: [{ yAxis: 95, label: { formatter: 'Target 95%', color: COLORS.fail }, lineStyle: { color: COLORS.fail, type: 'dashed' } }]
            }
        }],
        grid: { top: 20, bottom: 60, left: 55, right: 20 },
        dataZoom: [{ type: 'inside' }]
    }
})

// ─── Yield by Product ─────────────────────────────────────────
const yieldByProductOption = computed(() => {
    const data = yieldByProductSnapshot.value
    if (!data.length) return {}
    return {
        tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
        grid: { left: 120, right: 55, top: 10, bottom: 10 },
        xAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%', fontSize: 10 } },
        yAxis: { type: 'category', data: data.map(d => d.name), axisLabel: { fontSize: 10 } },
        series: [{
            type: 'bar',
            data: data.map(d => ({
                value: d.yield,
                itemStyle: {
                    color: d.yield < 80
                        ? lg('rgb(230,57,70)', 'rgb(255,140,90)')
                        : lg('rgb(47,158,111)', 'rgb(6,214,160)'),
                    borderRadius: [0, 4, 4, 0]
                }
            })),
            label: { show: true, position: 'right', formatter: '{c}%', fontSize: 10 }
        }]
    }
})

// ─── Yield by Test Type ───────────────────────────────────────
const yieldByTestTypeOption = computed(() => {
    const data = yieldByTestTypeSnapshot.value
    if (!data.length) return {}
    return {
        tooltip: { trigger: 'axis', formatter: '{b}: {c}%' },
        xAxis: { type: 'category', data: data.map(d => d.name) },
        yAxis: { type: 'value', min: 0, max: 100, axisLabel: { formatter: '{value}%' } },
        series: [{
            type: 'bar', barWidth: '45%',
            data: data.map(d => ({
                value: d.yield,
                itemStyle: { color: lg('rgb(58,134,255)', 'rgb(116,21,219)'), borderRadius: [4, 4, 0, 0] }
            })),
            label: { show: true, position: 'top', formatter: '{c}%', fontSize: 11, fontWeight: 'bold' }
        }],
        grid: { top: 30, bottom: 20, left: 55, right: 15 }
    }
})

// ─── Volume & Retest ──────────────────────────────────────────
const volumeRetestOption = computed(() => {
    const data = yieldDataTotal.value
    if (!data.length) return {}
    return {
        tooltip: { trigger: 'axis' },
        legend: { data: ['Volume Tested', 'Retest Rate %'] },
        xAxis: { type: 'category', data: data.map(d => d.test_date), axisLabel: { rotate: 30, fontSize: 10 } },
        yAxis: [
            { type: 'value', name: 'Units', position: 'left' },
            { type: 'value', name: 'Retest %', position: 'right', min: 0, max: 100, axisLabel: { formatter: '{value}%' } }
        ],
        series: [
            {
                name: 'Volume Tested', type: 'bar',
                data: data.map(d => d.total),
                itemStyle: { color: lg('rgb(58,134,255)', 'rgb(116,21,219)'), borderRadius: [4, 4, 0, 0] }
            },
            {
                name: 'Retest Rate %', type: 'line', yAxisIndex: 1,
                data: data.map(d => d.retestRate), smooth: true,
                lineStyle: { color: COLORS.amber, width: 2.5 },
                itemStyle: { color: COLORS.amber },
                symbol: 'circle', symbolSize: 6
            }
        ],
        grid: { top: 30, bottom: 65, left: 55, right: 60 },
        dataZoom: [{ type: 'inside' }]
    }
})

// ─── Pareto Helpers ───────────────────────────────────────────
const paretoCategories    = computed(() => paretoDataTotal.value.categories || [])
const paretoVitalFewCount = computed(() => {
    const c = paretoDataTotal.value.cumulative || []
    const i = c.findIndex(v => v >= 80)
    return i === -1 ? c.length : i + 1
})

function buildParetoComboOption(paretoData, barName = 'Failures') {
    const { categories, counts, cumulative } = paretoData
    if (!categories?.length) return {}
    const idx = cumulative.findIndex(c => c >= 80)
    const vfc = idx === -1 ? cumulative.length : idx + 1

    return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: [barName, 'Cumulative %'], bottom: 0 },
        toolbox: { feature: { saveAsImage: { name: 'pareto' } } },
        xAxis: { type: 'category', data: categories, axisLabel: { rotate: 30, fontSize: 10, interval: 0 } },
        yAxis: [
            { type: 'value', name: barName, position: 'left' },
            { type: 'value', name: 'Cumulative %', position: 'right', min: 0, max: 100, axisLabel: { formatter: '{value}%' } }
        ],
        series: [
            {
                name: barName, type: 'bar',
                data: counts.map((count, i) => ({
                    value: count,
                    itemStyle: { color: i < vfc ? COLORS.vitalFew : COLORS.trivial, borderRadius: [4, 4, 0, 0] }
                })),
                markArea: {
                    silent: true,
                    itemStyle: { color: 'rgba(192,57,43,0.07)' },
                    data: [[{ xAxis: 0 }, { xAxis: vfc - 1 }]]
                }
            },
            {
                name: 'Cumulative %', type: 'line', yAxisIndex: 1,
                data: cumulative, smooth: true,
                lineStyle: { color: COLORS.cumLine, width: 2.5 },
                itemStyle: { color: COLORS.cumLine },
                symbol: 'circle', symbolSize: 7,
                markLine: {
                    silent: true,
                    data: [{ yAxis: 80, label: { formatter: '80% target', color: COLORS.vitalFew }, lineStyle: { color: COLORS.vitalFew, type: 'dashed' } }]
                }
            }
        ],
        grid: { top: 25, bottom: 75, left: 55, right: 60 }
    }
}

function buildByProductParetoOption() {
    const categories = paretoDataTotal.value.categories || []
    const cumulative = paretoDataTotal.value.cumulative || []
    if (!categories.length) return {}

    const barSeries = paretoDataByProduct.value.series.map((s, i) => ({
        name: s.name, type: 'bar', stack: 'total', data: s.data,
        itemStyle: { color: COLORS.byProduct[i % COLORS.byProduct.length] }
    }))
    return {
        tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
        legend: { data: [...barSeries.map(s => s.name), 'Cumulative %'], bottom: 0, type: 'scroll' },
        xAxis: { type: 'category', data: categories, axisLabel: { rotate: 30, fontSize: 10, interval: 0 } },
        yAxis: [
            { type: 'value', name: 'Failures', position: 'left' },
            { type: 'value', name: 'Cumulative %', position: 'right', min: 0, max: 100, axisLabel: { formatter: '{value}%' } }
        ],
        series: [
            ...barSeries,
            {
                name: 'Cumulative %', type: 'line', yAxisIndex: 1,
                data: cumulative, smooth: true,
                lineStyle: { color: COLORS.cumLine, width: 2.5 },
                itemStyle: { color: COLORS.cumLine },
                symbol: 'circle', symbolSize: 7,
                markLine: {
                    silent: true,
                    data: [{ yAxis: 80, label: { formatter: '80% target', color: COLORS.vitalFew }, lineStyle: { color: COLORS.vitalFew, type: 'dashed' } }]
                }
            }
        ],
        grid: { top: 25, bottom: 75, left: 55, right: 60 }
    }
}

// ─── Active Pareto Routing ────────────────────────────────────
const currentParetoCategories = computed(() => {
    if (paretoActiveTab.value === 'po')       return paretoByPO.value.categories       || []
    if (paretoActiveTab.value === 'operator') return paretoByOperator.value.categories || []
    return paretoDataTotal.value.categories || []
})

const currentParetoOption = computed(() => {
    if (paretoActiveTab.value === 'po')       return buildParetoComboOption(paretoByPO.value)
    if (paretoActiveTab.value === 'operator') return buildParetoComboOption(paretoByOperator.value)
    if (paretoViewMode.value === 'byProduct') return buildByProductParetoOption()
    return buildParetoComboOption(paretoDataTotal.value)
})
</script>

<style scoped>
.chart    { width: 100%; height: 320px; }
.chart-sm { width: 100%; height: 230px; }
.gauge    { width: 100%; height: 120px; }
</style>