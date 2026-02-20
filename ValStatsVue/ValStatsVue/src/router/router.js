import { createRouter, createWebHistory } from 'vue-router'
import Home from '../pages/Home.vue'
import AddNewMatch from '../pages/AddNewMatch.vue'
import SeasonView from '../pages/SeasonView.vue'
import Opponents from '../pages/Opponents.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/add-match',
        name: 'AddNewMatch',
        component: AddNewMatch
    },
    {
        path: '/season-view',
        name: 'SeasonView',
        component: SeasonView
    },
    {
        path: '/opponents',
        name: 'Opponents',
        component: Opponents
    }
]

const router = createRouter({
    history: createWebHistory(), 
    routes
})

export default router