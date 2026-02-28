<template>
    <div id="app">
        <template v-if="!authStore.loading">
            <Directory v-if="$route.name !== 'Home' && $route.name !== 'Auth' && $route.name !== 'NotAuthorized'" />
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
        background-color: #2a2a2a !important;
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