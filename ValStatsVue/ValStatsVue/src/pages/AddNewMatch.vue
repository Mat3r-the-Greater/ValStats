<template>
    <div class="add-match">
        <div class="header">
            <h1>Add New Match</h1>
        </div>

        <div class="selection-row">
            <div class="dropdown-group">
                <label>Select Season</label>
                <b-dropdown :text="selectedSeason || 'Choose a Season'" class="val-dropdown">
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
                    <b-dropdown :text="selectedLeague || 'Choose a League'" class="val-dropdown">
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
                    <b-dropdown :text="selectedTeam || 'Choose a Team'" class="val-dropdown">
                        <b-dropdown-item v-if="teams.length === 0" disabled>No teams found</b-dropdown-item>
                        <b-dropdown-item v-for="team in teams"
                                         :key="team.id"
                                         @click="selectedTeam = team.name">
                            {{ team.name }}
                        </b-dropdown-item>
                    </b-dropdown>
                </div>
            </transition>

            <transition name="fade-slide">
                <div v-if="selectedLeague" class="dropdown-group">
                    <label>Date</label>
                    <input type="date" v-model="selectedDate" class="date-input" />
                </div>
            </transition>
        </div>

        <!-- Opponent Row -->
        <transition name="fade-slide">
            <div v-if="selectedLeague" class="opponent-section">
                <div class="dropdown-group">
                    <label>Opponent</label>
                    <div class="opponent-input-wrapper" ref="opponentWrapper">
                        <input type="text"
                               class="opponent-input"
                               v-model="opponentInput"
                               @input="onOpponentInput"
                               @focus="showOpponentDropdown = true"
                               @keydown.enter.prevent="onOpponentEnter"
                               placeholder="Enter opponent name..." />
                        <ul v-if="showOpponentDropdown && filteredOpponents.length > 0" class="opponent-dropdown">
                            <li v-for="opponent in filteredOpponents"
                                :key="opponent.id"
                                @mousedown.prevent="selectOpponent(opponent)">
                                {{ opponent.name }}
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </transition>

        <!-- Confirm New Opponent Modal -->
        <div v-if="showConfirmModal" class="modal-overlay">
            <div class="modal-box">
                <h3>New Opponent</h3>
                <p>"{{ pendingOpponent }}" was not found. Add them as a new opponent?</p>
                <p v-if="confirmError" class="modal-error">{{ confirmError }}</p>
                <div class="modal-buttons">
                    <button class="btn-confirm" @click="confirmNewOpponent">Yes, Add</button>
                    <button class="btn-cancel" @click="cancelNewOpponent">Cancel</button>
                </div>
            </div>
        </div>
        <!-- Screenshot Scanner -->
        <transition name="fade-slide">
            <div v-if="selectedOpponent" class="image-reader-section">
                <div class="reader-wrapper">
                    <ValImageReader @match-parsed="onMatchParsed" />
                </div>

                <div v-if="imageMatchData" class="scan-badge">
                    ✓ Screenshot scanned —
                    <strong>{{ imageMatchData.result }}</strong>
                    {{ imageMatchData.ourScore }}–{{ imageMatchData.theirScore }}
                    ({{ imageMatchData.ourTeam.length + imageMatchData.theirTeam.length }} players)
                    <button class="clear-scan" @click="imageMatchData = null">✕</button>
                </div>
            </div>
        </transition>

        <!-- Submit -->
        <transition name="fade-slide">
            <div v-if="selectedOpponent" class="submit-row">
                <p v-if="submitError" class="submit-error">⚠ {{ submitError }}</p>
                <button class="submit-btn"
                        :class="{ 'submit-btn--loading': isSubmitting, 'submit-btn--success': submitSuccess }"
                        :disabled="isSubmitting || submitSuccess"
                        @click="submitMatch">
                    <span v-if="isSubmitting">SAVING...</span>
                    <span v-else-if="submitSuccess">✓ SAVED</span>
                    <span v-else>ADD MATCH</span>
                </button>
            </div>
        </transition>
    </div>
</template>

