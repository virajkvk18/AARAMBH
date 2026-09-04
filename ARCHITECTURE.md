# AARAMBH Architecture

## High-level layers

```
frontend/        UI / presentation layer (React/Next.js + TypeScript)
backend/         APIs, business logic, workflow orchestration (Node.js + TypeScript)
ai/              Independently deployable AI/ML services
database/        Schema, migrations, seeds
datasets/        Reference & training data (no app code)
infrastructure/  Docker, deployment, CI/CD, monitoring, logging
tests/           Cross-layer test suites
docs/            Documentation
scripts/         Setup/ops helper scripts
config/          Environment & service configuration
```

## Feature -> folder mapping

| Feature        | Frontend                          | Backend                              | AI                        | Dataset               |
|----------------|------------------------------------|----------------------------------------|-----------------------------|--------------------------|
| Authentication | frontend/modules/auth              | backend/src/modules/auth               | -                            | -                        |
| KYA            | frontend/modules/kya               | backend/src/modules/kya                | ai/kya                       | datasets/approvals       |
| Documents      | frontend/modules/documents         | backend/src/modules/documents          | ai/document-processing       | datasets/documents       |
| Pre-validation | frontend/modules/prevalidation     | backend/src/modules/prevalidation      | ai/validation                | datasets/rules           |
| Approval DAG   | frontend/modules/approvals         | backend/src/modules/approvals          | -                            | datasets/approvals       |
| SLA            | frontend/modules/sla               | backend/src/modules/sla                | ai/sla                       | datasets/sla             |
| Subsidies      | frontend/modules/subsidies         | backend/src/modules/subsidies          | ai/subsidies                 | datasets/subsidies       |
| Officer        | frontend/modules/officer           | backend/src/modules/officer            | -                            | -                        |
| Inspections    | frontend/modules/inspections       | backend/src/modules/inspections        | ai/inspections                | -                        |
| Certificates   | frontend/modules/certificates      | backend/src/modules/certificates       | -                            | -                        |
| Audit          | frontend/modules/audit             | backend/src/modules/audit              | -                            | -                        |

## Design principles

1. **Folder = architectural responsibility.** A folder exists because it owns a real
   piece of the system, not because a future file might live there.
2. **File = something genuinely useful now.** Placeholder files are avoided; empty
   directories are preserved with `.gitkeep` instead of speculative files.
3. **Layers are fully separated.** Frontend, backend, AI, database, and datasets never
   share code — they only communicate over APIs / defined interfaces.
4. **AI is independently deployable.** The `ai/` layer talks to `backend/` over APIs,
   so it can be developed, scaled, and deployed on its own.
5. **Datasets are never mixed with application code**, so they can be versioned,
   licensed, and updated independently.
