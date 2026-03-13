<template>
    <div class="player-view">
        <div class="header">
            <h1>Player View</h1>
        </div>

        <!-- ── Lookup Container ─────────────────────────────────────── -->
        <div class="lookup-container">

            <!-- Method Tabs -->
            <div class="method-tabs">
                <button :class="['tab-btn', { active: lookupMethod === 'team' }]" @click="switchMethod('team')">
                    Browse by Team
                </button>
                <button :class="['tab-btn', { active: lookupMethod === 'search' }]" @click="switchMethod('search')">
                    Search by Name
                </button>
            </div>

            <!-- ── Method 1: Browse by Team ─────────────────────────── -->
            <transition name="fade-slide">
                <div v-if="lookupMethod === 'team'" class="method-panel">
                    <div class="selection-row">

                        <!-- Team Type -->
                        <div class="dropdown-group">
                            <label class="dropdown-label">Team Type</label>
                            <div class="custom-select">
                                <div class="select-trigger" @click.stop="toggleDropdown('teamType')">
                                    {{ teamTypeLabel || 'Select type...' }}
                                    <span class="arrow" :class="{ open: openDropdown === 'teamType' }">&#8250;</span>
                                </div>
                                <div v-if="openDropdown === 'teamType'" class="dropdown-list">
                                    <div class="dropdown-item" @click="onTeamTypeSelect('ours')">Our Teams</div>
                                    <div class="dropdown-item" @click="onTeamTypeSelect('theirs')">Opponent Teams</div>
                                </div>
                            </div>
                        </div>

                        <!-- Team -->
                        <transition name="fade-slide">
                            <div v-if="selectedTeamType" class="dropdown-group">
                                <label class="dropdown-label">Team</label>
                                <div class="custom-select">
                                    <div class="select-trigger" @click.stop="toggleDropdown('browseTeam')">
                                        {{ selectedTeamName || 'Select team...' }}
                                        <span class="arrow" :class="{ open: openDropdown === 'browseTeam' }">&#8250;</span>
                                    </div>
                                    <div v-if="openDropdown === 'browseTeam'" class="dropdown-list">
                                        <div v-for="t in availableTeams" :key="t.id || t.name"
                                             class="dropdown-item" @click="onTeamSelect(t)">
                                            {{ t.name }}
                                        </div>
                                        <div v-if="availableTeams.length === 0" class="dropdown-empty">No teams found</div>
                                    </div>
                                </div>
                            </div>
                        </transition>

                        <!-- Player -->
                        <transition name="fade-slide">
                            <div v-if="selectedTeamName && browsePlayers.length > 0" class="dropdown-group">
                                <label class="dropdown-label">Player</label>
                                <div class="custom-select">
                                    <div class="select-trigger" @click.stop="toggleDropdown('browsePlayer')">
                                        {{ selectedPlayer?.player_name || 'Select player...' }}
                                        <span class="arrow" :class="{ open: openDropdown === 'browsePlayer' }">&#8250;</span>
                                    </div>
                                    <div v-if="openDropdown === 'browsePlayer'" class="dropdown-list">
                                        <div v-for="p in browsePlayers" :key="p.key"
                                             class="dropdown-item" @click="onPlayerSelect(p)">
                                            {{ p.player_name }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </transition>

                        <div v-if="selectedTeamName && browsePlayers.length === 0 && !loadingBrowse" class="no-players-note">
                            No player data found for this team.
                        </div>
                    </div>
                </div>
            </transition>

            <!-- ── Method 2: Search by Name ─────────────────────────── -->
            <transition name="fade-slide">
                <div v-if="lookupMethod === 'search'" class="method-panel">
                    <div class="search-row">
                        <div class="search-group">
                            <label class="dropdown-label">Player Name</label>
                            <input v-model="searchQuery"
                                   class="search-input"
                                   placeholder="Type to search..."
                                   @input="onSearchInput"
                                   autocomplete="off" />
                        </div>
                    </div>

                    <!-- Search Results -->
                    <transition name="fade">
                        <div v-if="searchResults.length > 0 && !selectedPlayer" class="search-results">
                            <div v-for="p in searchResults" :key="p.key"
                                 class="search-result-item"
                                 @click="onPlayerSelect(p)">
                                <span class="result-name">{{ p.player_name }}</span>
                                <span class="result-team-badge" :class="p.team_type === 'ours' ? 'badge-ours' : 'badge-theirs'">
                                    {{ p.team_label }}
                                </span>
                            </div>
                        </div>
                    </transition>
                    <div v-if="searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && !selectedPlayer" class="no-results">
                        No players found matching "{{ searchQuery }}"
                    </div>
                </div>
            </transition>
        </div>

        <!-- ── Selected Player Banner ───────────────────────────────── -->
        <transition name="fade">
            <div v-if="selectedPlayer" class="player-banner">
                <div class="banner-name">{{ selectedPlayer.player_name }}</div>
                <div class="banner-team" :class="selectedPlayer.team_type === 'ours' ? 'banner-ours' : 'banner-theirs'">
                    {{ selectedPlayer.team_label }}
                </div>
                <button class="clear-player-btn" @click="clearPlayer">✕ Clear</button>
            </div>
        </transition>

        <!-- ── Loading State ────────────────────────────────────────── -->
        <div v-if="loadingPlayerData" class="loading-state">
            <span class="loading-dot"></span>Loading player data...
        </div>

        <!-- ── Player Stats ─────────────────────────────────────────── -->
        <transition name="fade">
            <div v-if="selectedPlayer && playerDataLoaded && !loadingPlayerData" class="player-stats">

                <!-- ALL-TIME STATS -->
                <section class="stats-section">
                    <h2 class="section-title underline">All-Time Stats</h2>

                    <div class="summary-row">
                        <div class="stat-pill">
                            <span class="stat-label">Kills</span>
                            <span class="stat-value kill">{{ allTimeStats.kills }}</span>
                        </div>
                        <div class="stat-pill">
                            <span class="stat-label">Deaths</span>
                            <span class="stat-value death">{{ allTimeStats.deaths }}</span>
                        </div>
                        <div class="stat-pill">
                            <span class="stat-label">Assists</span>
                            <span class="stat-value">{{ allTimeStats.assists }}</span>
                        </div>
                        <div class="stat-pill">
                            <span class="stat-label">K/D</span>
                            <span class="stat-value" :class="kdClass(allTimeStats.kd)">{{ allTimeStats.kd }}</span>
                        </div>
                    </div>

                    <p class="avg-label">Average stats table:</p>
                    <div class="avg-table-wrap">
                        <table class="avg-table">
                            <thead>
                                <tr>
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
                                <tr>
                                    <td>{{ allTimeStats.avgAcs }}</td>
                                    <td class="kill">{{ allTimeStats.avgKills }}</td>
                                    <td class="death">{{ allTimeStats.avgDeaths }}</td>
                                    <td>{{ allTimeStats.avgAssists }}</td>
                                    <td :class="kdClass(allTimeStats.avgKd)">{{ allTimeStats.avgKd }}</td>
                                    <td>{{ allTimeStats.avgEcon }}</td>
                                    <td>{{ allTimeStats.avgFb }}</td>
                                    <td>{{ allTimeStats.avgPlants }}</td>
                                    <td>{{ allTimeStats.avgDefuses }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </section>

                <!-- SEASON STATS -->
                <section class="stats-section">
                    <div class="section-header-row">
                        <h2 class="section-title underline">Season Stats</h2>
                        <div class="custom-select inline-select">
                            <div class="select-trigger small-trigger" @click.stop="toggleDropdown('seasonFilter')">
                                {{ selectedSeasonFilter?.name || 'Select Season...' }}
                                <span class="arrow" :class="{ open: openDropdown === 'seasonFilter' }">&#8250;</span>
                            </div>
                            <div v-if="openDropdown === 'seasonFilter'" class="dropdown-list">
                                <div v-for="s in playerSeasons" :key="s.id"
                                     class="dropdown-item" @click="onSeasonFilterSelect(s)">
                                    {{ s.name }}
                                </div>
                                <div v-if="playerSeasons.length === 0" class="dropdown-empty">No seasons found</div>
                            </div>
                        </div>
                    </div>

                    <template v-if="selectedSeasonFilter && seasonStats">
                        <div class="summary-row">
                            <div class="stat-pill">
                                <span class="stat-label">Kills</span>
                                <span class="stat-value kill">{{ seasonStats.kills }}</span>
                            </div>
                            <div class="stat-pill">
                                <span class="stat-label">Deaths</span>
                                <span class="stat-value death">{{ seasonStats.deaths }}</span>
                            </div>
                            <div class="stat-pill">
                                <span class="stat-label">Assists</span>
                                <span class="stat-value">{{ seasonStats.assists }}</span>
                            </div>
                            <div class="stat-pill">
                                <span class="stat-label">K/D</span>
                                <span class="stat-value" :class="kdClass(seasonStats.kd)">{{ seasonStats.kd }}</span>
                            </div>
                        </div>

                        <p class="avg-label">Average stats table:</p>
                        <div class="avg-table-wrap">
                            <table class="avg-table">
                                <thead>
                                    <tr>
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
                                    <tr>
                                        <td>{{ seasonStats.avgAcs }}</td>
                                        <td class="kill">{{ seasonStats.avgKills }}</td>
                                        <td class="death">{{ seasonStats.avgDeaths }}</td>
                                        <td>{{ seasonStats.avgAssists }}</td>
                                        <td :class="kdClass(seasonStats.avgKd)">{{ seasonStats.avgKd }}</td>
                                        <td>{{ seasonStats.avgEcon }}</td>
                                        <td>{{ seasonStats.avgFb }}</td>
                                        <td>{{ seasonStats.avgPlants }}</td>
                                        <td>{{ seasonStats.avgDefuses }}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </template>
                    <div v-else-if="!selectedSeasonFilter" class="placeholder-text">
                        Select a season above to view season stats.
                    </div>
                    <div v-else-if="seasonStats && seasonStats.kills === 0" class="placeholder-text">
                        No match data for this season.
                    </div>
                </section>

                <!-- MATCH STATS -->
                <section class="stats-section">
                    <h2 class="section-title underline">Match Stats</h2>

                    <div v-if="sortedMatches.length === 0" class="placeholder-text">No matches found for this player.</div>

                    <table v-else class="match-table">
                        <thead>
                            <tr>
                                <th></th>
                                <th>Date</th>
                                <th>{{ selectedPlayer.team_type === 'ours' ? 'Opponent' : 'Our Team' }}</th>
                                <th>Result</th>
                                <th>Score</th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-for="m in sortedMatches" :key="m.match_id">
                                <tr class="match-row" @click="toggleMatch(m.match_id)">
                                    <td class="chevron-cell">
                                        <span class="chevron" :class="{ open: expandedMatchId === m.match_id }">&#8250;</span>
                                    </td>
                                    <td>{{ formatDate(m.date) }}</td>
                                    <td>{{ selectedPlayer.team_type === 'ours' ? (m.opponent_name || '—') : (m.our_team_name || '—') }}</td>
                                    <td>
                                        <span class="result-pill" :class="m.result?.toLowerCase()">
                                            {{ m.result || '—' }}
                                        </span>
                                    </td>
                                    <td class="score">{{ m.our_score }} – {{ m.their_score }}</td>
                                </tr>

                                <!-- Expanded player row -->
                                <tr v-if="expandedMatchId === m.match_id" class="stats-row">
                                    <td colspan="5" class="stats-cell">
                                        <div class="player-match-detail">
                                            <table class="stats-table">
                                                <thead>
                                                    <tr>
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
                                                    <tr>
                                                        <td>{{ m.acs ?? '—' }}</td>
                                                        <td class="kill">{{ m.kills ?? '—' }}</td>
                                                        <td class="death">{{ m.deaths ?? '—' }}</td>
                                                        <td>{{ m.assists ?? '—' }}</td>
                                                        <td :class="kdClass(m.kd)">{{ m.kd ?? '—' }}</td>
                                                        <td>{{ m.econ_rating ?? '—' }}</td>
                                                        <td>{{ m.first_bloods ?? '—' }}</td>
                                                        <td>{{ m.plants ?? '—' }}</td>
                                                        <td>{{ m.defuses ?? '—' }}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </tbody>
                    </table>
                </section>

            </div>
        </transition>
    </div>
</template>

<script>
    import { supabase } from '../supabase'

    export default {
        name: 'PlayerView',

        data() {
            return {
                lookupMethod: 'team',
                openDropdown: null,

                // Method 1 state
                selectedTeamType: null,
                availableTeams: [],
                selectedTeamName: null,
                selectedTeamObj: null,
                browsePlayers: [],
                loadingBrowse: false,

                // Method 2 state
                searchQuery: '',
                searchResults: [],
                searchLoading: false,
                searchDebounce: null,

                // Selected player identity
                selectedPlayer: null, // { player_name, team_type, team_label, key }

                // Player data
                playerMatches: [],
                loadingPlayerData: false,
                playerDataLoaded: false,

                // Season filter
                playerSeasons: [],
                selectedSeasonFilter: null,

                // Match expansion
                expandedMatchId: null,
            }
        },

        computed: {
            teamTypeLabel() {
                if (this.selectedTeamType === 'ours') return 'Our Teams'
                if (this.selectedTeamType === 'theirs') return 'Opponent Teams'
                return null
            },

            allTimeStats() {
                return this.computeStats(this.playerMatches)
            },

            seasonStats() {
                if (!this.selectedSeasonFilter) return null
                const filtered = this.playerMatches.filter(
                    m => m.season_id === this.selectedSeasonFilter.id
                )
                return this.computeStats(filtered)
            },

            sortedMatches() {
                return [...this.playerMatches].sort(
                    (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
                )
            }
        },

        methods: {
            // ── Navigation ───────────────────────────────────────────────
            switchMethod(method) {
                this.lookupMethod = method
                this.clearPlayer()
                this.searchQuery = ''
                this.searchResults = []
            },

            toggleDropdown(name) {
                this.openDropdown = this.openDropdown === name ? null : name
            },

            handleOutsideClick(e) {
                if (!e.target.closest('.custom-select') && !e.target.closest('.select-trigger')) {
                    this.openDropdown = null
                }
            },

            // ── Method 1: Team Browse ────────────────────────────────────
            async onTeamTypeSelect(type) {
                this.selectedTeamType = type
                this.openDropdown = null
                this.selectedTeamName = null
                this.selectedTeamObj = null
                this.browsePlayers = []
                this.clearPlayer()

                if (type === 'ours') {
                    const { data } = await supabase
                        .from('matches')
                        .select('our_team_name')
                    const unique = [...new Set((data || []).map(m => m.our_team_name).filter(Boolean))].sort()
                    this.availableTeams = unique.map(name => ({ name }))
                } else {
                    const { data } = await supabase
                        .from('matches')
                        .select('opponent_id, opponents(id, name)')
                        .not('opponent_id', 'is', null)
                    const seen = new Set()
                    this.availableTeams = (data || [])
                        .map(m => m.opponents)
                        .filter(o => o && !seen.has(o.id) && seen.add(o.id))
                        .sort((a, b) => a.name.localeCompare(b.name))
                }
            },

            async onTeamSelect(team) {
                this.selectedTeamName = team.name
                this.selectedTeamObj = team
                this.openDropdown = null
                this.browsePlayers = []
                this.clearPlayer()
                this.loadingBrowse = true

                let matchIds = []

                if (this.selectedTeamType === 'ours') {
                    const { data } = await supabase
                        .from('matches')
                        .select('id')
                        .eq('our_team_name', team.name)
                    matchIds = (data || []).map(m => m.id)
                } else {
                    const { data } = await supabase
                        .from('matches')
                        .select('id')
                        .eq('opponent_id', team.id)
                    matchIds = (data || []).map(m => m.id)
                }

                if (matchIds.length > 0) {
                    const teamFilter = this.selectedTeamType === 'ours' ? 'ours' : 'theirs'
                    const { data } = await supabase
                        .from('match_players')
                        .select('player_name')
                        .eq('team', teamFilter)
                        .in('match_id', matchIds)

                    const unique = [...new Set((data || []).map(p => p.player_name).filter(Boolean))].sort()
                    this.browsePlayers = unique.map(name => ({
                        player_name: name,
                        team_type: teamFilter,
                        team_label: team.name,
                        key: `${teamFilter}_${name}_${team.id || team.name}`
                    }))
                }

                this.loadingBrowse = false
            },

            // ── Method 2: Search ─────────────────────────────────────────
            onSearchInput() {
                clearTimeout(this.searchDebounce)
                this.selectedPlayer = null
                this.playerDataLoaded = false

                if (this.searchQuery.length < 2) {
                    this.searchResults = []
                    return
                }

                this.searchLoading = true
                this.searchDebounce = setTimeout(async () => {
                    const { data } = await supabase
                        .from('match_players')
                        .select('player_name, team, matches(our_team_name, opponents(name))')
                        .ilike('player_name', `%${this.searchQuery}%`)

                    const playerMap = new Map()

                    for (const r of (data || [])) {
                        if (r.team === 'ours') {
                            const key = `ours_${r.player_name}`
                            if (!playerMap.has(key)) {
                                playerMap.set(key, {
                                    player_name: r.player_name,
                                    team_type: 'ours',
                                    team_label: r.matches?.our_team_name || 'Our Team',
                                    key
                                })
                            }
                        } else {
                            const oppName = r.matches?.opponents?.name || 'Opponent'
                            const key = `theirs_${r.player_name}`
                            if (!playerMap.has(key)) {
                                playerMap.set(key, {
                                    player_name: r.player_name,
                                    team_type: 'theirs',
                                    team_label: oppName,
                                    key
                                })
                            }
                        }
                    }

                    this.searchResults = [...playerMap.values()]
                        .sort((a, b) => a.player_name.localeCompare(b.player_name))
                    this.searchLoading = false
                }, 300)
            },

            // ── Player Selection ─────────────────────────────────────────
            async onPlayerSelect(player) {
                this.selectedPlayer = player
                this.openDropdown = null
                this.searchResults = []
                this.expandedMatchId = null
                this.playerDataLoaded = false
                this.loadingPlayerData = true
                this.playerMatches = []
                this.playerSeasons = []
                this.selectedSeasonFilter = null

                const { data, error } = await supabase
                    .from('match_players')
                    .select(`
                        *,
                        matches(
                            id, date, season_id, result,
                            our_score, their_score, our_team_name,
                            opponent_id,
                            opponents(name),
                            seasons(id, name)
                        )
                    `)
                    .eq('player_name', player.player_name)
                    .eq('team', player.team_type)

                if (error) {
                    console.error('Error loading player data:', error)
                }

                this.playerMatches = (data || []).map(r => ({
                    ...r,
                    match_id: r.match_id,
                    date: r.matches?.date,
                    result: r.matches?.result,
                    our_score: r.matches?.our_score,
                    their_score: r.matches?.their_score,
                    our_team_name: r.matches?.our_team_name,
                    opponent_name: r.matches?.opponents?.name,
                    season_id: r.matches?.season_id,
                    season_name: r.matches?.seasons?.name,
                }))

                // Build unique seasons list
                const seasonMap = new Map()
                for (const m of this.playerMatches) {
                    if (m.season_id && !seasonMap.has(m.season_id)) {
                        seasonMap.set(m.season_id, {
                            id: m.season_id,
                            name: m.season_name || String(m.season_id)
                        })
                    }
                }
                this.playerSeasons = [...seasonMap.values()]
                    .sort((a, b) => a.name.localeCompare(b.name))

                // Default to latest season
                if (this.playerSeasons.length > 0) {
                    this.selectedSeasonFilter = this.playerSeasons[this.playerSeasons.length - 1]
                }

                this.loadingPlayerData = false
                this.playerDataLoaded = true
            },

            clearPlayer() {
                this.selectedPlayer = null
                this.playerDataLoaded = false
                this.playerMatches = []
                this.playerSeasons = []
                this.selectedSeasonFilter = null
                this.expandedMatchId = null
            },

            onSeasonFilterSelect(season) {
                this.selectedSeasonFilter = season
                this.openDropdown = null
            },

            // ── Stats Computation ────────────────────────────────────────
            computeStats(records) {
                const empty = {
                    kills: 0, deaths: 0, assists: 0, kd: '—',
                    avgAcs: '—', avgKills: '—', avgDeaths: '—', avgAssists: '—',
                    avgKd: '—', avgEcon: '—', avgFb: '—', avgPlants: '—', avgDefuses: '—'
                }
                if (!records || records.length === 0) return empty

                const totalKills   = records.reduce((s, r) => s + (r.kills   || 0), 0)
                const totalDeaths  = records.reduce((s, r) => s + (r.deaths  || 0), 0)
                const totalAssists = records.reduce((s, r) => s + (r.assists || 0), 0)

                const avg = (key) => {
                    const vals = records.map(r => r[key]).filter(v => v != null && !isNaN(v))
                    if (!vals.length) return '—'
                    return (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(1)
                }

                return {
                    kills: totalKills,
                    deaths: totalDeaths,
                    assists: totalAssists,
                    kd: totalDeaths === 0
                        ? totalKills.toFixed(2)
                        : (totalKills / totalDeaths).toFixed(2),
                    avgAcs:     avg('acs'),
                    avgKills:   avg('kills'),
                    avgDeaths:  avg('deaths'),
                    avgAssists: avg('assists'),
                    avgKd:      avg('kd'),
                    avgEcon:    avg('econ_rating'),
                    avgFb:      avg('first_bloods'),
                    avgPlants:  avg('plants'),
                    avgDefuses: avg('defuses'),
                }
            },

            kdClass(kd) {
                if (kd === '—' || kd == null) return ''
                return parseFloat(kd) >= 1.0 ? 'kd-positive' : 'kd-negative'
            },

            toggleMatch(matchId) {
                this.expandedMatchId = this.expandedMatchId === matchId ? null : matchId
            },

            formatDate(dateStr) {
                if (!dateStr) return '—'
                const d = new Date(dateStr + 'T00:00:00')
                return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
            }
        },

        mounted() {
            document.addEventListener('click', this.handleOutsideClick)
        },

        beforeUnmount() {
            document.removeEventListener('click', this.handleOutsideClick)
            clearTimeout(this.searchDebounce)
        }
    }
</script>

<style scoped>
    /* ── Layout ────────────────────────────────────────────────── */
    .player-view {
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

    /* ── Lookup Container ──────────────────────────────────────── */
    .lookup-container {
        background-color: #1e1e1e;
        border: 1px solid #333;
        border-radius: 8px;
        padding: 24px;
        margin-top: 24px;
    }

    /* ── Method Tabs ───────────────────────────────────────────── */
    .method-tabs {
        display: flex;
        gap: 0;
        margin-bottom: 24px;
        border-bottom: 2px solid #333;
    }

    .tab-btn {
        background: none;
        border: none;
        color: #666;
        font-family: 'Montserrat', sans-serif;
        font-size: 13px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 10px 20px;
        cursor: pointer;
        border-bottom: 2px solid transparent;
        margin-bottom: -2px;
        transition: color 0.15s, border-color 0.15s;
    }

        .tab-btn.active {
            color: rgba(247, 189, 18, 0.92);
        }

        .tab-btn:hover:not(.active) {
            color: #aaa;
        }

    /* ── Method Panel ──────────────────────────────────────────── */
    .method-panel {
        min-height: 80px;
    }

    .selection-row {
        display: flex;
        align-items: flex-end;
        gap: 20px;
        flex-wrap: wrap;
    }

    /* ── Dropdown ──────────────────────────────────────────────── */
    .dropdown-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        min-width: 180px;
    }

    .dropdown-label {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        color: #888;
        font-family: 'Montserrat', sans-serif;
    }

    .custom-select {
        position: relative;
    }

    .select-trigger {
        background-color: #2a2a2a;
        border: 1px solid #444;
        color: #ccc;
        padding: 10px 14px;
        font-size: 14px;
        font-family: 'Montserrat', sans-serif;
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
        min-width: 180px;
        transition: border-color 0.15s;
        user-select: none;
    }

        .select-trigger:hover {
            border-color: #666;
        }

    .small-trigger {
        font-size: 13px;
        padding: 7px 12px;
        min-width: 160px;
    }

    .arrow {
        display: inline-block;
        transition: transform 0.2s;
        font-size: 16px;
        color: #666;
    }

        .arrow.open {
            transform: rotate(90deg);
        }

    .dropdown-list {
        position: absolute;
        top: calc(100% + 4px);
        left: 0;
        min-width: 100%;
        background-color: #222;
        border: 1px solid #444;
        z-index: 100;
        max-height: 260px;
        overflow-y: auto;
        box-shadow: 0 4px 16px rgba(0,0,0,0.4);
    }

    .dropdown-item {
        padding: 10px 14px;
        font-size: 14px;
        font-family: 'Montserrat', sans-serif;
        color: #ccc;
        cursor: pointer;
        transition: background-color 0.1s;
    }

        .dropdown-item:hover {
            background-color: #333;
            color: #fff;
        }

    .dropdown-empty {
        padding: 10px 14px;
        font-size: 13px;
        color: #555;
        font-style: italic;
        font-family: 'Montserrat', sans-serif;
    }

    .inline-select {
        display: inline-block;
    }

    /* ── Search ────────────────────────────────────────────────── */
    .search-row {
        display: flex;
        gap: 16px;
        align-items: flex-end;
    }

    .search-group {
        display: flex;
        flex-direction: column;
        gap: 6px;
        flex: 1;
        max-width: 400px;
    }

    .search-input {
        background-color: #2a2a2a;
        border: 1px solid #444;
        color: #ccc;
        padding: 10px 14px;
        font-size: 14px;
        font-family: 'Montserrat', sans-serif;
        width: 100%;
        box-sizing: border-box;
        outline: none;
        transition: border-color 0.15s;
    }

        .search-input:focus {
            border-color: rgba(247, 189, 18, 0.92);
        }

        .search-input::placeholder {
            color: #555;
        }

    .search-results {
        margin-top: 12px;
        border: 1px solid #333;
        overflow: hidden;
    }

    .search-result-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 16px;
        cursor: pointer;
        border-bottom: 1px solid #2a2a2a;
        transition: background-color 0.1s;
    }

        .search-result-item:last-child {
            border-bottom: none;
        }

        .search-result-item:hover {
            background-color: #2a2a2a;
        }

    .result-name {
        font-size: 14px;
        font-weight: 600;
        color: white;
        font-family: 'Montserrat', sans-serif;
    }

    .result-team-badge {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        padding: 3px 8px;
        font-family: 'Montserrat', sans-serif;
    }

    .badge-ours {
        background-color: rgba(34, 197, 94, 0.15);
        color: #22c55e;
        border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .badge-theirs {
        background-color: rgba(228, 30, 63, 0.1);
        color: rgba(229,62,62,.92);
        border: 1px solid rgba(228, 30, 63, 0.25);
    }

    .no-results {
        margin-top: 12px;
        color: #555;
        font-size: 13px;
        font-style: italic;
        font-family: 'Montserrat', sans-serif;
    }

    .no-players-note {
        color: #555;
        font-size: 13px;
        font-style: italic;
        font-family: 'Montserrat', sans-serif;
        padding-bottom: 4px;
    }

    /* ── Player Banner ─────────────────────────────────────────── */
    .player-banner {
        margin-top: 20px;
        background-color: #1e1e1e;
        border: 1px solid #333;
        border-left: 3px solid rgba(229,62,62,.9);
        padding: 14px 20px;
        display: flex;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
    }

    .banner-name {
        font-size: 20px;
        font-weight: 700;
        font-family: 'Montserrat', sans-serif;
        color: white;
    }

    .banner-team {
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        padding: 3px 10px;
        font-family: 'Montserrat', sans-serif;
    }

    .banner-ours {
        background-color: rgba(34, 197, 94, 0.15);
        color: #22c55e;
        border: 1px solid rgba(34, 197, 94, 0.3);
    }

    .banner-theirs {
        background-color: rgba(228, 30, 63, 0.1);
        color: rgba(229,62,62,.9);
        border: 1px solid rgba(229,62,62,.9);
    }

    .clear-player-btn {
        margin-left: auto;
        background: none;
        border: 1px solid #444;
        color: #888;
        font-family: 'Montserrat', sans-serif;
        font-size: 12px;
        font-weight: 600;
        padding: 6px 12px;
        cursor: pointer;
        transition: color 0.15s, border-color 0.15s;
    }

        .clear-player-btn:hover {
            color: #ccc;
            border-color: #666;
        }

    /* ── Loading ───────────────────────────────────────────────── */
    .loading-state {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #888;
        font-size: 14px;
        font-family: 'Montserrat', sans-serif;
        padding: 32px 0;
        justify-content: center;
    }

    .loading-dot {
        width: 8px;
        height: 8px;
        background-color: rgba(247, 189, 18, 0.92);
        border-radius: 50%;
        animation: pulse 1s infinite;
    }

    @keyframes pulse {
        0%, 100% {
            opacity: 1;
        }

        50% {
            opacity: 0.3;
        }
    }

    /* ── Stats Sections ────────────────────────────────────────── */
    .player-stats {
        margin-top: 28px;
        display: flex;
        flex-direction: column;
        gap: 28px;
    }

    .stats-section {
        background-color: #1e1e1e;
        border: 1px solid #333;
        border-radius: 6px;
        padding: 20px 24px;
    }

    .section-title {
        font-size: 18px;
        font-weight: 700;
        font-family: 'Montserrat', sans-serif;
        margin: 0 0 16px;
    }

        .section-title.underline {
            text-decoration: underline;
        }

    .section-header-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 16px;
        margin-bottom: 16px;
        flex-wrap: wrap;
    }

        .section-header-row .section-title {
            margin-bottom: 0;
        }

    /* ── Summary Pills ─────────────────────────────────────────── */
    .summary-row {
        display: flex;
        gap: 16px;
        flex-wrap: wrap;
        margin-bottom: 16px;
    }

    .stat-pill {
        background-color: #252525;
        border: 1px solid #333;
        padding: 12px 20px;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
        min-width: 90px;
    }

    .stat-label {
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        color: #666;
        font-family: 'Montserrat', sans-serif;
    }

    .stat-value {
        font-size: 22px;
        font-weight: 700;
        font-family: 'Montserrat', sans-serif;
        color: #ccc;
    }

    /* ── Avg Table ─────────────────────────────────────────────── */
    .avg-label {
        font-size: 12px;
        font-weight: 600;
        color: #888;
        font-family: 'Montserrat', sans-serif;
        margin: 0 0 8px;
        text-transform: uppercase;
        letter-spacing: 0.05em;
    }

    .avg-table-wrap {
        overflow-x: auto;
        border: 1px solid #333;
        border-radius: 4px;
    }

    .avg-table {
        width: 100%;
        border-collapse: collapse;
        font-family: 'Montserrat', sans-serif;
        font-size: 13px;
    }

        .avg-table thead th {
            background-color: #1a1a1a;
            color: #777;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 9px 14px;
            text-align: left;
            border-bottom: 1px solid #333;
        }

        .avg-table tbody tr {
            background-color: #252525;
        }

        .avg-table td {
            padding: 11px 14px;
            color: #ccc;
        }

    /* ── Match Table ───────────────────────────────────────────── */
    .match-table {
        width: 100%;
        border-collapse: collapse;
        font-family: 'Montserrat', sans-serif;
        font-size: 14px;
    }

        .match-table thead th {
            background-color: #161616;
            color: #666;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 10px 14px;
            text-align: left;
            border-bottom: 2px solid #333;
        }

    .match-row {
        border-bottom: 1px solid #2a2a2a;
        cursor: pointer;
        transition: background-color 0.1s;
    }

        .match-row:hover {
            background-color: #252525;
        }

        .match-row td {
            padding: 12px 14px;
            color: #ccc;
        }

    .chevron-cell {
        width: 30px;
    }

    .chevron {
        display: inline-block;
        transition: transform 0.2s;
        font-size: 18px;
        color: #555;
        user-select: none;
    }

        .chevron.open {
            transform: rotate(90deg);
            color: rgba(247, 189, 18, 0.92);
        }

    .result-pill {
        display: inline-block;
        padding: 3px 10px;
        font-size: 11px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.06em;
        border-radius: 3px;
    }

        .result-pill.victory {
            background-color: rgba(34, 197, 94, 0.15);
            color: #22c55e;
        }

        .result-pill.defeat {
            background-color: rgba(228, 30, 63, 0.12);
            color: rgba(229,62,62,1);
        }

        .result-pill.draw {
            background-color: rgba(150, 150, 150, 0.15);
            color: #aaa;
        }

    .score {
        font-weight: 700;
        font-family: 'Montserrat', sans-serif;
        color: #ccc;
    }

    /* Expanded row */
    .stats-row td {
        padding: 0;
    }

    .stats-cell {
        padding: 0 !important;
        background-color: #1a1a1a;
    }

    .player-match-detail {
        padding: 12px 16px;
    }

    /* Reusable stats table inside expansion */
    .stats-table {
        width: 100%;
        border-collapse: collapse;
        font-family: 'Montserrat', sans-serif;
        font-size: 13px;
    }

        .stats-table thead th {
            background-color: #111;
            color: #777;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #333;
        }

        .stats-table tbody tr:hover {
            background-color: #222;
        }

        .stats-table td {
            padding: 9px 12px;
            color: #ccc;
        }

    /* ── Shared color classes ──────────────────────────────────── */
    .kill {
        color: #22c55e !important;
        font-weight: 600;
    }

    .death {
        color: rgba(229,62,62,.9) !important;
        font-weight: 600;
    }

    .kd-positive {
        color: #22c55e !important;
        font-weight: 700;
    }

    .kd-negative {
        color: rgba(229,62,62,.9) !important;
        font-weight: 700;
    }

    .placeholder-text {
        color: #555;
        font-style: italic;
        font-size: 14px;
        font-family: 'Montserrat', sans-serif;
        padding: 8px 0;
    }

    /* ── Transitions ───────────────────────────────────────────── */
    .fade-slide-enter-active, .fade-slide-leave-active {
        transition: opacity 0.2s ease, transform 0.2s ease;
    }

    .fade-slide-enter-from, .fade-slide-leave-to {
        opacity: 0;
        transform: translateX(-6px);
    }

    .fade-enter-active, .fade-leave-active {
        transition: opacity 0.25s ease;
    }

    .fade-enter-from, .fade-leave-to {
        opacity: 0;
    }
</style>