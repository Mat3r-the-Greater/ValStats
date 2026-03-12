<template>
    <div class="auth-page">
        <div class="auth-card">
            <h1 class="title">Kettering Val Tracker</h1>
            <h2 class="subtitle">Set New Password</h2>

            <div class="auth-form">
                <div class="form-group">
                    <label>New Password</label>
                    <input type="password" v-model="newPassword" placeholder="New password" minlength="6" />
                </div>
                <div class="form-group">
                    <label>Confirm Password</label>
                    <input type="password" v-model="confirmPassword" placeholder="Confirm new password" minlength="6" />
                </div>

                <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
                <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>

                <button class="submit-btn" @click="handleReset" :disabled="loading || !!successMsg">
                    {{ loading ? 'Updating...' : 'Update Password' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script>
import { supabase } from '../supabase'

export default {
    name: 'ResetPassword',
    data() {
        return {
            newPassword: '',
            confirmPassword: '',
            errorMsg: '',
            successMsg: '',
            loading: false,
        }
    },
    methods: {
        async handleReset() {
            this.errorMsg = ''
            this.successMsg = ''

            if (this.newPassword.length < 6) {
                this.errorMsg = 'Password must be at least 6 characters.'
                return
            }
            if (this.newPassword !== this.confirmPassword) {
                this.errorMsg = 'Passwords do not match.'
                return
            }

            this.loading = true
            const { error } = await supabase.auth.updateUser({ password: this.newPassword })

            if (error) {
                this.errorMsg = error.message
            } else {
                this.successMsg = 'Password updated! Redirecting to sign in...\nIf not redirected to login, please refresh :)'
                setTimeout(() => this.$router.push('/auth'), 2500)
            }
            this.loading = false
        }
    }
}
</script>

<style scoped>
    .auth-page {
        display: flex;
        justify-content: center;
        align-items: center;
        min-height: 100vh;
        background-color: #2a2a2a;
    }

    .auth-card {
        background-color: #1e1e1e;
        border: 2px solid #000;
        padding: 40px;
        width: 100%;
        max-width: 420px;
    }

    .title {
        text-align: center;
        font-size: 28px;
        font-weight: 800;
        color: #e41e3f;
        margin-bottom: 8px;
        text-transform: uppercase;
    }

    .subtitle {
        text-align: center;
        font-size: 16px;
        color: #aaa;
        margin-bottom: 28px;
        font-weight: 600;
    }

    .auth-form {
        display: flex;
        flex-direction: column;
        gap: 16px;
    }

    .form-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

        .form-group label {
            font-size: 13px;
            font-weight: 600;
            color: #ccc;
        }

        .form-group input {
            padding: 10px 12px;
            background: #2a2a2a;
            border: 2px solid #444;
            color: white;
            font-size: 15px;
            font-family: 'Montserrat', sans-serif;
            outline: none;
            transition: border-color 0.2s;
        }

            .form-group input:focus {
                border-color: #e41e3f;
            }

    .submit-btn {
        padding: 12px;
        background: #e41e3f;
        color: white;
        border: 2px solid #000;
        font-size: 16px;
        font-weight: 700;
        font-family: 'Montserrat', sans-serif;
        cursor: pointer;
        transition: background 0.2s;
        margin-top: 8px;
    }

        .submit-btn:hover:not(:disabled) {
            background: #c41830;
        }

        .submit-btn:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }

    .error-msg {
        color: #ff4d4d;
        font-size: 13px;
        margin: 0;
    }

    .success-msg {
        color: #4dff88;
        font-size: 13px;
        margin: 0;
    }
</style>