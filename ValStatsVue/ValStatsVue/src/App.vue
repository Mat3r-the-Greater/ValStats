<template>
    <div id="app">
        <template v-if="!authStore.loading">
            <Directory v-if="$route.name !== 'Home' && $route.name !== 'Auth' && $route.name !== 'NotAuthorized' && $route.name !== 'ResetPassword'" />
            <router-view />
        </template>
        <div v-else class="loading-screen">
            <p>Loading...</p>
        </div>
    </div>
</template>

<script>
    import Directory from './components/Directory.vue'
    import { useAuthStore } from './stores/authStore'

    export default {
        name: 'App',
        components: { Directory },
        setup() {
            const authStore = useAuthStore()
            return { authStore }
        }
    }
</script>

<style>
    body {
        margin: 0;
        padding: 0;
        
        background-color: #0B223E !important;
        background-image: linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,1.2)),url('/KU-Esports-Banner.png');
        background-size: contain;
        background-repeat: no-repeat;
        background-position-y: bottom;
    }

    #app {
        font-family: 'Montserrat', sans-serif;
        color: white;
        min-height: 100vh;
    }

    .loading-screen {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        color: #888;
        font-size: 18px;
    }

    button {
        border-radius: 8px !important;
    }
</style>