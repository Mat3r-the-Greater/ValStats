import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import AddNewMatch from '../pages/AddNewMatch.vue'
import SeasonView from '../pages/SeasonView.vue'
import Opponents from '../pages/Opponents.vue'
import Auth from '../pages/Auth.vue'
import Admin from '../pages/Admin.vue'
import NotAuthorized from '../pages/NotAuthorized.vue'
import { useAuthStore } from '../stores/authStore'

const routes = [
    {
        path: '/auth',
        name: 'Auth',
        component: Auth,
        meta: { guestOnly: true }  // logged-in users shouldn't see this
    },
    {
        path: '/',
        name: 'Home',
        component: Home,
        meta: { requiresAuth: true }
    },
    {
        path: '/add-match',
        name: 'AddNewMatch',
        component: AddNewMatch,
        meta: { requiresAuth: true, requiredRoles: ['admin', 'coach', 'captain'] }
    },
    {
        path: '/season-view',
        name: 'SeasonView',
        component: SeasonView,
        meta: { requiresAuth: true }  // all roles can view
    },
    {
        path: '/opponents',
        name: 'Opponents',
        component: Opponents,
        meta: { requiresAuth: true }  // all roles can view
    },
    {
        path: '/admin',
        name: 'Admin',
        component: Admin,
        meta: { requiresAuth: true, requiredRoles: ['admin'] }
    },
    {
        path: '/not-authorized',
        name: 'NotAuthorized',
        component: NotAuthorized,
    },
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

router.beforeEach(async (to) => {
    const authStore = useAuthStore()

    // Redirect logged-in users away from the auth page
    if (to.meta.guestOnly && authStore.isLoggedIn) {
        return { name: 'Home' }
    }

    // Redirect unauthenticated users to sign-in
    if (to.meta.requiresAuth && !authStore.isLoggedIn) {
        return { name: 'Auth' }
    }

    // Check if the user is banned
    if (authStore.isLoggedIn && authStore.isBanned) {
        await authStore.signOut()
        return { name: 'Auth' }
    }

    // Check role-based access
    if (to.meta.requiredRoles && authStore.isLoggedIn) {
        if (!to.meta.requiredRoles.includes(authStore.role)) {
            return { name: 'NotAuthorized' }
        }
    }
})

export default router