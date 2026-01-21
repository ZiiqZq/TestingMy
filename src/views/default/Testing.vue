<template>
    <div class="grid grid-row gap-4 pt-2">
        <div>
            <div class="relative">
                <input placeholder=" "
                    class="peer w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 shadow-sm transition duration-300 ease focus:outline-0 focus:border-b-2 focus:border-b-blue-700" />
                <label
                    class="absolute cursor-text bg-white px-1 left-2.5 top-2.5 text-slate-400 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:scale-90 pointer-events-none">
                    Nama Operator
                </label>
            </div>
        </div>
        <div>
            <div class="relative">
                <input placeholder=" "
                    class="peer w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 shadow-sm transition duration-300 ease focus:outline-0 focus:border-b-2 focus:border-b-blue-700" />
                <label
                    class="absolute cursor-text bg-white px-1 left-2.5 top-2.5 text-slate-400 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:scale-90 pointer-events-none">
                    Test Date
                </label>
            </div>
        </div>

        <div>
            <div class="relative">
                <input placeholder=" "
                    class="peer w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 shadow-sm transition duration-300 ease focus:outline-0 focus:border-b-2 focus:border-b-blue-700" />
                <label
                    class="absolute cursor-text bg-white px-1 left-2.5 top-2.5 text-slate-400 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:scale-90 pointer-events-none">
                    Oscilloscope SN
                </label>
            </div>
        </div>
        <div>
            <div class="relative">
                <input placeholder=" "
                    class="peer w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 shadow-sm transition duration-300 ease focus:outline-0 focus:border-b-2 focus:border-b-blue-700" />
                <label
                    class="absolute cursor-text bg-white px-1 left-2.5 top-2.5 text-slate-400 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:scale-90 pointer-events-none">
                    Multimeter SN
                </label>
            </div>
        </div>
        <div class="flex w-full gap-4 ">
            <div class="relative w-full">
                <input placeholder=" "
                    class="peer w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 shadow-sm transition duration-300 ease focus:outline-0 focus:border-b-2 focus:border-b-blue-700" />
                <label
                    class="absolute cursor-text bg-white px-1 left-2.5 top-2.5 text-slate-400 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:scale-90 pointer-events-none">
                    PO Number
                </label>
            </div>
            <div class="relative w-full">
                <input placeholder=" "
                    class="peer w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 shadow-sm transition duration-300 ease focus:outline-0 focus:border-b-2 focus:border-b-blue-700" />
                <label
                    class="absolute cursor-text bg-white px-1 left-2.5 top-2.5 text-slate-400 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:scale-90 pointer-events-none">
                    Lot Number
                </label>
            </div>
        </div>
        <div>
            <div class="relative">
                <input placeholder=" "
                    class="peer w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2 shadow-sm transition duration-300 ease focus:outline-0 focus:border-b-2 focus:border-b-blue-700" />
                <label
                    class="absolute cursor-text bg-white px-1 left-2.5 top-2.5 text-slate-400 text-sm transition-all transform origin-left peer-focus:-top-2 peer-focus:left-2.5 peer-focus:text-xs peer-focus:text-slate-400 peer-focus:scale-90 peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:scale-90 pointer-events-none">
                    Starting Product Serial Number
                </label>
            </div>
        </div>
        <div class="w-40 items-center justify-center grid text-center gap-2">
            <label for="device" class="text-sm">
                Jumlah
            </label>
            <div class="flex gap-2">
                <button
                    class="w-8 h-8 bg-red-400 pb-1 items-center justify-center flex rounded-md cursor-pointer text-white">-</button>
                <input type="number" id="device"
                    class="input bg-white border w-16 text-center border-gray-200 rounded-md h-8 px-3 py-2 focus:outline-0 focus:border-b-2 focus:border-b-blue-700" />
                <button class="w-8 h-8 bg-green-600 pb-1 rounded-md cursor-pointer text-white">+</button>
            </div>
        </div>

        <div class="flex w-full justify-end">
            <button class="bg-[#6BAF92]  h-10 w-32 rounded-md text-white">
                Mulai Testing
            </button>
        </div>
    </div>
</template>

<script setup>

</script>

<style scoped>

</style>