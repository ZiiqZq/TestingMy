import { createRouter, createWebHistory } from 'vue-router'

// Lazy load components untuk performance
const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: () => import('../components/Dashboard.vue'),
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
        path: '/about',
        name: 'About',
        component: () => import('../components/About.vue'),
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
            default: () => import('../components/View.vue'),
            LeftSidebar: () => import('../components/LeftView.vue')
        },
        // {
        //     default: () => import('../components/View.vue'),
        //     LeftSidebar: () => import('../components/LeftView.vue')
        // },
        meta: {
            layout: 'grid',
            showLeftSidebar: true,
            pageTitle: 'View',
            showNavbar: true,
            navTitle: 'View Testing Data'
        }
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