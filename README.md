# Money Lender App

A simple, responsive loan management web application built with React + TypeScript + Vite. This project helps manage borrowers, loans, payments and administrative workflows for a small lending business.

## Key features

- Create, view and manage borrowers
- Create and track loans with terms and interest
- Record payments against loans
- Responsive UI (mobile & desktop)
- TypeScript for type-safety and maintainability

## Tech stack

- React
- TypeScript
- Vite
- CSS

## Getting started

Prerequisites

- Node.js 18+ or compatible
- npm or yarn

Clone the repository

```bash
git clone https://github.com/Nikhil-Tawale/Money-Lender-App.git
cd Money-Lender-App
```

Install dependencies

```bash
npm install
# or
# yarn
```

Run development server

```bash
npm run dev
# or
# yarn dev
```

Build for production

```bash
npm run build
# or
# yarn build
```

Preview production build locally

```bash
npm run preview
# or
# yarn preview
```

## Environment

If the app requires any runtime configuration (API base URL, keys), add a `.env` file at the project root with the required variables. Example:

```
VITE_API_BASE_URL=https://api.example.com
```

Note: Vite exposes variables prefixed with `VITE_` to the client-side bundle.

## Project structure (high level)

- src/ - application source code (components, pages, services)
- public/ - static assets
- .github/ - agent and automation configuration (agents, workflows)
- memories/ - project memory files used by project agents

## Agents & developer helpers

This repository contains a small agents framework and documentation under `.github/agents/` used to scaffold features, bug fixes, refactors, testing and documentation. See `.github/agents/README.md` for details.

## Contributing

Contributions are welcome. Typical workflow:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/my-feature`
3. Make changes and add tests
4. Open a pull request with a clear description of the change

Please follow TypeScript and linting rules where applicable.

## License

This project does not specify a license in the repository. If you want to open-source it, add a LICENSE file (MIT, Apache-2.0, etc.).

## Contact

Maintainer: Nikhil Tawale

---

_Last updated: 2026-08-02_
