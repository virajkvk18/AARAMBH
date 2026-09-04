# Backend (AARAMBH)

- Node.js/TypeScript API, business logic, and orchestration layer.
- src/modules/ — one folder per major feature (see modules/<name>/README.md)
- src/middleware/ — request middleware (auth guards, error handling, etc.)
- src/integrations/ — external integrations (DigiLocker, payment, SMS/email, etc.)
- src/workflows/ — approval DAG orchestration engine
- src/notifications/ — notification dispatch logic
- src/config/ — backend configuration loading
- src/utils/ — shared backend utilities
- src/server/ — server bootstrap/entry point
- tests/ — backend test suite
