<template>
    <div>
        <div>
            <label for="namaProduk" class="text-sm">
                Nama Produk
            </label>
            <input type="text" id="namaProduk" class="input w-full bg-white border border-gray-200 rounded-md h-8 px-3 py-2 focus:outline-0 focus:border-b-2 focus:border-b-blue-700" />
        </div>

        <div class="my-2">
            <label for="device" class="text-sm">
                Device
            </label>
            <input type="text" id="device" class="input w-full bg-white border border-gray-200 rounded-md h-8 px-3 py-2 focus:outline-0 focus:border-b-2 focus:border-b-blue-700" />
        </div>

    </div>
    <div class=" border-t mt-4 border-t-gray-300">
        <div class="mt-4 grid grid-row gap-2">
            <button class="w-full h-16 items-center justify-center flex bg-[#6BAF92] border border-[#C4C4C4] rounded-md">
                <p class="text-white">Test Type Area 1</p>
            </button>
            <button class="w-full h-16 items-center justify-center flex bg-[#84D3B6] border border-[#C4C4C4] rounded-md">
                <p class="text-white">Test Type Area 1.5</p>
            </button>
        </div>
    </div>
</template>

<script setup> </script>
<style scoped> </style>