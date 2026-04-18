# MedGuard AI

MedGuard AI is a React + Vite healthcare companion app that helps patients manage medications, vitals, appointments, vaccinations, symptoms, and AI-powered care guidance.

## Features

- Patient portal with dashboard, medication management, vitals logging, appointments, vaccinations, and symptom tracking
- AI Advisor chat for personalized medication and wellness guidance
- Health insights and analytics overview
- Local data persistence for users, medications, and health records
- Responsive UI built with React and Vite.

## Tech Stack

- React 19
- Vite
- Vanilla CSS / inline styles
- Anthropic AI integration for the advisor chat
- Optional Python backend available in `backend/`

## Getting Started

### Frontend

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the project root and add your API key:
   ```bash
   VITE_ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open the local URL shown in the terminal to view the app.

### Build for production

```bash
npm run build
```

### Preview the production build

```bash
npm run preview
```

## Optional Backend

The repository includes a `backend/` folder for optional backend services.

To run the backend:

1. Create a Python virtual environment.
2. Install dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Start the server:
   ```bash
   uvicorn backend.main:app --reload
   ```

## Notes

- The AI Advisor requires `VITE_ANTHROPIC_API_KEY` to be present in `.env`.
- This project stores data locally in the browser for quick testing and demo use.

## License

This project is currently private and not licensed for public use.
