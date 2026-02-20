<template>
    <div id="app">
        <Directory v-if="$route.name !== 'Home'" />
        <router-view />
    </div>
</template>

<script>
    import Directory from './components/Directory.vue'

    export default {
        name: 'App',
        components: {
            Directory
        }
    }
</script>

<style>
    body {
        margin: 0;
        padding: 0;
        background-color: #2a2a2a;
    }

    #app {
        font-family: 'Montserrat', sans-serif;
        color: white;
        min-height: 100vh;
    }
</style>