import { defineStore } from 'pinia'
import { supabase } from '../supabase'

export const useAuthStore = defineStore('auth', {
    state: () => ({
        user: null,
        profile: null,
        loading: true,
    }),

    getters: {
        role: (state) => state.profile?.role ?? null,
        isBanned: (state) => state.profile?.is_banned ?? false,
        isAdmin: (state) => state.profile?.role === 'admin',
        isCoach: (state) => ['admin', 'coach'].includes(state.profile?.role),
        isCaptain: (state) => ['admin', 'coach', 'captain'].includes(state.profile?.role),
        isPlayer: (state) => state.profile !== null,
        isLoggedIn: (state) => state.user !== null,
    },

    actions: {
        async fetchProfile() {
            if (!this.user) return
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', this.user.id)
                .single()
            this.profile = data
        },

        async init() {
            this.loading = true

            const { data: { session } } = await supabase.auth.getSession()
            this.user = session?.user ?? null
            if (this.user) await this.fetchProfile()

            supabase.auth.onAuthStateChange(async (_event, session) => {
                this.user = session?.user ?? null
                if (this.user) {
                    await this.fetchProfile()
                } else {
                    this.profile = null
                }
            })

            this.loading = false
        },

        async signOut() {
            await supabase.auth.signOut()
            this.user = null
            this.profile = null
        },
    },
})