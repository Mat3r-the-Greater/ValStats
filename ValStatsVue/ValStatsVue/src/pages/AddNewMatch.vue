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
                                     @click="selectedLeague = league.name">
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
    </div>
</template>

<script>
    import { supabase } from '../supabase'

    export default {
        name: 'AddNewMatch',
        data() {
            return {
                selectedSeason: '',
                seasons: [],
                selectedLeague: '',
                leagues: [],
                selectedTeam: '',
                teams: [],
                selectedDate: new Date().toISOString().split('T')[0],
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
                this.selectedLeague = ''

                const { data: leagues } = await supabase
                    .from('leagues')
                    .select('*')
                    .eq('season_id', season.id)
                    .order('name')
                this.leagues = leagues
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
        align-items: center;
        justify-content: center;
        text-align: center;
        text-decoration: underline;
    }

    .add-match {
        padding: 20px;
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
</style>