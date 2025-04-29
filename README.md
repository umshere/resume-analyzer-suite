# Resume Analyzer for APM Hiring

An AI-powered resume analysis system with support for both single and bulk processing. Features a modern web interface, multiple LLM providers, and Google Workspace integration.

![Architecture Overview](ARCHITECTURE.md#system-overview)

## Features

- 🎯 **Multiple Analysis Modes**

  - Single resume playground
  - Bulk processing with progress tracking
  - Google Drive integration

- 🤖 **Flexible LLM Support**

  - Local LLM (default)
  - Google Gemini
  - OpenRouter
  - Custom endpoints

- 🎨 **Modern UI/UX**

  - Built with Next.js 14
  - shadcn/ui components
  - Real-time progress tracking
  - Responsive design

- 📊 **Rich Analysis**
  - Match scoring
  - Key skills identification
  - Experience alignment
  - Education evaluation
  - Detailed rationale

## Quick Start

1. Clone the repository:

```bash
git clone <repository-url>
cd resume-analyzer
```

2. Install dependencies:

```bash
# Backend dependencies
pip install -r requirements.txt

# Frontend dependencies
cd resume-analyzer-ui
npm install
```

3. Configure environment:

```bash
# Copy example configs
cp config.env.example config.env
cd resume-analyzer-ui
cp .env.local.example .env.local
```

4. Start the services:

```bash
# Terminal 1: Start LLM endpoint
python resume_analyzer.py

# Terminal 2: Start web UI
cd resume-analyzer-ui
npm run dev
```

5. Open http://localhost:3000 in your browser

## Usage Options

### 1. Playground Mode

- Perfect for analyzing single resumes
- Interactive feedback
- Detailed analysis view

```bash
http://localhost:3000/playground
```

### 2. Bulk Analysis

- Process multiple resumes
- Progress tracking
- Sorted results

```bash
http://localhost:3000/bulk
```

### 3. Google Integration

- Upload to Drive
- Results in Sheets
- Share analysis links

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for:

- System overview
- Component structure
- Data flow diagrams
- Integration points
- Configuration options

## LLM Configuration

### Local LLM (Default)

```env
LLM_PROVIDER=local
LLM_ENDPOINT=http://localhost:1234
```

### Google Gemini

```env
LLM_PROVIDER=gemini
LLM_API_KEY=your_gemini_api_key
```

### OpenRouter

```env
LLM_PROVIDER=openrouter
LLM_API_KEY=your_openrouter_key
LLM_MODEL=mistral-7b-instruct
```

## Google Integration

1. Create a Google Cloud Project
2. Enable required APIs:
   - Google Drive API
   - Google Sheets API
3. Create OAuth credentials
4. Configure environment:

```env
GOOGLE_DRIVE_FOLDER_ID=your_folder_id
GOOGLE_SHEETS_ID=your_sheet_id
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret
```

## Development

### Project Structure

```
resume-analyzer/
├── backend/              # Python backend
│   ├── analyzers/        # Analysis logic
│   ├── integrations/     # External services
│   └── utils/           # Helper functions
├── resume-analyzer-ui/   # Next.js frontend
│   └── src/
│       ├── app/         # Pages & API routes
│       ├── components/  # UI components
│       └── lib/        # Utilities
└── docs/               # Documentation
```

### Adding New Features

1. Backend Changes

```bash
# Create new analyzer
touch backend/analyzers/new_feature.py

# Update requirements
pip freeze > requirements.txt
```

2. Frontend Changes

```bash
# Create new component
cd resume-analyzer-ui
npx shadcn-ui@latest add new-component

# Add page
touch src/app/new-feature/page.tsx
```

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- shadcn/ui for components
- Next.js team
- OpenAI for LLM architecture guidance
