# ValStats 📊

A powerful tool that automatically captures and analyzes your Valorant match statistics. ValStats takes screenshots of match results and intelligently extracts the data using OCR, storing everything in a cloud database for easy tracking and analysis.

## ✨ Features

- **Automatic Screenshot Processing** - Detects and processes screenshots of Valorant match results
- **OCR Text Recognition** - Uses Tesseract.js to accurately extract player stats and match data
- **Cloud Database Integration** - Seamlessly syncs data to Supabase for reliable storage
- **Beautiful Dashboard** - Vue 3 frontend with PrimeVue and Bootstrap Vue components
- **Real-time Analytics** - Track your stats, trends, and performance over time
- **Responsive Design** - Works on desktop and tablet devices

## 🚀 Getting Started

### Prerequisites

- **Node.js**: v20.19.0 or >=22.12.0
- **Git**: For cloning the repository
- **Supabase Account**: For database backend (free tier available)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Mat3r-the-Greater/ValStats.git
   cd ValStats
   ```

2. **Set up the frontend**
   ```bash
   cd ValStatsVue/ValStatsVue
   npm install
   ```

3. **Configure environment variables**
   - Create a `.env.local` file in `ValStatsVue/ValStatsVue/`
   - Add your Supabase credentials:
     ```
     VITE_SUPABASE_URL=your_supabase_url
     VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
     ```

### Running the Project

**Development mode with hot reload:**
```bash
npm run dev
```
The application will be available at `http://localhost:5173`

**Type checking:**
```bash
npm run type-check
```

**Build for production:**
```bash
npm run build
```

**Preview production build:**
```bash
npm run preview
```

## 📁 Project Structure

```
ValStats/
├── ValStatsVue/
│   └── ValStatsVue/
│       ├── src/                 # Vue 3 components and application logic
│       ├── public/              # Static assets
│       ├── package.json         # Frontend dependencies
│       └── vite.config.ts       # Vite configuration
├── README.md                    # This file
└── .gitignore                   # Git ignore rules
```

## 🛠️ Technology Stack

### Frontend
- **Vue 3** - Progressive JavaScript framework
- **Vite** - Next-generation frontend build tool
- **TypeScript** - Type-safe JavaScript
- **PrimeVue** - Rich UI component library
- **Bootstrap Vue 3** - Bootstrap 5 components for Vue 3
- **Tesseract.js** - Browser-based OCR for text recognition
- **Supabase JS** - Cloud database client

### Backend/Database
- **Supabase** - PostgreSQL database with real-time capabilities
- **Supabase Auth** - Built-in authentication system

## 📖 How to Use

1. **Launch the application** - Run `npm run dev`
2. **Take a screenshot** - Capture your Valorant match results screen
3. **Upload to ValStats** - Use the application to upload and process the screenshot
4. **View your stats** - The extracted data appears in your dashboard
5. **Track progress** - Monitor your stats over time with built-in analytics

## 🔧 Development

### IDE Recommendation
- **VS Code** with [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) extension
- Make sure to disable the Vetur extension to avoid conflicts

### Browser DevTools
- **Chrome/Edge**: [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd)
- **Firefox**: [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)

### Code Quality
- **Format code**: `npm run format` (uses Prettier)
- **Type checking**: `npm run type-check` (uses vue-tsc)

## 📦 Dependencies

- `@supabase/supabase-js` - Cloud database client
- `tesseract.js` - OCR engine for screenshot text extraction
- `pinia` - State management
- `bootstrap` & `bootstrap-vue-3` - UI components
- `primevue` - Advanced UI components
- `vue` - Core framework
- `vite` - Build tool

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### How to contribute:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is currently unlicensed. Please see the repository for more information.

## 🐛 Issues & Support

If you encounter any issues or have questions, please [open an issue](https://github.com/Mat3r-the-Greater/ValStats/issues) on GitHub.

## 🎮 About

Created for Valorant players who want to easily track and analyze their match performance without manual data entry. ValStats automates the process using modern web technologies and machine learning (OCR).

---

**Built with ❤️ by Mat3r-the-Greater**