<script>
    import { supabase } from '../supabase'
    import ValImageReader from '../components/ValImageReader.vue'

    export default {
        name: 'AddNewMatch',

        components: { ValImageReader },

        data() {
            return {
                selectedSeason: '',
                selectedSeasonId: null,
                seasons: [],
                selectedLeague: '',
                selectedLeagueId: null,
                leagues: [],
                selectedTeam: '',
                teams: [],
                selectedDate: new Date().toISOString().split('T')[0],

                opponentInput: '',
                selectedOpponent: null,
                opponents: [],
                filteredOpponents: [],
                showOpponentDropdown: false,
                showConfirmModal: false,
                pendingOpponent: '',
                confirmError: '',

                showImageReader: false,
                imageMatchData: null,

                isSubmitting: false,
                submitSuccess: false,
                submitError: '',
            }
        },

        async created() {
            const { data: seasons } = await supabase
                .from('seasons').select('*').order('name')
            this.seasons = seasons

            if (seasons?.length > 0) {
                await this.onSeasonSelect(seasons[seasons.length - 1])
            }

            const { data: teams } = await supabase
                .from('our_teams').select('*').order('name')
            this.teams = teams
        },

        mounted() {
            document.addEventListener('click', this.handleOutsideClick)
        },

        beforeUnmount() {
            document.removeEventListener('click', this.handleOutsideClick)
        },

        methods: {
            // ── Dropdowns ────────────────────────────────────────────────────
            async onSeasonSelect(season) {
                this.selectedSeason = season.name
                this.selectedSeasonId = season.id
                this.selectedLeague = ''
                this.selectedLeagueId = null
                this.opponents = []
                this.filteredOpponents = []
                this.opponentInput = ''

                const { data: leagues } = await supabase
                    .from('leagues').select('*')
                    .eq('season_id', season.id).order('name')
                this.leagues = leagues
            },

            async onLeagueSelect(league) {
                this.selectedLeague = league.name
                this.selectedLeagueId = league.id
                this.opponentInput = ''
                this.selectedOpponent = null

                const { data: opponents, error } = await supabase
                    .from('opponents').select('*')
                    .eq('league_id', league.id).order('name')
                if (error) console.error('Failed to load opponents:', error.message)
                this.opponents = opponents || []
                this.filteredOpponents = []
            },

            onOpponentInput() {
                this.selectedOpponent = null
                const query = this.opponentInput.toLowerCase()
                this.filteredOpponents = this.opponents.filter(o =>
                    o.name.toLowerCase().includes(query)
                )
                this.showOpponentDropdown = true
            },

            selectOpponent(opponent) {
                this.opponentInput = opponent.name
                this.selectedOpponent = opponent
                this.showOpponentDropdown = false
                this.filteredOpponents = []
            },

            onOpponentEnter() {
                const match = this.opponents.find(
                    o => o.name.toLowerCase() === this.opponentInput.toLowerCase()
                )
                if (match) {
                    this.selectOpponent(match)
                } else if (this.opponentInput.trim()) {
                    this.pendingOpponent = this.opponentInput.trim()
                    this.showConfirmModal = true
                    this.showOpponentDropdown = false
                }
            },

            async confirmNewOpponent() {
                if (!this.selectedLeagueId) {
                    this.confirmError = 'Please select a league before adding an opponent.'
                    return
                }
                const { data, error } = await supabase
                    .from('opponents')
                    .insert({ name: this.pendingOpponent, league_id: this.selectedLeagueId })
                    .select().single()

                if (error) {
                    this.confirmError = 'Failed to add opponent: ' + error.message
                    return
                }
                if (data) {
                    this.opponents.push(data)
                    this.selectOpponent(data)
                }
                this.showConfirmModal = false
                this.confirmError = ''
                this.pendingOpponent = ''
            },

            cancelNewOpponent() {
                this.showConfirmModal = false
                this.pendingOpponent = ''
                this.confirmError = ''
                this.opponentInput = ''
            },

            handleOutsideClick(e) {
                if (this.$refs.opponentWrapper && !this.$refs.opponentWrapper.contains(e.target)) {
                    this.showOpponentDropdown = false
                }
            },

            // ── Scanner ───────────────────────────────────────────────────────
            onMatchParsed(data) {
                this.imageMatchData = data
            },

            // ── Submit ────────────────────────────────────────────────────────
            async submitMatch() {
                this.submitError = ''

                // Validation
                if (!this.selectedSeasonId) return this.submitError = 'Please select a season.'
                if (!this.selectedLeagueId) return this.submitError = 'Please select a league.'
                if (!this.selectedTeam) return this.submitError = 'Please select a team.'
                if (!this.selectedOpponent) return this.submitError = 'Please select an opponent.'
                if (!this.imageMatchData) return this.submitError = 'Please scan a screenshot before submitting.'

                this.isSubmitting = true

                try {
                    // ── 1. Insert the match row ───────────────────────────────
                    const { data: match, error: matchError } = await supabase
                        .from('matches')
                        .insert({
                            date: this.selectedDate,
                            season_id: this.selectedSeasonId,
                            league_id: this.selectedLeagueId,
                            opponent_id: this.selectedOpponent.id,
                            our_team_name: this.selectedTeam,
                            result: this.imageMatchData.result,
                            our_score: this.imageMatchData.ourScore,
                            their_score: this.imageMatchData.theirScore,
                        })
                        .select()
                        .single()

                    if (matchError) throw new Error('Failed to save match: ' + matchError.message)

                    // ── 2. Build player rows for both teams ───────────────────
                    const playerRows = [
                        ...this.imageMatchData.ourTeam.map(p => ({
                            match_id: match.id,
                            team: 'ours',
                            player_name: p.name,
                            acs: p.acs || 0,
                            kills: p.kills || 0,
                            deaths: p.deaths || 0,
                            assists: p.assists || 0,
                            kd: p.kd || 0,
                            econ_rating: p.econRating || 0,
                            first_bloods: p.firstBloods || 0,
                            plants: p.plants || 0,
                            defuses: p.defuses || 0,
                        })),
                        ...this.imageMatchData.theirTeam.map(p => ({
                            match_id: match.id,
                            team: 'theirs',
                            player_name: p.name,
                            acs: p.acs || 0,
                            kills: p.kills || 0,
                            deaths: p.deaths || 0,
                            assists: p.assists || 0,
                            kd: p.kd || 0,
                            econ_rating: p.econRating || 0,
                            first_bloods: p.firstBloods || 0,
                            plants: p.plants || 0,
                            defuses: p.defuses || 0,
                        })),
                    ]

                    // ── 3. Insert all player rows in one call ─────────────────
                    const { error: playersError } = await supabase
                        .from('match_players')
                        .insert(playerRows)

                    if (playersError) throw new Error('Match saved but player stats failed: ' + playersError.message)

                    // ── 4. Success — show tick then reset form ────────────────
                    this.submitSuccess = true
                    setTimeout(() => this.resetForm(), 2000)

                } catch (err) {
                    console.error(err)
                    this.submitError = err.message
                } finally {
                    this.isSubmitting = false
                }
            },

            resetForm() {
                this.imageMatchData = null
                this.submitSuccess = false
                this.submitError = ''
                this.opponentInput = ''
                this.selectedOpponent = null
                this.selectedDate = new Date().toISOString().split('T')[0]
                // Re-select current season to refresh leagues/opponents
                const current = this.seasons[this.seasons.length - 1]
                if (current) this.onSeasonSelect(current)
            },
        },
    }
