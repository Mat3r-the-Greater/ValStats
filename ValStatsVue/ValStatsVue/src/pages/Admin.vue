<template>
    <div class="admin-page">
        <h1>{{ panelTitle }}</h1>

        <!-- Add External User (Admin only) -->
        <div class="card" v-if="authStore.isAdmin">
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
                            <select v-if="profile.role !== 'admin' && !(authStore.role === 'coach' && profile.role === 'coach')"
                                    v-model="profile.role"
                                    @change="updateRole(profile)"
                                    :disabled="profile.id === currentUserId">
                                <option value="player">Player</option>
                                <option value="captain">Captain</option>
                                <option value="coach">Coach</option>
                                <option value="admin">Admin</option>
                            </select>
                            <span v-else class="you-label">{{ profile.role.charAt(0).toUpperCase() + profile.role.slice(1) }}</span>
                        </td>
                        <td>
                            <span :class="profile.is_banned ? 'badge-banned' : 'badge-active'">
                                {{ profile.is_banned ? 'Banned' : 'Active' }}
                            </span>
                        </td>
                        <td>
                            <button v-if="profile.id !== currentUserId && !(authStore.role === 'coach' && ['coach', 'admin'].includes(profile.role))"
                                    @click="toggleBan(profile)"
                                    :class="profile.is_banned ? 'unban-btn' : 'ban-btn'">
                                {{ profile.is_banned ? 'Unban' : 'Ban' }}
                            </button>
                            <span v-else-if="profile.id === currentUserId" class="you-label">You</span>
                            <span v-else-if="profile.role === 'admin'" class="you-label">Admin</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Season Management -->
        <div class="card">
            <div class="section-header">
                <h2>Seasons</h2>
                <button class="add-btn" @click="showAddSeason = true" title="Add Season">+</button>
            </div>

            <div v-if="showAddSeason" class="form-row" style="margin-bottom: 16px;">
                <input v-model="newSeasonName" type="text" placeholder="Season name (e.g. Fall 2025)" @keyup.enter="addSeason" />
                <button class="action-btn" @click="addSeason" :disabled="addingSeason">
                    {{ addingSeason ? 'Adding...' : 'Add' }}
                </button>
                <button class="cancel-btn" @click="showAddSeason = false; newSeasonName = ''">Cancel</button>
            </div>

            <div v-if="loadingSeasons" class="loading">Loading seasons...</div>
            <div v-else-if="seasons.length === 0" class="hint">No seasons yet.</div>
            <ul v-else class="season-list">
                <li v-for="season in seasons" :key="season.id" class="season-row">
                    <span>{{ season.name }}</span>
                    <button class="delete-btn" @click="confirmDeleteSeason(season)" title="Delete Season">🗑</button>
                </li>
            </ul>
            <p v-if="seasonMsg" :class="seasonError ? 'error-msg' : 'success-msg'">{{ seasonMsg }}</p>
        </div>

        <!-- Our Teams Management -->
        <div class="card">
            <div class="section-header">
                <h2>Our Teams</h2>
                <button class="add-btn" @click="showAddOurTeam = true" title="Add Team">+</button>
            </div>

            <div v-if="showAddOurTeam" class="form-row" style="margin-bottom: 16px;">
                <input v-model="newOurTeamName" type="text" placeholder="Team name" @keyup.enter="addOurTeam" />
                <button class="action-btn" @click="addOurTeam" :disabled="addingOurTeam">
                    {{ addingOurTeam ? 'Adding...' : 'Add' }}
                </button>
                <button class="cancel-btn" @click="showAddOurTeam = false; newOurTeamName = ''">Cancel</button>
            </div>

            <div v-if="loadingOurTeams" class="loading">Loading teams...</div>
            <div v-else-if="ourTeams.length === 0" class="hint">No teams yet.</div>
            <table v-else class="user-table">
                <thead>
                    <tr>
                        <th>Team Name</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="team in ourTeams" :key="team.id">
                        <td>{{ team.name }}</td>
                        <td style="text-align: right;">
                            <button class="delete-btn" @click="confirmDeleteOurTeam(team)" title="Delete Team">🗑</button>
                        </td>
                    </tr>
                </tbody>
            </table>
            <p v-if="ourTeamMsg" :class="ourTeamError ? 'error-msg' : 'success-msg'">{{ ourTeamMsg }}</p>
        </div>

       

        <!-- Delete Season Modal -->
        <div v-if="seasonToDelete" class="modal-overlay" @click.self="seasonToDelete = null">
            <div class="confirm-modal">
                <h3>Delete Season</h3>
                <p>
                    Are you sure you want to delete <strong>{{ seasonToDelete.name }}</strong>?
                    This will permanently delete all matches and player stats associated with this season.
                </p>
                <div class="modal-actions">
                    <button class="cancel-btn" @click="seasonToDelete = null">Cancel</button>
                    <button class="delete-confirm-btn" @click="deleteSeason" :disabled="deletingSeason">
                        {{ deletingSeason ? 'Deleting...' : 'Delete' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Delete Our Team Modal -->
        <div v-if="ourTeamToDelete" class="modal-overlay" @click.self="ourTeamToDelete = null">
            <div class="confirm-modal">
                <h3>Delete Team</h3>
                <p>Are you sure you want to delete <strong>{{ ourTeamToDelete.name }}</strong>?</p>
                <div class="modal-actions">
                    <button class="cancel-btn" @click="ourTeamToDelete = null">Cancel</button>
                    <button class="delete-confirm-btn" @click="deleteOurTeam" :disabled="deletingOurTeam">
                        {{ deletingOurTeam ? 'Deleting...' : 'Delete' }}
                    </button>
                </div>
            </div>
        </div>

        <!-- Delete Opponent Modal -->
        <div v-if="opponentToDelete" class="modal-overlay" @click.self="opponentToDelete = null">
            <div class="confirm-modal">
                <h3>Delete Opponent</h3>
                <p>Are you sure you want to delete <strong>{{ opponentToDelete.name }}</strong>?</p>
                <div class="modal-actions">
                    <button class="cancel-btn" @click="opponentToDelete = null">Cancel</button>
                    <button class="delete-confirm-btn" @click="deleteOpponent" :disabled="deletingOpponent">
                        {{ deletingOpponent ? 'Deleting...' : 'Delete' }}
                    </button>
                </div>
            </div>
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
                // Users
                profiles: [],
                loadingUsers: true,
                newEmail: '',
                newPassword: '',
                newRole: 'player',
                addingUser: false,
                addUserMsg: '',
                addUserError: false,

                // Seasons
                seasons: [],
                loadingSeasons: true,
                showAddSeason: false,
                newSeasonName: '',
                addingSeason: false,
                seasonMsg: '',
                seasonError: false,
                seasonToDelete: null,
                deletingSeason: false,

                // Our Teams
                ourTeams: [],
                loadingOurTeams: true,
                showAddOurTeam: false,
                newOurTeamName: '',
                addingOurTeam: false,
                ourTeamMsg: '',
                ourTeamError: false,
                ourTeamToDelete: null,
                deletingOurTeam: false,
            }
        },
        computed: {
            currentUserId() {
                return useAuthStore().user?.id
            },
            authStore() {
                return useAuthStore()
            },
            panelTitle() {
                return useAuthStore().isAdmin ? 'Admin Panel' : 'Coach Panel'
            },
        },
        async created() {
            await this.loadUsers()
            await this.loadSeasons()
            await this.loadAllLeagues()
            await this.loadOurTeams()
            await this.loadAllOpponents()
        },
        methods: {
            // ── Users ────────────────────────────────────────────────────
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
            },

            // ── Seasons ──────────────────────────────────────────────────
            async loadSeasons() {
                this.loadingSeasons = true
                const { data } = await supabase.from('seasons').select('*').order('name')
                this.seasons = data ?? []
                this.loadingSeasons = false
            },

            async addSeason() {
                if (!this.newSeasonName.trim()) return
                this.addingSeason = true
                this.seasonMsg = ''
                const { error } = await supabase.from('seasons').insert({ name: this.newSeasonName.trim() })
                if (error) {
                    this.seasonMsg = 'Failed to add season: ' + error.message
                    this.seasonError = true
                } else {
                    this.seasonMsg = `Season "${this.newSeasonName.trim()}" added.`
                    this.seasonError = false
                    this.newSeasonName = ''
                    this.showAddSeason = false
                    await this.loadSeasons()
                }
                this.addingSeason = false
            },

            confirmDeleteSeason(season) {
                this.seasonToDelete = season
                this.seasonMsg = ''
            },

            async deleteSeason() {
                this.deletingSeason = true
                const { error } = await supabase.from('seasons').delete().eq('id', this.seasonToDelete.id)
                if (error) {
                    this.seasonMsg = 'Failed to delete season: ' + error.message
                    this.seasonError = true
                } else {
                    this.seasonMsg = `Season "${this.seasonToDelete.name}" deleted.`
                    this.seasonError = false
                    this.seasonToDelete = null
                    await this.loadSeasons()
                }
                this.deletingSeason = false
            },

            // ── Our Teams ────────────────────────────────────────────────
            async loadOurTeams() {
                this.loadingOurTeams = true
                const { data } = await supabase.from('our_teams').select('*').order('name')
                this.ourTeams = data ?? []
                this.loadingOurTeams = false
            },

            async addOurTeam() {
                if (!this.newOurTeamName.trim()) return
                this.addingOurTeam = true
                this.ourTeamMsg = ''
                const { error } = await supabase.from('our_teams').insert({
                    name: this.newOurTeamName.trim(),
                })
                if (error) {
                    this.ourTeamMsg = 'Failed to add team: ' + error.message
                    this.ourTeamError = true
                } else {
                    this.ourTeamMsg = `Team "${this.newOurTeamName.trim()}" added.`
                    this.ourTeamError = false
                    this.newOurTeamName = ''
                    this.showAddOurTeam = false
                    await this.loadOurTeams()
                }
                this.addingOurTeam = false
            },

            confirmDeleteOurTeam(team) {
                this.ourTeamToDelete = team
                this.ourTeamMsg = ''
            },

            async deleteOurTeam() {
                this.deletingOurTeam = true
                const { error } = await supabase.from('our_teams').delete().eq('id', this.ourTeamToDelete.id)
                if (error) {
                    this.ourTeamMsg = 'Failed to delete team: ' + error.message
                    this.ourTeamError = true
                } else {
                    this.ourTeamMsg = `Team "${this.ourTeamToDelete.name}" deleted.`
                    this.ourTeamError = false
                    this.ourTeamToDelete = null
                    await this.loadOurTeams()
                }
                this.deletingOurTeam = false
            },

            // ── Opponents ────────────────────────────────────────────────
            async loadAllLeagues() {
                const { data } = await supabase
                    .from('leagues')
                    .select('*, seasons(name)')
                    .order('name')
                this.allLeagues = data ?? []
            },

            async loadAllOpponents() {
                this.loadingAllOpponents = true
                const { data } = await supabase
                    .from('opponents')
                    .select('*, leagues(name)')
                    .order('name')
                this.allOpponents = data ?? []
                this.loadingAllOpponents = false
            },

            async addOpponent() {
                if (!this.newOpponentName.trim()) return
                this.addingOpponent = true
                this.opponentMsg = ''
                const { error } = await supabase.from('opponents').insert({
                    name: this.newOpponentName.trim(),
                    league_id: this.newOpponentLeagueId,
                })
                if (error) {
                    this.opponentMsg = 'Failed to add opponent: ' + error.message
                    this.opponentError = true
                } else {
                    this.opponentMsg = `Opponent "${this.newOpponentName.trim()}" added.`
                    this.opponentError = false
                    this.newOpponentName = ''
                    this.newOpponentLeagueId = null
                    this.showAddOpponent = false
                    await this.loadAllOpponents()
                }
                this.addingOpponent = false
            },

            confirmDeleteOpponent(opp) {
                this.opponentToDelete = opp
                this.opponentMsg = ''
            },

            async deleteOpponent() {
                this.deletingOpponent = true
                const { error } = await supabase.from('opponents').delete().eq('id', this.opponentToDelete.id)
                if (error) {
                    this.opponentMsg = 'Failed to delete opponent: ' + error.message
                    this.opponentError = true
                } else {
                    this.opponentMsg = `Opponent "${this.opponentToDelete.name}" deleted.`
                    this.opponentError = false
                    this.opponentToDelete = null
                    await this.loadAllOpponents()
                }
                this.deletingOpponent = false
            },
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
        color: rgba(247, 189, 18, 0.92);
        font-size: 45px;
        font-weight: 700;
        margin-bottom: 30px;
    }

    .card {
        background: #1e1e1e;
        border: 2px solid #333;
        padding: 24px;
        margin-bottom: 30px;
    }

        .card h2 {
            color: rgba(247, 189, 18, 0.92);
            margin-top: 0;
            margin-bottom: 12px;
        }

    .hint {
        color: #888;
        font-size: 13px;
        margin-bottom: 16px;
    }

    /* ── Form Row ───────────────────────────────────────────────── */
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
        background: rgba(247, 189, 18, 0.92);
        color: white;
        border: 2px solid #000;
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        cursor: pointer;
    }

        .action-btn:hover:not(:disabled) {
            background: rgba(247, 189, 18, 0.72);
        }

    .cancel-btn {
        padding: 9px 20px;
        background: #444;
        color: white;
        border: 2px solid #000;
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        cursor: pointer;
    }

        .cancel-btn:hover {
            background: #555;
        }

    /* ── User Table ─────────────────────────────────────────────── */
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
            color: white;
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

    /* ── Section Header (Seasons / Teams / Opponents) ───────────── */
    .section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16px;
    }

        .section-header h2 {
            margin: 0;
        }

    .add-btn {
        background: rgba(247, 189, 18, 0.92);
        color: white;
        border: 2px solid #000;
        width: 32px;
        height: 32px;
        font-size: 22px;
        line-height: 1;
        cursor: pointer;
        font-weight: 700;
        display: flex;
        align-items: center;
        justify-content: center;
    }

        .add-btn:hover {
            background: rgba(247, 189, 18, 0.72);
        }

    /* ── Season List ────────────────────────────────────────────── */
    .season-list {
        list-style: none;
        color: white;
        padding: 0;
        margin: 0;
    }

    .season-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 14px;
        border-bottom: 1px solid #333;
        font-size: 14px;
    }

        .season-row:last-child {
            border-bottom: none;
        }

    .delete-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 16px;
        padding: 4px 8px;
        color: #aaa;
        transition: color 0.2s;
    }

        .delete-btn:hover {
            color: #e41e3f;
        }

    /* ── Modal ──────────────────────────────────────────────────── */
    .modal-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.7);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1000;
    }

    .confirm-modal {
        background: #1e1e1e;
        border: 2px solid #444;
        padding: 32px;
        max-width: 420px;
        width: 90%;
    }

        .confirm-modal h3 {
            color: #e41e3f;
            margin-top: 0;
            font-size: 24px;
            font-weight: 700;
        }

        .confirm-modal p {
            color: #ccc;
            font-size: 14px;
            line-height: 1.6;
        }

    .modal-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
    }

    .delete-confirm-btn {
        padding: 9px 20px;
        background: #e41e3f;
        color: white;
        border: 2px solid #000;
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        cursor: pointer;
    }

        .delete-confirm-btn:hover:not(:disabled) {
            background: #c41830;
        }

    /* ── Feedback Messages ──────────────────────────────────────── */
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