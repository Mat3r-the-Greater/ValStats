<template>
    <div class="season-view">
        <div class="header">
            <h1>Season View</h1>
        </div>

        <!-- Selection Row -->
        <div class="selection-row">
            <div class="dropdown-group">
                <label>Select Season</label>
                <b-dropdown :text="selectedSeason ? selectedSeason.name : 'Choose a Season'" class="val-dropdown">
                    <b-dropdown-item v-for="season in seasons"
                                     :key="season.id"
                                     @click="onSeasonSelect(season)">
                        {{ season.name }}
                    </b-dropdown-item>
                </b-dropdown>
            </div>

            <transition name="fade-slide">
                <div v-if="selectedSeason" class="dropdown-group">
                    <label>Select League</label>
                    <b-dropdown :text="selectedLeague ? selectedLeague.name : 'Choose a League'" class="val-dropdown">
                        <b-dropdown-item v-if="leagues.length === 0" disabled>No leagues found for this season</b-dropdown-item>
                        <b-dropdown-item v-for="league in leagues"
                                         :key="league.id"
                                         @click="onLeagueSelect(league)">
                            {{ league.name }}
                        </b-dropdown-item>
                    </b-dropdown>
                </div>
            </transition>

            <transition name="fade-slide">
                <div v-if="selectedLeague" class="dropdown-group">
                    <label>Select Team</label>
                    <b-dropdown :text="selectedTeam ? selectedTeam.name : 'Choose a Team'" class="val-dropdown">
                        <b-dropdown-item v-if="teams.length === 0" disabled>No teams found for this league</b-dropdown-item>
                        <b-dropdown-item v-for="team in teams"
                                         :key="team.name"
                                         @click="onTeamSelect(team)">
                            {{ team.name }}
                        </b-dropdown-item>
                    </b-dropdown>
                </div>
            </transition>

            <transition name="fade-slide">
                <button v-if="selectedTeam"
                        class="submit-btn"
                        :disabled="isLoading"
                        @click="loadMatches">
                    <span v-if="isLoading">Loading...</span>
                    <span v-else>View Matches</span>
                </button>
            </transition>
        </div>

        <!-- Results Section -->
        <transition name="fade">
            <div v-if="matchesLoaded" class="results-section">
                <div class="results-header">
                    <h2>{{ selectedSeason.name }} — {{ selectedLeague.name }} — {{ selectedTeam.name }}</h2>
                    <div class="record-badges">
                        <span class="badge victory">{{ record.wins }}W</span>
                        <span class="badge defeat">{{ record.losses }}L</span>
                    </div>
                </div>

                <div v-if="matches.length === 0" class="no-results">
                    No matches found for this team and league.
                </div>

                <table v-else class="match-table">
                    <thead>
                        <tr>
                            <th></th>
                            <th>Date</th>
                            <th>Opponent</th>
                            <th>Result</th>
                            <th>Score</th>
                            <th v-if="canDelete"></th>
                        </tr>
                    </thead>
                    <tbody>
                        <template v-for="match in matches" :key="match.id">
                            <!-- Match Row -->
                            <tr class="match-row" @click="toggleMatch(match.id)">
                                <td class="chevron-cell">
                                    <span class="chevron" :class="{ open: expandedMatchId === match.id }">&#8250;</span>
                                </td>
                                <td>{{ formatDate(match.date) }}</td>
                                <td>{{ match.opponents?.name || '—' }}</td>
                                <td>
                                    <span class="result-pill" :class="match.result?.toLowerCase()">
                                        {{ match.result || '—' }}
                                    </span>
                                </td>
                                <td class="score">{{ match.our_score }} – {{ match.their_score }}</td>
                                <td v-if="canDelete" class="action-cell" @click.stop>
                                    <button class="delete-btn" @click="confirmDeleteMatch(match)" title="Delete Match">
                                        🗑
                                    </button>
                                </td>
                            </tr>

                            <!-- Expanded Stats Row -->
                            <tr v-if="expandedMatchId === match.id" class="stats-row">
                                <td :colspan="canDelete ? 6 : 5" class="stats-cell">
                                    <div v-if="loadingStats" class="stats-loading">Loading stats...</div>
                                    <div v-else class="stats-panels">
                                        <!-- Our Team -->
                                        <div class="stats-panel">
                                            <div class="panel-title our">{{ selectedTeam.name }}</div>
                                            <table class="stats-table">
                                                <thead>
                                                    <tr>
                                                        <th>Player</th>
                                                        <th>ACS</th>
                                                        <th>K</th>
                                                        <th>D</th>
                                                        <th>A</th>
                                                        <th>K/D</th>
                                                        <th>Econ</th>
                                                        <th>FB</th>
                                                        <th>Plants</th>
                                                        <th>Defuses</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr v-if="ourPlayers.length === 0">
                                                        <td colspan="10" class="no-players">No player data</td>
                                                    </tr>
                                                    <tr v-for="p in ourPlayers" :key="p.id">
                                                        <td class="player-name">{{ p.player_name }}</td>
                                                        <td>{{ p.acs }}</td>
                                                        <td class="kill">{{ p.kills }}</td>
                                                        <td class="death">{{ p.deaths }}</td>
                                                        <td>{{ p.assists }}</td>
                                                        <td>{{ p.kd }}</td>
                                                        <td>{{ p.econ_rating }}</td>
                                                        <td>{{ p.first_bloods }}</td>
                                                        <td>{{ p.plants }}</td>
                                                        <td>{{ p.defuses }}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>

                                        <!-- Their Team -->
                                        <div class="stats-panel">
                                            <div class="panel-title their">{{ match.opponents?.name || 'Opponent' }}</div>
                                            <table class="stats-table">
                                                <thead>
                                                    <tr>
                                                        <th>Player</th>
                                                        <th>ACS</th>
                                                        <th>K</th>
                                                        <th>D</th>
                                                        <th>A</th>
                                                        <th>K/D</th>
                                                        <th>Econ</th>
                                                        <th>FB</th>
                                                        <th>Plants</th>
                                                        <th>Defuses</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr v-if="theirPlayers.length === 0">
                                                        <td colspan="10" class="no-players">No player data</td>
                                                    </tr>
                                                    <tr v-for="p in theirPlayers" :key="p.id">
                                                        <td class="player-name">{{ p.player_name }}</td>
                                                        <td>{{ p.acs }}</td>
                                                        <td class="kill">{{ p.kills }}</td>
                                                        <td class="death">{{ p.deaths }}</td>
                                                        <td>{{ p.assists }}</td>
                                                        <td>{{ p.kd }}</td>
                                                        <td>{{ p.econ_rating }}</td>
                                                        <td>{{ p.first_bloods }}</td>
                                                        <td>{{ p.plants }}</td>
                                                        <td>{{ p.defuses }}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                        </template>
                    </tbody>
                </table>
            </div>
        </transition>

        <!-- Delete Confirmation Modal -->
        <div v-if="matchToDelete" class="modal-overlay" @click.self="matchToDelete = null">
            <div class="confirm-modal">
                <h3>Delete Match</h3>
                <p>
                    Are you sure you want to delete the match vs
                    <strong>{{ matchToDelete.opponents?.name || 'this opponent' }}</strong>
                    on <strong>{{ formatDate(matchToDelete.date) }}</strong>?
                </p>
                <p class="modal-warning">This will permanently delete the match and all associated player stats.</p>
                <div class="modal-actions">
                    <button class="cancel-btn" @click="matchToDelete = null">Cancel</button>
                    <button class="delete-confirm-btn" @click="deleteMatch" :disabled="deletingMatch">
                        {{ deletingMatch ? 'Deleting...' : 'Delete' }}
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
        name: 'SeasonView',
        data() {
            return {
                seasons: [],
                leagues: [],
                teams: [],
                matches: [],
                selectedSeason: null,
                selectedLeague: null,
                selectedTeam: null,
                isLoading: false,
                matchesLoaded: false,
                expandedMatchId: null,
                loadingStats: false,
                ourPlayers: [],
                theirPlayers: [],
                matchToDelete: null,
                deletingMatch: false,
            }
        },
        computed: {
            authStore() {
                return useAuthStore()
            },
            canDelete() {
                return ['admin', 'coach', 'captain'].includes(this.authStore.role)
            },
            record() {
                return {
                    wins: this.matches.filter(m => m.result?.toLowerCase() === 'victory').length,
                    losses: this.matches.filter(m => m.result?.toLowerCase() === 'defeat').length,
                }
            }
        },
        async created() {
            const { data } = await supabase.from('seasons').select('*').order('name')
            this.seasons = data || []
        },
        methods: {
            async onSeasonSelect(season) {
                this.selectedSeason = season
                this.selectedLeague = null
                this.selectedTeam = null
                this.leagues = []
                this.teams = []
                this.matchesLoaded = false
                this.matches = []
                this.expandedMatchId = null

                const { data } = await supabase
                    .from('leagues')
                    .select('*')
                    .eq('season_id', season.id)
                    .order('name')
                this.leagues = data || []
            },

            async onLeagueSelect(league) {
                this.selectedLeague = league
                this.selectedTeam = null
                this.teams = []
                this.matchesLoaded = false
                this.matches = []
                this.expandedMatchId = null

                const { data } = await supabase
                    .from('matches')
                    .select('our_team_name')
                    .eq('season_id', this.selectedSeason.id)
                    .eq('league_id', league.id)

                const unique = [...new Set((data || []).map(m => m.our_team_name).filter(Boolean))]
                this.teams = unique.map(name => ({ name }))
            },

            onTeamSelect(team) {
                this.selectedTeam = team
                this.matchesLoaded = false
                this.matches = []
                this.expandedMatchId = null
            },

            async loadMatches() {
                this.isLoading = true
                this.matchesLoaded = false
                this.expandedMatchId = null

                const { data, error } = await supabase
                    .from('matches')
                    .select('*, opponents(name)')
                    .eq('season_id', this.selectedSeason.id)
                    .eq('league_id', this.selectedLeague.id)
                    .eq('our_team_name', this.selectedTeam.name)
                    .order('date', { ascending: false })

                if (error) console.error('Error loading matches:', error)
                else this.matches = data || []

                this.isLoading = false
                this.matchesLoaded = true
            },

            async toggleMatch(matchId) {
                if (this.expandedMatchId === matchId) {
                    this.expandedMatchId = null
                    this.ourPlayers = []
                    this.theirPlayers = []
                    return
                }

                this.expandedMatchId = matchId
                this.loadingStats = true
                this.ourPlayers = []
                this.theirPlayers = []

                const { data, error } = await supabase
                    .from('match_players')
                    .select('*')
                    .eq('match_id', matchId)
                    .order('acs', { ascending: false })

                if (error) console.error('Error loading player stats:', error)
                else {
                    this.ourPlayers = (data || []).filter(p => p.team === 'ours')
                    this.theirPlayers = (data || []).filter(p => p.team === 'theirs')
                }

                this.loadingStats = false
            },

            confirmDeleteMatch(match) {
                this.matchToDelete = match
            },

            async deleteMatch() {
                this.deletingMatch = true

                // Delete player stats first, then the match
                const { error: playersError } = await supabase
                    .from('match_players')
                    .delete()
                    .eq('match_id', this.matchToDelete.id)

                if (playersError) {
                    console.error('Failed to delete player stats:', playersError)
                    this.deletingMatch = false
                    return
                }

                const { error: matchError } = await supabase
                    .from('matches')
                    .delete()
                    .eq('id', this.matchToDelete.id)

                if (matchError) {
                    console.error('Failed to delete match:', matchError)
                } else {
                    // If the deleted match was expanded, close it
                    if (this.expandedMatchId === this.matchToDelete.id) {
                        this.expandedMatchId = null
                        this.ourPlayers = []
                        this.theirPlayers = []
                    }
                    // Remove from local list without re-fetching
                    this.matches = this.matches.filter(m => m.id !== this.matchToDelete.id)
                }

                this.matchToDelete = null
                this.deletingMatch = false
            },

            formatDate(dateStr) {
                if (!dateStr) return '—'
                const d = new Date(dateStr + 'T00:00:00')
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            }
        }
    }
