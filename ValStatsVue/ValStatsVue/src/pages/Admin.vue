<template>
    <div class="admin-page">
        <h1>Admin Panel</h1>

        <!-- Add External User -->
        <div class="card">
            <h2>Add External User</h2>
            <p class="hint">Use this to add users without a @kettering.edu email address.</p>
            <div class="form-row">
                <input v-model="newEmail" type="email" placeholder="user@example.com" />
                <input v-model="newPassword" type="password" placeholder="Temporary password" minlength="6" />
                <select v-model="newRole">
                    <option value="player">Player</option>
                    <option value="captain">Captain</option>
                    <option value="coach">Coach</option>
                    <option value="admin">Admin</option>
                </select>
                <button @click="addExternalUser" :disabled="addingUser" class="action-btn">
                    {{ addingUser ? 'Adding...' : 'Add User' }}
                </button>
            </div>
            <p v-if="addUserMsg" :class="addUserError ? 'error-msg' : 'success-msg'">{{ addUserMsg }}</p>
        </div>

        <!-- User List -->
        <div class="card">
            <h2>All Users</h2>
            <div v-if="loadingUsers" class="loading">Loading users...</div>
            <table v-else class="user-table">
                <thead>
                    <tr>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Banned</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="profile in profiles" :key="profile.id">
                        <td>{{ profile.email }}</td>
                        <td>
                            <select v-model="profile.role"
                                    @change="updateRole(profile)"
                                    :disabled="profile.id === currentUserId">
                                <option value="player">Player</option>
                                <option value="captain">Captain</option>
                                <option value="coach">Coach</option>
                                <option value="admin">Admin</option>
                            </select>
                        </td>
                        <td>
                            <span :class="profile.is_banned ? 'badge-banned' : 'badge-active'">
                                {{ profile.is_banned ? 'Banned' : 'Active' }}
                            </span>
                        </td>
                        <td>
                            <button v-if="profile.id !== currentUserId"
                                    @click="toggleBan(profile)"
                                    :class="profile.is_banned ? 'unban-btn' : 'ban-btn'">
                                {{ profile.is_banned ? 'Unban' : 'Ban' }}
                            </button>
                            <span v-else class="you-label">You</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script>
    import { supabase } from '../supabase'
    import { useAuthStore } from '../stores/authStore'

    export default {
        name: 'Admin',
        data() {
            return {
                profiles: [],
                loadingUsers: true,
                newEmail: '',
                newPassword: '',
                newRole: 'player',
                addingUser: false,
                addUserMsg: '',
                addUserError: false,
            }
        },
        computed: {
            currentUserId() {
                return useAuthStore().user?.id
            }
        },
        async created() {
            await this.loadUsers()
        },
        methods: {
            async loadUsers() {
                this.loadingUsers = true
                const { data } = await supabase.from('profiles').select('*').order('email')
                this.profiles = data ?? []
                this.loadingUsers = false
            },

            async updateRole(profile) {
                await supabase
                    .from('profiles')
                    .update({ role: profile.role })
                    .eq('id', profile.id)
            },

            async toggleBan(profile) {
                const newBanned = !profile.is_banned
                const { error } = await supabase
                    .from('profiles')
                    .update({ is_banned: newBanned })
                    .eq('id', profile.id)
                if (!error) profile.is_banned = newBanned
            },

            async addExternalUser() {
                this.addUserMsg = ''
                this.addingUser = true

                // This calls a Supabase Edge Function you'll set up to
                // create the user with the service role key server-side.
                // See the note below about setting that up.
                const { data, error } = await supabase.functions.invoke('create-user', {
                    body: {
                        email: this.newEmail,
                        password: this.newPassword,
                        role: this.newRole,
                    }
                })

                if (error) {
                    this.addUserMsg = 'Failed to create user: ' + error.message
                    this.addUserError = true
                } else {
                    this.addUserMsg = `User ${this.newEmail} created successfully.`
                    this.addUserError = false
                    this.newEmail = ''
                    this.newPassword = ''
                    await this.loadUsers()
                }

                this.addingUser = false
            }
        }
    }
</script>

<style scoped>
    .admin-page {
        padding: 30px;
        max-width: 1000px;
        margin: 0 auto;
    }

    h1 {
        color: #e41e3f;
        font-size: 36px;
        margin-bottom: 30px;
    }

    .card {
        background: #1e1e1e;
        border: 2px solid #333;
        padding: 24px;
        margin-bottom: 30px;
    }

        .card h2 {
            color: #e41e3f;
            margin-top: 0;
            margin-bottom: 12px;
        }

    .hint {
        color: #888;
        font-size: 13px;
        margin-bottom: 16px;
    }

    .form-row {
        display: flex;
        gap: 10px;
        flex-wrap: wrap;
        align-items: center;
    }

        .form-row input,
        .form-row select {
            padding: 9px 12px;
            background: #2a2a2a;
            border: 2px solid #444;
            color: white;
            font-family: 'Montserrat', sans-serif;
            font-size: 14px;
            outline: none;
        }

    .action-btn {
        padding: 9px 20px;
        background: #e41e3f;
        color: white;
        border: 2px solid #000;
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        cursor: pointer;
    }

        .action-btn:hover:not(:disabled) {
            background: #c41830;
        }

    .user-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 14px;
    }

        .user-table th {
            background: #2a2a2a;
            padding: 10px 14px;
            text-align: left;
            color: #aaa;
            font-weight: 600;
            border-bottom: 2px solid #444;
        }

        .user-table td {
            padding: 10px 14px;
            border-bottom: 1px solid #333;
            color:white;
        }

        .user-table select {
            background: #2a2a2a;
            border: 1px solid #555;
            color: white;
            padding: 4px 8px;
            font-family: 'Montserrat', sans-serif;
        }

    .badge-banned {
        background: #7a1010;
        color: #ff6b6b;
        padding: 2px 10px;
        font-size: 12px;
        font-weight: 700;
    }

    .badge-active {
        background: #0d4a1f;
        color: #4dff88;
        padding: 2px 10px;
        font-size: 12px;
        font-weight: 700;
    }

    .ban-btn {
        background: #7a1010;
        color: white;
        border: 1px solid #aa2020;
        padding: 4px 12px;
        cursor: pointer;
        font-family: 'Montserrat', sans-serif;
    }

    .unban-btn {
        background: #1a4a1a;
        color: white;
        border: 1px solid #2a7a2a;
        padding: 4px 12px;
        cursor: pointer;
        font-family: 'Montserrat', sans-serif;
    }

    .you-label {
        color: #666;
        font-style: italic;
        font-size: 13px;
    }

    .error-msg {
        color: #ff4d4d;
        margin-top: 10px;
    }

    .success-msg {
        color: #4dff88;
        margin-top: 10px;
    }

    .loading {
        color: #888;
    }
</style>