<template>
    <div>
        <nav class="homePage">
            <h1 class="title">Kettering Val Tracker</h1>
            <nav class="nav-container">
                <div class="nav-content">
                    <div class="nav-center">
                        <router-link v-if="authStore.isCaptain" to="/add-match" class="nav-button"><i class="bi bi-plus-circle-fill"></i> Add New Match</router-link>
                        <router-link to="/season-view" class="nav-button"><i class="bi bi-trophy-fill"></i> Season View</router-link>
                        <router-link to="/opponents" class="nav-button"><i class="bi bi-shield-fill"></i> Opponents</router-link>
                        <router-link to="/player-view" class="nav-button"><i class="bi bi-person-fill"></i> Player View</router-link>
                        <router-link v-if="authStore.isAdmin" to="/admin" class="nav-button admin-btn"><i class="bi bi-gear-fill"></i> Admin Panel</router-link>
                        <router-link v-if="authStore.isOnlyCoach" to="/admin" class="nav-button admin-btn"> <i class="bi bi-clipboard-fill"></i> Coach Panel</router-link>
                    </div>
                </div>
            </nav>
        </nav>
    </div>
</template>

<script>
    import { useAuthStore } from '../stores/authStore'

    export default {
        name: 'Home',
        setup() {
            const authStore = useAuthStore()
            return { authStore }
        }
    }
</script>

<style scoped>
    .homePage {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #0B223E;
        background-image: linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.9)),url('/KU-Esports-Banner.png');
        background-size: contain;
        background-repeat: no-repeat;
        background-position-y: bottom;
    }

    .title {
        text-align: center;
        margin: 20px 0;
        font-size: 100px;
        font-family: 'Bebas Neue', sans-serif;
        font-weight: 700;
        color: #F7BD12;
        text-transform: uppercase;
        padding-right: 100px;
    }

    .nav-container {
        border-bottom: 2px solid #081A31;
        border-top: 2px solid #081A31;
        padding: 50px;
        vertical-align: middle;
    }

    .nav-content {
        display: flex;
        justify-content: center;
        align-items: center;
        vertical-align: middle;
        max-width: 1200px;
        margin: 0 auto;
    }

    .nav-center {
        display: flex;
        flex-direction: column;
        gap: 20px;
        align-content:center;
    }

    .nav-button {
        background-color: #5D6979;
        color: #FBFBF8;
        padding: 12px 30px;
        text-decoration: none;
        font-size: 25px;
        border-radius: 8px;
        display: inline-block;
        transition: background-color 0.3s;
        cursor: pointer;
        font-family: 'Montserrat', sans-serif;
        font-weight: 600;
    }
        .nav-button i {
            transform: scale(1.7);
            flex-shrink: 0;
        }
        .nav-button:hover {
            background-color: #474F5C;
        }

    .admin-btn {
        background-color: #F7BD12;
        color: #0B223F;
    }

        .admin-btn:hover {
            background-color: #887023;
        }
</style>