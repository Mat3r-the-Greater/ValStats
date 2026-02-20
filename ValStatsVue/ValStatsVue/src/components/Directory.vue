<template>
    <div>
        <h1 class="title">Kettering Val Tracker</h1>
        <nav class="nav-container">
            <div class="nav-content">
                <div class="nav-left">
                    <router-link to="/" class="nav-button">Home</router-link>
                </div>

                <div class="nav-center">
                    <router-link to="/add-match" class="nav-button">Add New Match</router-link>
                    <router-link to="/season-view" class="nav-button">Season View</router-link>
                    <router-link to="/opponents" class="nav-button">Opponents</router-link>
                </div>
            </div>
        </nav>
    </div>
</template>

<script>
    export default {
        name: 'Navigation'
    }
</script>

<style scoped>
    .title {
        text-align: center;
        margin: 20px 0;
        font-size: 50px;
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        color: #e41e3f;
    }

    .nav-container {
        background-color: #2a2a2a;
        border-bottom: 2px solid #000;
        border-top: 2px solid #000;
        padding: 20px;
    }

    .nav-content {
        display: flex;
        align-items: center;
        max-width: 1200px;
        margin: 0 auto;
        position: relative;
    }

    .nav-left {
        margin-right: auto;
    }

    .nav-center {
        display: flex;
        gap: 20px;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }

    .nav-button {
        background-color: #e41e3f;
        color: white;
        padding: 12px 30px;
        text-decoration: none;
        font-size: 18px;
        border: 2px solid #000;
        display: inline-block;
        transition: background-color 0.3s;
    }

        .nav-button:hover {
            background-color: #c41830;
        }
</style>