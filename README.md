# Resume Analyzer

A tool to analyze resumes using AI and provide structured feedback.

## Features

- PDF text extraction and analysis
- AI-powered resume evaluation against job requirements
- Local storage for analysis results
- Web UI for easy interaction
- Support for multiple LLM providers (Gemini, Local)

## Setup Instructions

### Prerequisites

1. Node.js 18+ for the UI
2. Python 3.8+ for the CLI
3. pdftotext utility for PDF processing:
   - **Windows**: Download from [Xpdf Tools](https://www.xpdfreader.com/download.html)
     - Download the Windows command-line tools
     - Extract the archive and add the bin directory to your PATH
   - **macOS**: `brew install poppler`
   - **Linux**: `sudo apt-get install poppler-utils`

### Installation

1. Clone the repository:

   ```bash
   git clone [repository-url]
   cd resume-analyzer
   ```

2. Set up the UI:

   ```bash
   cd ui
   npm install
   cp .env.example .env
   ```

3. Set up the CLI:

   ```bash
   cd cli
   pip install -r requirements.txt
   cp config.env.example config.env
   ```

4. Configure the LLM provider in `.env`:
   ```
   NEXT_PUBLIC_LLM_PROVIDER=gemini
   NEXT_PUBLIC_GEMINI_API_KEY=your-api-key
   ```

### Usage

1. Start the UI:

   ```bash
   cd ui
   npm run dev
   ```

2. Open http://localhost:3000 in your browser

3. Upload resumes and get AI-powered analysis

## TODO

### Google Integration (Work in Progress)

The Google Drive and Sheets integration is currently disabled while we improve its implementation. Future updates will include:

- [ ] Simplified OAuth2 setup process
- [ ] Better error handling
- [ ] Improved documentation
- [ ] Cross-platform testing

If you need Google integration, please check back for updates or contribute to its development.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
