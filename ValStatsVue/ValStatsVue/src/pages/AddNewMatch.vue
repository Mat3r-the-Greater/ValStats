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
        <div class="opponent-row">
            <h2>Opponent:</h2>
            <div class="opponent-input-wrapper" ref="opponentWrapper">
                <input type="text"
                       class="opponent-input"
                       v-model="opponentInput"
                       @input="onOpponentInput"
                       @focus="showOpponentDropdown = true"
                       @keydown.enter="onOpponentEnter"
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
        <div v-if="showConfirmModal" class="modal-overlay">
            <div class="modal-box">
                <h3>New Opponent</h3>
                <p>"{{ pendingOpponent }}" was not found. Add them as a new opponent?</p>
                <div class="modal-buttons">
                    <button class="btn-confirm" @click="confirmNewOpponent">Yes, Add</button>
                    <p v-if="confirmError" class="modal-error">{{ confirmError }}</p>
                    <button class="btn-cancel" @click="cancelNewOpponent">Cancel</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
    import { supabase } from '../supabase'

    export default {
        name: 'AddNewMatch',
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
            };
        },
        async created() {
            const { data: seasons } = await supabase
                .from('seasons')
                .select('*')
                .order('name')
            this.seasons = seasons

            if (seasons && seasons.length > 0) {
                const currentSeason = seasons[seasons.length - 1]
                await this.onSeasonSelect(currentSeason)
            }

            const { data: teams } = await supabase
                .from('our_teams')
                .select('*')
                .order('name')
            this.teams = teams
        },
        methods: {
            async onSeasonSelect(season) {
                this.selectedSeason = season.name
                this.selectedSeasonId = season.id
                this.selectedLeague = ''
                this.selectedLeagueId = null
                this.opponents = []
                this.filteredOpponents = []
                this.opponentInput = ''

                const { data: leagues } = await supabase
                    .from('leagues')
                    .select('*')
                    .eq('season_id', season.id)
                    .order('name')
                this.leagues = leagues
            },
            async onLeagueSelect(league) {
                this.selectedLeague = league.name
                this.selectedLeagueId = league.id
                this.opponentInput = ''
                this.selectedOpponent = null

                const { data: opponents, error } = await supabase
                    .from('opponents')
                    .select('*')
                    .eq('league_id', league.id)
                    .order('name')

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
                    .select()
                    .single()

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
            }
        }
    }
</script>

<style scoped>
    .add-match {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 20px;
    }

    .selections {
        display: flex;
        padding: 20px 0;
        align-items: center;
        gap: 30px;
    }

    .header {
        padding-top: 25px;
        text-align: center;
        text-decoration: underline;
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
        font-size: 16px;
        cursor: pointer;
        font-family: 'Montserrat', sans-serif;
        border-radius: 4px;
    }

        .btn-confirm:hover {
            background-color: #c41830;
        }

    .btn-cancel {
        background-color: #555;
        color: white;
        border: 2px solid #000;
        padding: 10px 28px;
        font-size: 16px;
        cursor: pointer;
        font-family: 'Montserrat', sans-serif;
        border-radius: 4px;
    }

        .btn-cancel:hover {
            background-color: #444;
        }

    .modal-error {
        color: #e41e3f;
        font-size: 14px;
        margin: -10px 0 16px 0;
    }
</style>