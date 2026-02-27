<template>
    <div class="not-auth">
        <h1>Access Denied</h1>
        <p>You don't have permission to view this page.</p>
        <router-link to="/" class="home-btn">Back to Home</router-link>
    </div>
</template>

<script>
export default { name: 'NotAuthorized' }
</script>

<style scoped>
    .not-auth {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        gap: 16px;
        text-align: center;
    }

    h1 {
        color: #e41e3f;
        font-size: 48px;
    }

    p {
        color: #aaa;
        font-size: 18px;
    }

    .home-btn {
        background: #e41e3f;
        color: white;
        padding: 12px 30px;
        text-decoration: none;
        border: 2px solid #000;
        font-weight: 700;
    }
</style>