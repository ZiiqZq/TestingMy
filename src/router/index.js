import { createRouter, createWebHistory } from 'vue-router'

// Lazy load components
const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: () => import('../views/default/Dashboard.vue'),
        meta: {
            layout: 'full',
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
        component: () => import('../components/AppLoading.vue')
    },
    {
        path: '/about',
        name: 'About',
        component: () => import('../views/default/About.vue'),
        meta: {
            layout: 'grid',
            showLeftSidebar: true,
            pageTitle: 'About',
            showNavbar: false,
        },
    },
    {
        path: '/view',
        name: 'View',
        components: {
            default: () => import('../views/default/View.vue'),
            LeftSidebar: () => import('../views/left/LeftView.vue')
        },
        meta: {
            layout: 'grid',
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
            showLeftSidebar: true,
            pageTitle: 'Setup',
            showNavbar: true,
            navTitle: 'Informasi Test'
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
            showLeftSidebar: true,
            pageTitle: 'Product',
            showNavbar: true,
            navTitle: 'Product Parameters'
        }
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
            showLeftSidebar: false,
            pageTitle: 'Generate'
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
})

export default router