</script>

<style scoped>
    .season-view {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 24px 60px;
    }

    .header {
        padding-top: 30px;
        text-align: center;
        margin-bottom: 10px;
    }

        .header h1 {
            font-size: 32px;
            font-weight: 700;
            text-decoration: underline;
            font-family: 'Montserrat', sans-serif;
        }

    /* ── Selection Row ─────────────────────────────────────────── */
    .selection-row {
        display: flex;
        align-items: flex-end;
        gap: 24px;
        padding: 28px 0 32px;
        flex-wrap: wrap;
    }

    .dropdown-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
    }

        .dropdown-group label {
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            color: #aaa;
            font-family: 'Montserrat', sans-serif;
        }

    .val-dropdown :deep(.btn) {
        background-color: #3a3a3a;
        color: white;
        border: 1px solid #555;
        font-family: 'Montserrat', sans-serif;
        font-weight: 600;
        min-width: 200px;
        text-align: left;
    }

    .val-dropdown :deep(.btn:hover),
    .val-dropdown :deep(.btn:focus) {
        background-color: #4a4a4a;
        border-color: rgba(247, 189, 18, 0.92);
        box-shadow: none;
    }

    .val-dropdown :deep(.dropdown-menu) {
        background-color: #2a2a2a;
        border: 1px solid #555;
        min-width: 200px;
    }

    .val-dropdown :deep(.dropdown-item) {
        color: white;
        font-family: 'Montserrat', sans-serif;
    }

    .val-dropdown :deep(.dropdown-item:hover) {
        background-color: rgba(247, 189, 18, 0.92);
    }

    .submit-btn {
        background-color: rgba(247, 189, 18, 0.92);
        color: rgba(19, 48, 85, 1);
        font-weight:00;
        border: none;
        padding: 10px 28px;
        font-size: 14px;
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        cursor: pointer;
        transition: background-color 0.15s;
        height: 38px;
    }

        .submit-btn:hover:not(:disabled) {
            opacity: .88;
        }

        .submit-btn:disabled {
            opacity: 0.6;
            cursor: default;
        }

    /* ── Results ───────────────────────────────────────────────── */
    .results-section {
        border-top: 2px solid #444;
        padding-top: 28px;
    }

    .results-header {
        display: flex;
        align-items: center;
        gap: 16px;
        margin-bottom: 20px;
        flex-wrap: wrap;
    }

        .results-header h2 {
            font-size: 22px;
            font-weight: 700;
            font-family: 'Montserrat', sans-serif;
            margin: 0;
        }

    .record-badges {
        display: flex;
        gap: 8px;
    }

    .badge {
        padding: 4px 14px;
        border-radius: 20px;
        font-size: 13px;
        font-weight: 700;
        font-family: 'Montserrat', sans-serif;
        letter-spacing: 0.05em;
    }

        .badge.victory {
            background-color: rgba(34, 197, 94, 0.15);
            color: #22c55e;
            border: 1px solid rgba(34, 197, 94, 0.3);
        }

        .badge.defeat {
            background-color: rgba(228, 30, 63, 0.15);
            color: rgba(247, 189, 18, 0.92);
            border: 1px solid rgba(228, 30, 63, 0.3);
        }

    .no-results {
        text-align: center;
        color: #888;
        padding: 40px;
        font-family: 'Montserrat', sans-serif;
    }

    /* ── Match Table ───────────────────────────────────────────── */
    .match-table {
        width: 100%;
        border-collapse: collapse;
        font-family: 'Montserrat', sans-serif;
    }

        .match-table thead th {
            background-color: #1e1e1e;
            color: #aaa;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            padding: 12px 16px;
            text-align: left;
            border-bottom: 2px solid #333;
        }

    .match-row {
        border-bottom: 1px solid #333;
        cursor: pointer;
        transition: background-color 0.15s;
    }

        .match-row:hover {
            background-color: #2f2f2f;
        }

        .match-row td {
            padding: 14px 16px;
            font-size: 14px;
            color: #ddd;
        }

    .chevron-cell {
        width: 32px;
        padding: 14px 8px 14px 16px !important;
    }

    .chevron {
        display: inline-block;
        font-size: 20px;
        color: #888;
        transition: transform 0.2s ease;
        line-height: 1;
        user-select: none;
    }

        .chevron.open {
            transform: rotate(90deg);
            color: rgba(247, 189, 18, 0.92);
        }

    .action-cell {
        width: 48px;
        text-align: right;
        padding: 8px 12px 8px 0 !important;
    }

    .delete-btn {
        background: transparent;
        border: none;
        cursor: pointer;
        font-size: 22px;
        padding: 4px 6px;
        color: lightgray;
        transition: color 0.2s;
        line-height: 1;
    }

        .delete-btn:hover {
            color: rgba(229,62,62,.92);
        }

    .result-pill {
        display: inline-block;
        padding: 3px 12px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
    }

        .result-pill.victory {
            background-color: rgba(34, 197, 94, 0.15);
            color: #22c55e;
        }

        .result-pill.defeat {
            background-color: rgba(228, 30, 63, 0.15);
            color: rgba(229,62,62,1);
        }

    .score {
        font-family: monospace;
        font-size: 15px;
        color: white;
        font-weight: 600;
    }

    /* ── Expanded Stats Row ────────────────────────────────────── */
    .stats-row {
        background-color: #1a1a1a;
    }

    .stats-cell {
        padding: 20px 16px !important;
        border-bottom: 2px solid #444;
    }

    .stats-loading {
        text-align: center;
        color: #888;
        padding: 20px;
        font-family: 'Montserrat', sans-serif;
        font-size: 13px;
    }

    .stats-panels {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .stats-panel {
        background-color: #222;
        border: 1px solid #333;
        border-radius: 6px;
        overflow: hidden;
    }

    .panel-title {
        padding: 8px 14px;
        font-size: 12px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-family: 'Montserrat', sans-serif;
    }

        .panel-title.our {
            background-color: rgba(34, 197, 94, 0.1);
            color: #22c55e;
            border-bottom: 1px solid rgba(34, 197, 94, 0.2);
        }

        .panel-title.their {
            background-color: rgba(228, 30, 63, 0.08);
            color: rgba(228, 30, 63, .85);
            border-bottom: 1px solid rgba(228, 30, 63, 0.2);
        }

    .stats-table {
        width: 100%;
        border-collapse: collapse;
        font-family: 'Montserrat', sans-serif;
        font-size: 13px;
    }

        .stats-table thead th {
            background-color: #1e1e1e;
            color: #777;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #333;
        }

        .stats-table tbody tr {
            border-bottom: 1px solid #2a2a2a;
            transition: background-color 0.1s;
        }

            .stats-table tbody tr:last-child {
                border-bottom: none;
            }

            .stats-table tbody tr:hover {
                background-color: #2a2a2a;
            }

        .stats-table td {
            padding: 9px 12px;
            color: #ccc;
        }

    .player-name {
        font-weight: 600;
        color: white !important;
        min-width: 120px;
    }

    .kill {
        color: #22c55e !important;
        font-weight: 600;
    }

    .death {
        color: rgba(229,62,62,.92) !important;
        font-weight: 600;
    }

    .no-players {
        text-align: center;
        color: #555;
        padding: 16px;
        font-style: italic;
    }

    /* ── Delete Modal ──────────────────────────────────────────── */
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
        font-family: 'Montserrat', sans-serif;
    }

        .confirm-modal h3 {
            color: rgba(247, 189, 18, 0.92);
            margin-top: 0;
            font-size: 24px;
            font-weight: 700;
        }

        .confirm-modal p {
            color: #ccc;
            font-size: 14px;
            line-height: 1.6;
            margin: 0 0 8px;
        }

    .modal-warning {
        color: #888 !important;
        font-size: 12px !important;
        font-style: italic;
    }

    .modal-actions {
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        margin-top: 24px;
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

    .delete-confirm-btn {
        padding: 9px 20px;
        background: rgba(247, 189, 18, 0.92);
        color: white;
        border: 2px solid #000;
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        cursor: pointer;
    }

        .delete-confirm-btn:hover:not(:disabled) {
            background: rgba(247, 189, 18, 0.72);
        }

        .delete-confirm-btn:disabled {
            opacity: 0.6;
            cursor: default;
        }

    /* ── Transitions ───────────────────────────────────────────── */
    .fade-slide-enter-active, .fade-slide-leave-active {
        transition: opacity 0.25s ease, transform 0.25s ease;
    }

    .fade-slide-enter-from, .fade-slide-leave-to {
        opacity: 0;
        transform: translateX(-8px);
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity 0.3s ease;
    }

    .fade-enter-from, .fade-leave-to {
        opacity: 0;
    }
</style>