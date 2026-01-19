<template>
  <div class="left-sidebar">
    <div class="space-y-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
        <select class="w-full p-2 border rounded">
          <option>Today</option>
          <option>Last 7 Days</option>
          <option>This Month</option>
        </select>
      </div>
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Metrics</label>
        <div class="space-y-2">
          <label class="flex items-center">
            <input type="checkbox" class="mr-2"> Revenue
          </label>
          <label class="flex items-center">
            <input type="checkbox" class="mr-2"> Orders
          </label>
          <label class="flex items-center">
            <input type="checkbox" class="mr-2"> Users
          </label>
        </div>
      </div>
    </div>
  </div>
</template>