</script>

<style scoped>
    .add-match {
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
        border-color: #e41e3f;
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
        background-color: #e41e3f;
    }

    /* ── Date Input ────────────────────────────────────────────── */
    .date-input {
        background-color: #3a3a3a;
        color: white;
        border: 1px solid #555;
        font-family: 'Montserrat', sans-serif;
        font-weight: 600;
        font-size: 14px;
        padding: 6px 12px;
        height: 38px;
        min-width: 160px;
        box-sizing: border-box;
    }

        .date-input:focus {
            outline: none;
            border-color: #e41e3f;
        }

        .date-input::-webkit-calendar-picker-indicator {
            filter: invert(1);
        }

    /* ── Opponent ──────────────────────────────────────────────── */
    .opponent-section {
        padding-bottom: 32px;
        border-top: 1px solid #333;
        padding-top: 28px;
    }

    .opponent-input-wrapper {
        position: relative;
    }

    .opponent-input {
        background-color: #3a3a3a;
        color: white;
        border: 1px solid #555;
        font-family: 'Montserrat', sans-serif;
        font-weight: 600;
        font-size: 14px;
        padding: 6px 12px;
        height: 38px;
        min-width: 300px;
        box-sizing: border-box;
    }

        .opponent-input:focus {
            outline: none;
            border-color: #e41e3f;
        }

    .opponent-dropdown {
        position: absolute;
        top: 100%;
        left: 0;
        right: 0;
        background-color: #2a2a2a;
        border: 1px solid #555;
        border-top: none;
        list-style: none;
        margin: 0;
        padding: 0;
        z-index: 1000;
        max-height: 200px;
        overflow-y: auto;
        min-width: 300px;
    }

        .opponent-dropdown li {
            padding: 10px 12px;
            cursor: pointer;
            color: white;
            font-family: 'Montserrat', sans-serif;
            font-size: 14px;
        }

            .opponent-dropdown li:hover {
                background-color: #e41e3f;
            }

    /* ── Transitions ───────────────────────────────────────────── */
    .fade-slide-enter-active,
    .fade-slide-leave-active {
        transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .fade-slide-enter-from,
    .fade-slide-leave-to {
        opacity: 0;
        transform: translateY(-6px);
    }

    /* ── Modal ─────────────────────────────────────────────────── */
    .modal-overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0, 0, 0, 0.65);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2000;
    }

    .modal-box {
        background-color: #2a2a2a;
        border: 2px solid #e41e3f;
        border-radius: 8px;
        padding: 30px 40px;
        text-align: center;
        max-width: 400px;
        width: 90%;
        font-family: 'Montserrat', sans-serif;
    }

        .modal-box h3 {
            margin-top: 0;
            font-size: 22px;
            color: #e41e3f;
        }

        .modal-box p {
            font-size: 16px;
            margin-bottom: 24px;
        }

    .modal-error {
        color: #e41e3f;
        font-size: 14px;
        margin: -10px 0 16px 0;
    }

    .modal-buttons {
        display: flex;
        justify-content: center;
        gap: 20px;
    }

    .btn-confirm {
        background-color: #e41e3f;
        color: white;
        border: 2px solid #000;
        padding: 10px 28px;
        font-size: 14px;
        font-weight: 700;
        font-family: 'Montserrat', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        cursor: pointer;
        transition: background-color 0.15s;
    }

        .btn-confirm:hover {
            background-color: #c41830;
        }

    .btn-cancel {
        background-color: #3a3a3a;
        color: white;
        border: 1px solid #555;
        padding: 10px 28px;
        font-size: 14px;
        font-weight: 700;
        font-family: 'Montserrat', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        cursor: pointer;
        transition: background-color 0.15s;
    }

        .btn-cancel:hover {
            background-color: #4a4a4a;
        }

    /* ── Scanner ───────────────────────────────────────────────── */
    .image-reader-section {
        padding: 28px 0 20px;
        border-top: 1px solid #333;
    }

    .scan-badge {
        margin-top: 14px;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        background-color: rgba(34, 197, 94, 0.1);
        border: 1px solid rgba(34, 197, 94, 0.3);
        color: #22c55e;
        padding: 8px 16px;
        font-size: 13px;
        font-family: 'Montserrat', sans-serif;
        border-radius: 4px;
    }

    .clear-scan {
        background: none;
        border: none;
        color: #22c55e;
        cursor: pointer;
        font-size: 14px;
        padding: 0;
        line-height: 1;
    }

        .clear-scan:hover {
            color: #e41e3f;
        }

    /* ── Submit Row ────────────────────────────────────────────── */
    .submit-row {
        padding: 28px 0;
        border-top: 1px solid #333;
        display: flex;
        align-items: center;
        gap: 20px;
    }

    .submit-error {
        color: #e41e3f;
        font-size: 13px;
        font-family: 'Montserrat', sans-serif;
        margin: 0;
    }

    .submit-btn {
        background-color: #e41e3f;
        color: white;
        border: none;
        padding: 10px 36px;
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
            background-color: #c41830;
        }

        .submit-btn:disabled {
            opacity: 0.6;
            cursor: default;
        }

    .submit-btn--success {
        background-color: #22c55e !important;
        opacity: 1 !important;
    }
</style>