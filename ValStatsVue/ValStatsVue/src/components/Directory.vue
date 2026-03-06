<template>
    <div class="header-wrapper">
        <h1 class="title">Kettering Val Tracker</h1>
        <nav class="nav-container">
            <div class="nav-content">
                <div class="nav-left">
                    <router-link to="/" class="nav-button">Home</router-link>
                </div>

                <div class="nav-center">
                    <!-- Captains, Coaches, and Admins only -->
                    <router-link v-if="authStore.isCaptain" to="/add-match" class="nav-button">Add New Match</router-link>
                    <router-link to="/season-view" class="nav-button">Season View</router-link>
                    <router-link to="/opponents" class="nav-button">Opponents</router-link>
                    <!-- Admin only -->
                    <router-link v-if="authStore.isAdmin" to="/admin" class="nav-button admin-btn">Admin Panel</router-link>
                    <router-link v-if="authStore.isOnlyCoach" to="/admin" class="nav-button admin-btn">Coach Panel</router-link>
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
        background-color: #1f1f1f;
    }

    .title {
        padding-top: 25px;
        padding-bottom: 0;
        text-align: center;
        margin: 0; 
        font-size: 50px;
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        color: #e41e3f;
    }

    .nav-container {
        background-color: #1f1f1f;
        border-bottom: 3px solid #242424;
        padding-top: 18px;
        padding-bottom: 18px;
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
        background-color: #e41e3f;
        color: white;
        padding: 12px 30px;
        text-decoration: none;
        font-size: 18px;
        border-radius: 8px;
        display: inline-block;
        transition: background-color 0.3s;
        cursor: pointer;
        font-family: 'Montserrat', sans-serif;
        font-weight: 600;
    }

        .nav-button:hover {
            background-color: #c41830;
        }

    .admin-btn {
        background-color: #cebe0f;
    }

        .admin-btn:hover {
            background-color: #b5a70d;
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