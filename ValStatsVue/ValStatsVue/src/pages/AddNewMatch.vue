<template>
    <div class="add-match">
        <div class="header">
            <h1>Add New Match</h1>
        </div>

        <div class="selections">
            <nav class="season">
                <h2>Season:</h2>
                <b-dropdown :text="selectedSeason || 'Choose a Season'">
                    <b-dropdown-item v-for="season in seasons"
                                     :key="season.id"
                                     @click="onSeasonSelect(season)">
                        {{ season.name }}
                    </b-dropdown-item>
                </b-dropdown>
            </nav>
            <nav class="league">
                <h2>League:</h2>
                <b-dropdown :text="selectedLeague || 'Choose a League'">
                    <b-dropdown-item v-for="league in leagues"
                                     :key="league.id"
                                     @click="onLeagueSelect(league)">
                        {{ league.name }}
                    </b-dropdown-item>
                </b-dropdown>
            </nav>
            <nav class="team">
                <h2>Team:</h2>
                <b-dropdown :text="selectedTeam || 'Choose a Team'">
                    <b-dropdown-item v-for="team in teams"
                                     :key="team.id"
                                     @click="selectedTeam = team.name">
                        {{ team.name }}
                    </b-dropdown-item>
                </b-dropdown>
            </nav>
            <nav class="date">
                <h2>Date:</h2>
                <input type="date" v-model="selectedDate" />
            </nav>
        </div>

        <!-- Opponent Row -->
        <div class="opponent-row">
            <h2>Opponent:</h2>
            <div class="opponent-input-wrapper" ref="opponentWrapper">
                <input class="opponent-input"
                       v-model="opponentInput"
                       placeholder="Enter opponent name..."
                       @input="onOpponentInput"
                       @keydown.enter.prevent="onOpponentEnter"
                       @focus="showOpponentDropdown = filteredOpponents.length > 0" />
                <ul v-if="showOpponentDropdown && filteredOpponents.length" class="opponent-dropdown">
                    <li v-for="opp in filteredOpponents"
                        :key="opp.id"
                        @mousedown.prevent="selectOpponent(opp)">
                        {{ opp.name }}
                    </li>
                </ul>
            </div>
        </div>

        <!-- Screenshot Scanner -->
        <div class="image-reader-section">
            <button class="toggle-reader-btn" @click="showImageReader = !showImageReader">
                {{ showImageReader ? '▲ Hide Scanner' : '📷 Import from Screenshot' }}
            </button>

            <div v-if="showImageReader" class="reader-wrapper">
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

        <!-- Submit error -->
        <p v-if="submitError" class="submit-error">⚠ {{ submitError }}</p>

        <!-- Submit Row -->
        <div class="submit-row">
            <button class="submit-btn"
                    :class="{ 'submit-btn--loading': isSubmitting, 'submit-btn--success': submitSuccess }"
                    :disabled="isSubmitting || submitSuccess"
                    @click="submitMatch">
                <span v-if="isSubmitting">SAVING...</span>
                <span v-else-if="submitSuccess">✓ SAVED</span>
                <span v-else>ADD MATCH</span>
            </button>
        </div>

        <!-- Confirm New Opponent Modal -->
        <div v-if="showConfirmModal" class="modal-overlay">
            <div class="modal-box">
                <h3>New Opponent</h3>
                <p>"{{ pendingOpponent }}" isn't in the list yet.<br />Add them as a new opponent?</p>
                <div class="modal-buttons">
                    <button class="btn-confirm" @click="confirmNewOpponent">Yes, Add</button>
                    <button class="btn-cancel" @click="cancelNewOpponent">Cancel</button>
                </div>
                <p v-if="confirmError" class="modal-error">{{ confirmError }}</p>
            </div>
        </div>
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
                this.showImageReader = false
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
                this.showImageReader = false
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
        padding: 0 20px 40px;
    }

    .header {
        padding-top: 25px;
        text-align: center;
        text-decoration: underline;
    }

    .selections {
        display: flex;
        padding: 20px 0;
        align-items: center;
        gap: 30px;
    }

    input[type="date"] {
        background-color: #3a3a3a;
        color: white;
        border: 1px solid #555;
        border-radius: 6px;
        padding: 4px 8px;
    }

        input[type="date"]::-webkit-calendar-picker-indicator {
            filter: invert(1);
        }

    /* Opponent Row */
    .opponent-row {
        display: flex;
        align-items: center;
        gap: 20px;
        padding: 10px 0 20px 0;
    }

        .opponent-row h2 {
            margin: 0;
            white-space: nowrap;
        }

    .opponent-input-wrapper {
        position: relative;
        flex: 1;
        max-width: 500px;
    }

    .opponent-input {
        width: 100%;
        padding: 8px 12px;
        background-color: #3a3a3a;
        color: white;
        border: 1px solid #555;
        border-radius: 6px;
        font-size: 16px;
        font-family: 'Montserrat', sans-serif;
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
        background-color: #3a3a3a;
        border: 1px solid #555;
        border-top: none;
        border-radius: 0 0 6px 6px;
        list-style: none;
        margin: 0;
        padding: 0;
        z-index: 1000;
        max-height: 200px;
        overflow-y: auto;
    }

        .opponent-dropdown li {
            padding: 10px 12px;
            cursor: pointer;
            color: white;
        }

            .opponent-dropdown li:hover {
                background-color: #e41e3f;
            }

    /* Scanner Section */
    .image-reader-section {
        margin: 8px 0 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }

    .toggle-reader-btn {
        align-self: flex-start;
        background: transparent;
        border: 1px solid #555;
        color: #ccc;
        padding: 8px 18px;
        border-radius: 4px;
        cursor: pointer;
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
        transition: border-color 0.2s, color 0.2s;
    }

        .toggle-reader-btn:hover {
            border-color: #e41e3f;
            color: white;
        }

    .reader-wrapper {
        border: 1px solid #333;
        border-radius: 8px;
        padding: 16px;
        background: #1e1e1e;
    }

    .scan-badge {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        background: rgba(45, 212, 191, 0.08);
        border: 1px solid rgba(45, 212, 191, 0.25);
        color: #2dd4bf;
        padding: 8px 16px;
        border-radius: 6px;
        font-size: 13px;
        font-family: 'Montserrat', sans-serif;
    }

    .clear-scan {
        background: none;
        border: none;
        color: #2dd4bf;
        cursor: pointer;
        font-size: 16px;
        padding: 0;
        line-height: 1;
    }

        .clear-scan:hover {
            color: #fff;
        }

    /* Submit */
    .submit-error {
        color: #e41e3f;
        font-size: 14px;
        margin: 0 0 12px;
        font-family: 'Montserrat', sans-serif;
    }

    .submit-row {
        display: flex;
        justify-content: flex-end;
        padding-top: 8px;
    }

    /* Matches the navbar button style */
    .submit-btn {
        background-color: #e41e3f;
        color: white;
        border: none;
        padding: 14px 36px;
        font-size: 15px;
        font-family: 'Montserrat', sans-serif;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        cursor: pointer;
        transition: background-color 0.15s, transform 0.1s;
        min-width: 160px;
    }

        .submit-btn:hover:not(:disabled) {
            background-color: #c41830;
        }

        .submit-btn:active:not(:disabled) {
            transform: translateY(1px);
        }

        .submit-btn:disabled {
            cursor: default;
        }

    .submit-btn--loading {
        background-color: #555;
    }

    .submit-btn--success {
        background-color: #2dd4bf;
    }

    /* Modal */
    .modal-overlay {
        position: fixed;
        inset: 0;
        background-color: rgba(0,0,0,0.65);
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
        font-size: 13px;
        margin-top: 12px;
    }

    .modal-buttons {
        display: flex;
        justify-content: center;
        gap: 20px;
    }

    .btn-confirm {
        background-color: #e41e3f;
        color: white;
        border: none;
        padding: 10px 28px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        font-family: 'Montserrat', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

        .btn-confirm:hover {
            background-color: #c41830;
        }

    .btn-cancel {
        background-color: #555;
        color: white;
        border: none;
        padding: 10px 28px;
        font-size: 15px;
        font-weight: 700;
        cursor: pointer;
        font-family: 'Montserrat', sans-serif;
        text-transform: uppercase;
        letter-spacing: 0.06em;
    }

        .btn-cancel:hover {
            background-color: #444;
        }
</style>