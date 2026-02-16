<template>
    <div id="app">
        <Directory />
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
    }

    #app {
        font-family: Avenir, Helvetica, Arial, sans-serif;
    }
</style>