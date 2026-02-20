<template>
    <div>
        <nav class="homePage">
            <h1 class="title">Kettering Val Tracker</h1>
            <nav class="nav-container">
                <div class="nav-content">
                    <div class="nav-center">
                        <div><router-link to="/add-match" class="nav-button">Add New Match</router-link></div>
                        <div><router-link to="/season-view" class="nav-button">Season View</router-link></div>
                        <div><router-link to="/opponents" class="nav-button">Opponents</router-link></div>
                    </div>
                </div>
            </nav>
        </nav>
    </div>
</template>

<script>
    export default {
        name: 'Navigation'
    }
</script>

<style scoped>
    .homePage{
        display:flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
    }

    .title {
        text-align: center;
        margin: 20px 0;
        font-size: 75px;
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        color: #e41e3f;
        text-transform: uppercase;
        padding-right: 100px;
    }

    .nav-container {
        border-bottom: 2px solid #000;
        border-top: 2px solid #000;
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
        background-color: #e41e3f;
        color: white;
        padding: 12px 30px;
        text-decoration: none;
        font-size: 25px;
        border: 2px solid #000;
        display: inline-block;
        transition: background-color 0.3s;
        text-align: center;
        min-width: 200px
    }

        .nav-button:hover {
            background-color: #c41830;
        }
</style>