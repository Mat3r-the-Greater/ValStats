<template>
    <div class="image-reader">
        <!-- Drop Zone -->
        <div v-if="!parsedData && !isProcessing"
             class="drop-zone"
             :class="{ 'drag-over': isDragging }"
             @dragover.prevent="isDragging = true"
             @dragleave="isDragging = false"
             @drop.prevent="handleDrop"
             tabindex="0">
            <div class="drop-zone-inner">
                <div class="drop-icon">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                    </svg>
                </div>
                <p class="drop-title">Drop or Paste Screenshot</p>
                <p class="drop-sub">Drag & drop, Ctrl+V to paste, or click to browse</p>
                <label class="browse-btn">
                    Browse File
                    <input type="file" accept="image/*" @change="handleFileInput" style="display:none" />
                </label>
            </div>
        </div>

        <!-- Processing State -->
        <div v-if="isProcessing" class="processing-state">
            <div class="spinner-ring"></div>
            <p class="processing-text">Fetching match data<span class="dots"></span></p>
        </div>

        <!-- Error -->
        <div v-if="parseError" class="parse-error">
            <span>⚠ {{ parseError }}</span>
            <button class="retry-btn" @click="reset">Try Again</button>
        </div>

        <!-- Results -->
        <div v-if="parsedData && !isProcessing" class="results-wrapper">

            <!-- Match Header -->
            <div class="match-header">
                <div class="score-block our">
                    <span class="score-num our-color">{{ parsedData.ourScore }}</span>
                    <span class="score-label">Our Team</span>
                </div>
                <div class="result-center">
                    <span class="result-badge" :class="parsedData.result.toLowerCase()">
                        {{ parsedData.result }}
                    </span>
                    <div class="map-info" v-if="parsedData.map">MAP · {{ parsedData.map }}</div>
                </div>
                <div class="score-block their">
                    <span class="score-num their-color">{{ parsedData.theirScore }}</span>
                    <span class="score-label">Opponents</span>
                </div>
            </div>

            <!-- Our Team Table -->
            <div class="team-section">
                <div class="team-label our-label">
                    <span class="dot our-dot"></span>OUR TEAM
                </div>
                <div class="table-scroll">
                    <table class="stats-table">
                        <thead>
                            <tr>
                                <th class="col-player">Player</th>
                                <th>ACS</th>
                                <th>K/D</th>
                                <th>Kills</th>
                                <th>Deaths</th>
                                <th>Assists</th>
                                <th>Econ</th>
                                <th>FB</th>
                                <th>Plants</th>
                                <th>Defuses</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(player, i) in parsedData.ourTeam" :key="'our-' + i" class="our-row">
                                <td><input class="cell-input name-input" v-model="player.name" /></td>
                                <td><input class="cell-input" type="number" v-model.number="player.acs" /></td>
                                <td class="kd-cell">{{ computedKD(player) }}</td>
                                <td><input class="cell-input" type="number" v-model.number="player.kills" /></td>
                                <td><input class="cell-input" type="number" v-model.number="player.deaths" /></td>
                                <td><input class="cell-input" type="number" v-model.number="player.assists" /></td>
                                <td><input class="cell-input" type="number" v-model.number="player.econRating" /></td>
                                <td><input class="cell-input" type="number" v-model.number="player.firstBloods" /></td>
                                <td><input class="cell-input" type="number" v-model.number="player.plants" /></td>
                                <td><input class="cell-input" type="number" v-model.number="player.defuses" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Their Team Table -->
            <div class="team-section">
                <div class="team-label their-label">
                    <span class="dot their-dot"></span>THEIR TEAM
                </div>
                <div class="table-scroll">
                    <table class="stats-table">
                        <thead>
                            <tr>
                                <th class="col-player">Player</th>
                                <th>ACS</th>
                                <th>K/D</th>
                                <th>Kills</th>
                                <th>Deaths</th>
                                <th>Assists</th>
                                <th>Econ</th>
                                <th>FB</th>
                                <th>Plants</th>
                                <th>Defuses</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="(player, i) in parsedData.theirTeam" :key="'their-' + i" class="their-row">
                                <td><input class="cell-input name-input" v-model="player.name" /></td>
                                <td><input class="cell-input" type="number" v-model.number="player.acs" /></td>
                                <td class="kd-cell">{{ computedKD(player) }}</td>
                                <td><input class="cell-input" type="number" v-model.number="player.kills" /></td>
                                <td><input class="cell-input" type="number" v-model.number="player.deaths" /></td>
                                <td><input class="cell-input" type="number" v-model.number="player.assists" /></td>
                                <td><input class="cell-input" type="number" v-model.number="player.econRating" /></td>
                                <td><input class="cell-input" type="number" v-model.number="player.firstBloods" /></td>
                                <td><input class="cell-input" type="number" v-model.number="player.plants" /></td>
                                <td><input class="cell-input" type="number" v-model.number="player.defuses" /></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <!-- Action Row -->
            <div class="action-row">
                <button class="reset-btn" @click="reset">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 .49-4.78" /></svg>
                    Re-scan
                </button>
                <button class="confirm-btn" @click="emitData">
                    Confirm & Use Data →
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, onMounted, onUnmounted } from 'vue'
    import { supabase } from '../supabase'  // your existing supabase client

    const emit = defineEmits(['match-parsed'])

    const isDragging = ref(false)
    const isProcessing = ref(false)
    const parseError = ref('')
    const parsedData = ref(null)

    // ── Global paste listener ─────────────────────────────────────────────────────
    // Attached to window so Ctrl+V works without needing to click/focus the drop zone
    function handleWindowPaste(e) {
        if (parsedData.value || isProcessing.value) return  // ignore if results already showing
        const item = [...(e.clipboardData?.items || [])].find(i => i.type.startsWith('image/'))
        if (item) {
            e.preventDefault()
            processFile(item.getAsFile())
        }
    }
    onMounted(() => window.addEventListener('paste', handleWindowPaste))
    onUnmounted(() => window.removeEventListener('paste', handleWindowPaste))

    // ── Input Handlers ────────────────────────────────────────────────────────────
    function handleDrop(e) {
        isDragging.value = false
        const file = e.dataTransfer.files[0]
        if (file && file.type.startsWith('image/')) processFile(file)
    }
    function handleFileInput(e) {
        const file = e.target.files[0]
        if (file) processFile(file)
    }

    // ── Main: Image → Edge Function → Parsed Data ─────────────────────────────────
    async function processFile(file) {
        isProcessing.value = true
        parseError.value = ''
        parsedData.value = null

        try {
            // Convert image to base64
            const base64 = await toBase64(file)
            const imageData = base64.split(',')[1]
            const mediaType = file.type

            // Call our Supabase Edge Function (key stays server-side)
            const { data, error } = await supabase.functions.invoke('parse-scoreboard', {
                body: { imageData, mediaType }
            })

            if (error) throw new Error(error.message || 'Edge function error')
            if (!data) throw new Error('No data returned from server')

            parsedData.value = data

        } catch (err) {
            console.error(err)
            parseError.value = err.message || 'Failed to parse screenshot. Please try again.'
        } finally {
            isProcessing.value = false
        }
    }

    // ── Helpers ───────────────────────────────────────────────────────────────────
    function toBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }

    function computedKD(player) {
        if (!player.deaths || player.deaths === 0) return (player.kills || 0).toFixed(2)
        return ((player.kills || 0) / player.deaths).toFixed(2)
    }

    function reset() {
        parsedData.value = null
        parseError.value = ''
        isProcessing.value = false
    }

    function emitData() {
        if (!parsedData.value) return
        const withKD = (team) => team.map(p => ({
            ...p,
            kd: computedKD(p)
        }))
        emit('match-parsed', {
            ...parsedData.value,
            ourTeam: withKD(parsedData.value.ourTeam),
            theirTeam: withKD(parsedData.value.theirTeam),
        })
    }
