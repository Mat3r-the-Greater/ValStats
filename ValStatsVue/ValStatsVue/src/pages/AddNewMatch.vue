<template>
    <div class="header">
        <h1>Add New Match</h1>
    </div>
    <div class="selections">
        <nav class="season">
            <h2>Season:</h2>
            <b-dropdown :text="selectedSeason || 'Choose a Season'">
                <b-dropdown-item v-for="season in seasons"
                                 :key="season"
                                 @click="selectedSeason = season">
                    {{ season }}
                </b-dropdown-item>
            </b-dropdown>
        </nav>
        <nav class="league">
            <h2>League:</h2>
            <b-dropdown :text="selectedLeague || 'Choose a League'">
                <b-dropdown-item v-for="league in leagues"
                                 :key="league"
                                 @click="selectedLeague = league">
                    {{ league }}
                </b-dropdown-item>
            </b-dropdown>
        </nav>
        <nav class="team">
            <h2>Team:</h2>
            <b-dropdown :text="selectedTeam || 'Choose a Team'">
                <b-dropdown-item v-for="team in teams"
                                 :key="team"
                                 @click="selectedTeam = team">
                    {{ team }}
                </b-dropdown-item>
            </b-dropdown>
        </nav>
        <nav class="date">
            <h2>Date:</h2>
            <input type="date" v-model="selectedDate" />
            <!--<b-form-datepicker v-model="selectedDate"
                       :date-format-options="{ year: 'numeric', month: '2-digit', day: '2-digit' }"
                       locale="en-US" />-->
        </nav>
    </div>
</template>

<script>
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
            const seasonsResponse = await fetch('/Seasons.txt');
            const seasonsText = await seasonsResponse.text();
            this.seasons = seasonsText
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            const leaguesResponse = await fetch('/Leagues.txt');
            const leaguesText = await leaguesResponse.text();
            this.leagues = leaguesText
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);

            const teamsResponse = await fetch('/Teams.txt');
            const teamsText = await teamsResponse.text();
            this.teams = teamsText
                .split('\n')
                .map(line => line.trim())
                .filter(line => line.length > 0);
        },
        //computed: {
        //    formattedDate() {
        //        if (!this.selectedDate) return '';
        //        const [year, month, day] = this.selectedDate.split('-');
        //        return `${month}/${day}/${year}`;
        //    }
        //}

    }
</script>

<style scoped>
    .selections{
        display: flex;
        padding: 20px;
        align-items: center;
        gap: 30px;
    }
    .header{
        padding-top:25px;
        align-items:center;
        justify-content:center;
        text-align:center;
        text-decoration:underline;
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