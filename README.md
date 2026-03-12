# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Running the frontend + backend

This project now includes a simple backend server to handle user authentication and data storage. The frontend (React/Vite) talks to it via `/api/*` endpoints.

### 1) Start the backend server

```bash
cd server
npm install
npm run dev
```

The server will run on **http://localhost:4000** and seeds a few initial users:

- **Admin**: `admin@nabha.local` / `Admin@123`
- **Doctor**: `doctor@nabha.local` / `Doctor@123`
- **Patient**: `patient@nabha.local` / `Patient@123`

### 2) Start the frontend

From the project root:

```bash
npm install
npm run dev
```

Then open the app at http://localhost:5173.

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