</script>

<style scoped>
    .image-reader {
        --clr-bg: #1a1a1a;
        --clr-surface: #222;
        --clr-border: #333;
        --clr-our: #2dd4bf;
        --clr-their: #f43f5e;
        --clr-our-row: rgba(45, 212, 191, 0.07);
        --clr-their-row: rgba(244, 63, 94, 0.07);
        --clr-red: #e53e3e;
        --clr-text: #e2e2e2;
        --clr-muted: #888;
        font-family: 'Rajdhani', 'Segoe UI', sans-serif;
        color: var(--clr-text);
    }

    .drop-zone {
        border: 2px dashed var(--clr-border);
        border-radius: 8px;
        background: var(--clr-surface);
        padding: 48px 24px;
        text-align: center;
        cursor: pointer;
        transition: border-color 0.2s, background 0.2s;
        outline: none;
    }

        .drop-zone:hover, .drop-zone:focus, .drop-zone.drag-over {
            border-color: #0B223E;
            background: rgba(11, 34, 62, 0.05);
        }

    .drop-icon {
        color: var(--clr-muted);
        margin-bottom: 16px;
    }

    .drop-title {
        font-size: 1.2rem;
        font-weight: 600;
        margin: 0 0 6px;
        letter-spacing: .05em;
        text-transform: uppercase;
    }

    .drop-sub {
        font-size: .85rem;
        color: var(--clr-muted);
        margin: 0 0 20px;
    }

    .browse-btn {
        display: inline-block;
        background: rgba(247, 189, 18, 0.85);
        color: #fff;
        padding: 8px 20px;
        border-radius: 4px;
        font-size: .85rem;
        font-weight: 600;
        letter-spacing: .08em;
        text-transform: uppercase;
        cursor: pointer;
        transition: opacity .15s;
    }

        .browse-btn:hover {
            opacity: .85;
        }

    .processing-state {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 48px;
        gap: 16px;
    }

    .spinner-ring {
        width: 44px;
        height: 44px;
        border: 3px solid var(--clr-border);
        border-top-color: rgba(247, 189, 18, 0.9);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
        to {
            transform: rotate(360deg);
        }
    }

    .processing-text {
        font-size: .95rem;
        letter-spacing: .1em;
        text-transform: uppercase;
        color: var(--clr-muted);
    }

    .dots::after {
        content: '';
        animation: dots 1.4s steps(4, end) infinite;
    }

    @keyframes dots {
        0% {
            content: '';
        }

        25% {
            content: '.';
        }

        50% {
            content: '..';
        }

        75% {
            content: '...';
        }
    }

    .parse-error {
        background: rgba(244,63,94,.1);
        border: 1px solid rgba(244,63,94,.3);
        border-radius: 6px;
        padding: 14px 18px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        font-size: .9rem;
    }

    .retry-btn {
        background: var(--clr-red);
        color: #fff;
        border: none;
        padding: 6px 14px;
        border-radius: 4px;
        cursor: pointer;
        font-size: .8rem;
        font-weight: 600;
        letter-spacing: .06em;
        white-space: nowrap;
    }

    .results-wrapper {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }

    .match-header {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 32px;
        padding: 20px 24px;
        background: var(--clr-surface);
        border-radius: 8px;
        border: 1px solid var(--clr-border);
    }

    .score-block {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 4px;
    }

    .score-num {
        font-size: 3rem;
        font-weight: 700;
        line-height: 1;
        letter-spacing: -0.02em;
    }

    .our-color {
        color: var(--clr-our);
    }

    .their-color {
        color: var(--clr-their);
    }

    .score-label {
        font-size: .7rem;
        letter-spacing: .12em;
        text-transform: uppercase;
        color: var(--clr-muted);
    }

    .result-center {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 6px;
        min-width: 120px;
    }

    .result-badge {
        font-size: 1.4rem;
        font-weight: 700;
        letter-spacing: .15em;
        text-transform: uppercase;
        padding: 4px 16px;
        border-radius: 4px;
    }

        .result-badge.victory {
            color: #fff;
            background: rgba(45,212,191,.15);
            border: 1px solid rgba(45,212,191,.3);
        }

        .result-badge.defeat {
            color: #fff;
            background: rgba(244,63,94,.15);
            border: 1px solid rgba(244,63,94,.3);
        }

    .map-info {
        font-size: .7rem;
        letter-spacing: .15em;
        color: var(--clr-muted);
        text-transform: uppercase;
    }

    .team-section {
        background: var(--clr-surface);
        border-radius: 8px;
        border: 1px solid var(--clr-border);
        overflow: hidden;
    }

    .team-label {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 10px 16px;
        font-size: .72rem;
        font-weight: 700;
        letter-spacing: .15em;
        text-transform: uppercase;
        border-bottom: 1px solid var(--clr-border);
    }

    .our-label {
        color: var(--clr-our);
    }

    .their-label {
        color: var(--clr-their);
    }

    .dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        flex-shrink: 0;
    }

    .our-dot {
        background: var(--clr-our);
    }

    .their-dot {
        background: var(--clr-their);
    }

    .table-scroll {
        overflow-x: auto;
    }

    .stats-table {
        width: 100%;
        border-collapse: collapse;
        font-size: .85rem;
    }

        .stats-table thead tr {
            background: rgba(255,255,255,.03);
        }

        .stats-table th {
            padding: 8px 10px;
            text-align: center;
            font-size: .65rem;
            font-weight: 700;
            letter-spacing: .12em;
            text-transform: uppercase;
            color: var(--clr-muted);
            white-space: nowrap;
            border-bottom: 1px solid var(--clr-border);
        }

            .stats-table th.col-player {
                text-align: left;
                min-width: 140px;
            }

    .our-row {
        background: var(--clr-our-row);
    }

    .their-row {
        background: var(--clr-their-row);
    }

    .stats-table tbody tr:hover {
        filter: brightness(1.3);
    }

    .stats-table td {
        padding: 4px 6px;
        text-align: center;
        border-bottom: 1px solid rgba(255,255,255,.04);
    }

    .stats-table tr:last-child td {
        border-bottom: none;
    }

    .cell-input {
        background: transparent;
        border: 1px solid transparent;
        border-radius: 3px;
        color: var(--clr-text);
        font-size: .85rem;
        text-align: center;
        width: 52px;
        padding: 3px 4px;
        transition: border-color .15s, background .15s;
        font-family: inherit;
    }

        .cell-input.name-input {
            text-align: left;
            width: 130px;
        }

        .cell-input:hover {
            border-color: var(--clr-border);
        }

        .cell-input:focus {
            outline: none;
            border-color: var(--clr-red);
            background: rgba(229,62,62,.08);
        }

        .cell-input[type=number]::-webkit-inner-spin-button,
        .cell-input[type=number]::-webkit-outer-spin-button {
            -webkit-appearance: none;
        }

        .cell-input[type=number] {
            -moz-appearance: textfield;
        }

    .kd-cell {
        font-weight: 600;
        color: var(--clr-muted);
        font-size: .82rem;
    }

    .action-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        padding: 4px 0;
    }

    .reset-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        background: transparent;
        border: 1px solid var(--clr-border);
        color: var(--clr-muted);
        padding: 8px 16px;
        border-radius: 4px;
        cursor: pointer;
        font-size: .8rem;
        font-weight: 600;
        letter-spacing: .08em;
        text-transform: uppercase;
        transition: border-color .15s, color .15s;
    }

        .reset-btn:hover {
            border-color: #555;
            color: var(--clr-text);
        }

    .confirm-btn {
        background: rgba(11, 34, 62, 0.5);
        color: #fff;
        border: none;
        padding: 10px 28px;
        border-radius: 4px;
        cursor: pointer;
        font-size: .9rem;
        font-weight: 700;
        letter-spacing: .08em;
        text-transform: uppercase;
        transition: opacity .15s, transform .1s;
    }

        .confirm-btn:hover {
            opacity: .88;
        }

        .confirm-btn:active {
            transform: translateY(0);
        }
</style>