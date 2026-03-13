<template>
    <div class="auth-page">
        <div class="auth-card">
            <h1 class="title">Kettering Val Tracker</h1>

            <div class="tab-switcher">
                <button :class="['tab-btn', { active: mode === 'signin' }]" @click="mode = 'signin'">Sign In</button>
                <button :class="['tab-btn', { active: mode === 'signup' }]" @click="mode = 'signup'">Sign Up</button>
            </div>

            <form @submit.prevent="handleSubmit" class="auth-form">
                <div class="form-group">
                    <label>Email</label>
                    <input type="email"
                           v-model="email"
                           placeholder="yourname@kettering.edu"
                           required />
                </div>
                <div class="form-group">
                    <label>Password</label>
                    <input type="password"
                           v-model="password"
                           placeholder="Password"
                           required
                           minlength="6" />
                </div>

                <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
                <p v-if="successMsg" class="success-msg">{{ successMsg }}</p>

                <button type="submit" class="submit-btn" :disabled="loading">
                    {{ loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Sign Up' }}
                </button>
            </form>

            <!-- Forgot password link -->
            <p v-if="mode === 'signin'" class="forgot-link" @click="showForgotPassword = !showForgotPassword">
                Forgot your password?
            </p>

            <!-- Forgot password form -->
            <div v-if="showForgotPassword" class="forgot-form">
                <div class="form-group">
                    <label>Enter your email to receive a reset link</label>
                    <input type="email" v-model="forgotEmail" placeholder="yourname@kettering.edu" />
                </div>
                <p v-if="forgotMsg" :class="forgotError ? 'error-msg' : 'success-msg'">{{ forgotMsg }}</p>
                <button class="submit-btn" @click="sendResetEmail" :disabled="forgotLoading">
                    {{ forgotLoading ? 'Sending...' : 'Send Reset Link' }}
                </button>
            </div>

            <p class="domain-note">Sign-up is restricted to @kettering.edu addresses.<br>Contact an admin if you need access.</p>
        </div>
    </div>
</template>

<script>
import { supabase } from '../supabase'
import { useAuthStore } from '../stores/authStore'

export default {
    name: 'Auth',
    data() {
        return {
            mode: 'signin',
            email: '',
            password: '',
            errorMsg: '',
            successMsg: '',
            loading: false,
            showForgotPassword: false,
            forgotEmail: '',
            forgotMsg: '',
            forgotError: false,
            forgotLoading: false,
        }
    },
    methods: {
        async handleSubmit() {
            this.errorMsg = ''
            this.successMsg = ''
            this.loading = true

            if (this.mode === 'signup') {
                if (!this.email.endsWith('@kettering.edu')) {
                    this.errorMsg = 'Sign-up is restricted to @kettering.edu email addresses.'
                    this.loading = false
                    return
                }

                const { error } = await supabase.auth.signUp({
                    email: this.email,
                    password: this.password,
                })

                if (error) {
                    this.errorMsg = error.message
                } else {
                    this.successMsg = 'Account created! Check your email to confirm, then sign in.'
                    this.mode = 'signin'
                }
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email: this.email,
                    password: this.password,
                })

                if (error) {
                    this.errorMsg = error.message
                } else {
                    const authStore = useAuthStore()
                    // Check if user is banned after sign-in
                    if (authStore.isBanned) {
                        await authStore.signOut()
                        this.errorMsg = 'Your account has been suspended. Contact an admin.'
                    } else {
                        this.$router.push('/')
                    }
                }
            }

            this.loading = false
        },
        async sendResetEmail() {
            this.forgotMsg = ''
            this.forgotLoading = true
            const { error } = await supabase.auth.resetPasswordForEmail(this.forgotEmail, {
                redirectTo: `${window.location.origin}/reset-password`,
            })
            if (error) {
                this.forgotMsg = error.message
                this.forgotError = true
            } else {
                this.forgotMsg = 'Reset link sent! Check your email.'
                this.forgotError = false
                this.forgotEmail = ''
            }
            this.forgotLoading = false
        },
    }
}
</script>

<style scoped>
    .auth-page {
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

    .auth-card {
        background-color: #0B223F;
        border: 2px solid #000;
        padding: 40px;
        width: 100%;
        max-width: 420px;
    }

    .title {
        text-align: center;
        font-size: 28px;
        font-weight: 800;
        font-family: 'Bebas Neue', sans-serif;
        color: #F7BD12;
        margin-bottom: 30px;
        text-transform: uppercase;
    }

    .tab-switcher {
        display: flex;
        margin-bottom: 24px;
        border: 2px solid #000;
    }

    .tab-btn {
        flex: 1;
        padding: 10px;
        background: #2a2a2a;
        color: white;
        border: none;
        cursor: pointer;
        font-size: 15px;
        font-family: 'Montserrat', sans-serif;
        transition: background 0.2s;
    }

        .tab-btn.active {
            background: #F7BD12;
            font-weight: 700;
            color: #081A31;
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
                border-color: #F7BD12;
            }

    .submit-btn {
        padding: 12px;
        background: #F7BD12;
        color: white;
        border: 2px solid #000;
        font-size: 16px;
        font-weight: 700;
        font-family: 'Montserrat', sans-serif;
        cursor: pointer;
        transition: background 0.2s;
        margin-top: 8px;
        color: #081A31;
    }

        .submit-btn:hover:not(:disabled) {
            background: #887023;
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

    .domain-note {
        text-align: center;
        color: #666;
        font-size: 13px;
        margin-top: 20px;
        line-height: 1.5;
    }

    .forgot-link {
        text-align: center;
        color: #888;
        font-size: 12px;
        cursor: pointer;
        margin-top: 4px;
        text-decoration: underline;
    }

        .forgot-link:hover {
            color: #ccc;
        }

    .forgot-form {
        display: flex;
        flex-direction: column;
        gap: 12px;
        margin-top: 8px;
        padding-top: 16px;
        border-top: 1px solid #333;
    }
</style>