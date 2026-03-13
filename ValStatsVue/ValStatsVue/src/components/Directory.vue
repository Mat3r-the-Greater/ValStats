<template>
    <div class="header-wrapper">
        <h1 class="title">Kettering Val Tracker</h1>
        <nav class="nav-container">
            <div class="nav-content">
                <div class="nav-left">
                    <router-link to="/" class="nav-button">
                        <i class="bi bi-house-fill"></i> Home
                    </router-link>
                </div>
                <div class="nav-center">
                    <router-link v-if="authStore.isCaptain" to="/add-match" class="nav-button"><i class="bi bi-plus-circle-fill"></i> Add New Match</router-link>
                    <router-link to="/season-view" class="nav-button"><i class="bi bi-trophy-fill"></i> Season View</router-link>
                    <router-link to="/opponents" class="nav-button"><i class="bi bi-shield-fill"></i> Opponents</router-link>
                    <router-link to="/player-view" class="nav-button"><i class="bi bi-person-fill"></i> Player View</router-link>
                    <router-link v-if="authStore.isAdmin" to="/admin" class="nav-button admin-btn"><i class="bi bi-gear-fill"></i> Admin Panel</router-link>
                    <router-link v-if="authStore.isOnlyCoach" to="/admin" class="nav-button admin-btn"> <i class="bi bi-clipboard-fill"></i> Coach Panel</router-link>
                </div>
                <div class="nav-right">
                    <span class="role-badge">{{ authStore.role }}</span>
                    <button class="nav-button signout-btn" @click="signOut">Sign Out</button>
                </div>
            </div>
        </nav>
    </div>
</template>

<script>
    import { useAuthStore } from '../stores/authStore'

    export default {
        name: 'Navigation',
        setup() {
            const authStore = useAuthStore()
            return { authStore }
        },
        methods: {
            async signOut() {
                await this.authStore.signOut()
                this.$router.push('/auth')
            }
        }
    }
</script>

<style scoped>
    .header-wrapper {
        background-color: #0B223F;
        background-image: radial-gradient(rgba(0,0,0,0.05), rgba(0,0,0,0.4)),url('/KU-Esports.png');
        background-size: contain;
        background-repeat: no-repeat;
    }

    .title {
        padding-top: 25px;
        padding-bottom: 15px;
        text-align: center;
        margin: 0;
        font-size: 50px;
        font-family: 'Bebas Neue', sans-serif;
        font-weight: 700;
        color: #F7BD12;
    }

    .nav-container {
        border-bottom: 1px ridge rgba(11, 34, 62, 0.05);
        padding-top: 18px;
        padding-bottom: 30px;
    }

    .nav-content {
        display: flex;
        align-items: center;
        max-width: 1750px;
        margin: 0 auto;
        position: relative;
    }

    .nav-left {
        margin-right: auto;
    }

    .nav-right {
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 12px;
    }

    .nav-center {
        display: flex;
        gap: 20px;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        text-align:center;
    }

    .nav-button {
        background-color: #5D6979;
        color: #FBFBF8;
        padding: 12px 30px;
        text-decoration: none;
        font-size: unset;
        border-radius: 8px;
        display: inline-block;
        transition: background-color 0.3s;
        cursor: pointer;
        font-family: 'Montserrat', sans-serif;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 10px;
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

    .nav-button.router-link-exact-active {
        background-color: #474F5C;
    }

    .admin-btn.router-link-exact-active {
        background-color: #887023;
    }

    .signout-btn {
        background-color: #444;
        font-size: 14px;
        padding: 8px 18px;
    }

        .signout-btn:hover {
            background-color: #333;
        }

    .role-badge {
        background-color: #333;
        border: 1px solid #555;
        color: #ccc;
        padding: 4px 10px;
        font-size: 12px;
        font-weight: 600;
        text-transform: uppercase;
        letter-spacing: 1px;
    }
</style>