<template>
  <div class="dashboard-container">
    <!-- Cards Grid -->
    <div class="cards-grid mb-8">
      <!-- Card 1 -->
      <div class="dashboard-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Total Users</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">1,234</p>
          </div>
          <div class="p-3 bg-indigo-100 rounded-full">
            <svg class="w-6 h-6 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
        </div>
        <p class="mt-2 text-sm text-green-600">+12% from last month</p>
      </div>

      <!-- Card 2 -->
      <div class="dashboard-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Revenue</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">$45.2K</p>
          </div>
          <div class="p-3 bg-green-100 rounded-full">
            <svg class="w-6 h-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
        <p class="mt-2 text-sm text-green-600">+8% from last month</p>
      </div>

      <!-- Card 3 -->
      <div class="dashboard-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Orders</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">567</p>
          </div>
          <div class="p-3 bg-yellow-100 rounded-full">
            <svg class="w-6 h-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
        </div>
        <p class="mt-2 text-sm text-red-600">-3% from last month</p>
      </div>

      <!-- Card 4 -->
      <div class="dashboard-card">
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm font-medium text-gray-600">Conversion</p>
            <p class="text-2xl font-bold text-gray-900 mt-1">23.4%</p>
          </div>
          <div class="p-3 bg-purple-100 rounded-full">
            <svg class="w-6 h-6 text-purple-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
        </div>
        <p class="mt-2 text-sm text-green-600">+5% from last month</p>
      </div>
    </div>

    <!-- Recent Activity Card -->
    <div class="activity-card">
      <div class="activity-header">
        <h2 class="text-lg font-semibold text-gray-900">Recent Activity</h2>
      </div>
      <div class="p-4 md:p-6">
        <div class="space-y-4">
          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div class="icon-container bg-indigo-100">
                <svg class="w-5 h-5 text-indigo-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">New user registered</p>
              <p class="text-sm text-gray-500">John Doe joined 5 minutes ago</p>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div class="icon-container bg-green-100">
                <svg class="w-5 h-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">New order received</p>
              <p class="text-sm text-gray-500">Order #1234 - $125.00</p>
            </div>
          </div>

          <div class="flex items-center space-x-4">
            <div class="flex-shrink-0">
              <div class="icon-container bg-yellow-100">
                <svg class="w-5 h-5 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-gray-900">System alert</p>
              <p class="text-sm text-gray-500">Database backup completed</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// No special script needed for responsive layout
</script>

<style scoped>
.dashboard-container {
  min-height: 100%;
}

/* Responsive Cards Grid */
.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  width: 100%;
}

/* Individual Card */
.dashboard-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  padding: 1.5rem;
  border: 1px solid #f3f4f6;
  transition: box-shadow 0.2s ease-in-out;
  min-width: 0; /* Important for shrinking */
}

.dashboard-card:hover {
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

/* Activity Card */
.activity-card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  border: 1px solid #f3f4f6;
  overflow: hidden;
}

.activity-header {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.icon-container {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 9999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

/* Media Queries for better responsiveness */
@media (max-width: 1024px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 1rem;
  }
  
  .dashboard-card {
    padding: 1.25rem;
  }
}

@media (max-width: 768px) {
  .cards-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  .dashboard-card {
    padding: 1rem;
  }
  
  .activity-header {
    padding: 0.875rem 1.25rem;
  }
  
  .activity-card > div:last-child {
    padding: 1.25rem;
  }
}

@media (max-width: 640px) {
  .cards-grid {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  
  .dashboard-card {
    min-width: 100%;
  }
  
  .dashboard-container {
    padding: 1rem;
  }
}

/* Very small screens (when right panel is very narrow) */
@media (max-width: 480px) {
  .cards-grid {
    gap: 0.75rem;
  }
  
  .dashboard-card {
    padding: 0.875rem;
  }
  
  .activity-header {
    padding: 0.75rem 1rem;
  }
  
  .activity-card > div:last-child {
    padding: 1rem;
  }
  
  .flex.items-center.space-x-4 {
    align-items: flex-start;
  }
  
  .icon-container {
    width: 2rem;
    height: 2rem;
  }
  
  .icon-container svg {
    width: 1rem;
    height: 1rem;
  }
}

/* Extra small for very narrow panels */
@media (max-width: 380px) {
  .dashboard-card .flex.items-center.justify-between {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }
  
  .dashboard-card .p-3 {
    padding: 0.75rem;
  }
  
  .dashboard-card svg {
    width: 1.25rem;
    height: 1.25rem;
  }
}
</style>