// router/index.js
import { createRouter, createWebHistory } from 'vue-router'

// Lazy load components
const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: () => import('../views/default/Dashboard.vue'),
        meta: {
            layout: 'full',
            showPageTitle: true,
            showLeftSidebar: false,
            pageTitle: 'Dashboard'
        },
    },
    {
        path: '/dashboard',
        redirect: '/'
    },
    {
        path: '/loading',
        name: 'Loading',
        component: () => import('../components/layouts/AppLoading.vue')
    },
    {
        path: '/about',
        name: 'About',
        component: () => import('../views/default/About.vue'),
        meta: {
            layout: 'grid',
            showPageTitle: true,
            showLeftSidebar: true,
            pageTitle: 'About',
            showNavbar: false,
        },
    },
    {
        path: '/test-result',
        name: 'test-result',
        components: {
            default: () => import('../views/default/TestResults.vue'),
            LeftSidebar: () => import('../views/left/LeftTestResults.vue')
        },
        meta: {
            layout: 'grid',
            showPageTitle: true,
            showLeftSidebar: true,
            pageTitle: 'View',
            showNavbar: true,
            navTitle: 'View Testing Data'
        }
    },

    {
        path: '/testing',
        name: 'Testing',
        components: {
            default: () => import('../views/default/Testing.vue'),
            LeftSidebar: () => import('../views/left/LeftTesting.vue')
        },
        meta: {
            layout: 'grid',
            showPageTitle: true,
            showLeftSidebar: true,
            pageTitle: 'Setup',
            showNavbar: true,
            navTitle: 'Informasi Test'
        }
    },
    {
        path: '/testing-table',
        name: 'TestingTable',
        components: {
            default: () => import('../views/default/TestingTable.vue'),
            LeftSidebar: () => import('../views/left/LeftTestingTable.vue')
        },
        meta: {
            layout: 'grid',
            showPageTitle: false,
            showLeftSidebar: true,
            pageTitle: 'Testing Table',
            showNavbar: false,
            navTitle: 'Testing Table'
        }
    },

    {
        path: '/analytics',
        name: 'analytics',
        components: {
            default: () => import('../views/default/Analytics.vue'),
            LeftSidebar: () => import('../views/left/LeftAnalytics.vue')
        },
        meta: {
            layout: 'grid',
            showPageTitle: true,
            showLeftSidebar: true,
            pageTitle: 'Setup',
            showNavbar: true,
            navTitle: 'Overall Testing'
        }
    },

    {
        path: '/add-product',
        name: 'AddProduct',
        components: {
            default: () => import('../views/default/AddProduct.vue'),
            LeftSidebar: () => import('../views/left/LeftAddProduct.vue')
        },
        meta: {
            layout: 'grid',
            showPageTitle: true,
            showLeftSidebar: true,
            pageTitle: 'Add Product',
            showNavbar: true,
            navTitle: 'Product Parameters'
        }
    },

    {
        path: '/manage-users',
        name: 'ManageUsers',
        component: () => import('../views/default/ManageUsers.vue'),
        meta: {
            layout: 'full',
            showPageTitle: true,
            showLeftSidebar: false,
            pageTitle: 'Manage Users'
        },
    },

    {
        path: '/manage',
        name: 'manage',
        components: {
            default: () => import('../views/default/Manage.vue'),
            LeftSidebar: () => import('../views/left/LeftManage.vue')
        },
        meta: {
            layout: 'grid',
            showPageTitle: true,
            showLeftSidebar: true,
            pageTitle: 'Filter',
            showNavbar: true,
            navTitle: 'Our Products'
        }
    },

    {
        path: '/generate',
        name: 'Generate',
        component: () => import('../views/default/Generate.vue'),
        meta: {
            layout: 'full',
            showPageTitle: true,
            showLeftSidebar: false,
            pageTitle: 'Generate'
        },
    },

    {
        path: '/testing-detail',
        name: 'TestingDetail',
        components: {
            default: () => import('../views/default/TestingDetail.vue'),
            LeftSidebar: () => import('../views/left/LeftTestingDetail.vue')
    },
        meta: {
            layout: 'grid',
            showPageTitle: true,
            showLeftSidebar: true,
            pageTitle: 'Detail Hasil Testing',
            showNavbar: true,
            navTitle: 'Detail Testing'
        }
    },
    {
        path: '/account',
        component: () => import('../views/default/Account.vue'),
        meta: {
            layout: 'full',
            showPageTitle: false,
            showLeftSidebar: false,
        },
    },

    // {
    //     path: '/add-product',
    //     name: 'AddProduct',
    //     component: () => import('../components/AddProduct.vue')  // Buat nanti
    // },
    // {
    //     path: '/generate',
    //     name: 'Generate',
    //     component: () => import('../components/Generate.vue')  // Buat nanti
    // },
    // {
    //     path: '/manage',
    //     name: 'Manage',
    //     component: () => import('../components/Manage.vue')  // Buat nanti
    // },
    // {
    //     path: '/account',
    //     name: 'Account',
    //     component: () => import('../components/Account.vue')  // Buat nanti
    // }
]

const router = createRouter({
    history: createWebHistory(),
    routes
});

// Role access mapping
const accessMap = {
  '/': ['super_admin', 'admin', 'operator'],
  '/add-product': ['super_admin', 'admin'],
  '/manage': ['super_admin', 'admin'],
  '/test-result': ['super_admin', 'admin', 'operator'],
  '/testing': ['super_admin', 'admin', 'operator'],
  '/testing-table': ['super_admin', 'admin', 'operator'],
  '/testing-detail': ['super_admin', 'admin'],
  '/generate': ['super_admin', 'admin'],
  '/manage-users': ['super_admin'],
  '/account': ['super_admin', 'admin', 'operator']
};

router.beforeEach((to, from, next) => {
  const userStr = localStorage.getItem('user')
  const user = userStr ? JSON.parse(userStr) : null
  
  if (!user) {
    next()
    return
  }
  
  const allowedRoles = accessMap[to.path]
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    next('/') // redirect ke dashboard jika tidak punya akses
  } else {
    next()
  }
})


export default router