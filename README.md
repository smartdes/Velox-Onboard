# Velox-Onboard: SaaS User Lifecycle Automation Platform

Velox-Onboard is a production-grade, event-driven serverless platform built to automate user provisioning, transactional communications, and promotional voucher distribution upon registration.

## Architecture Overview

    [Firebase Auth / Frontend]
           │
           ▼ (User Signup)
    [Cloud Firestore users/{userId}]
           │
           └─► @firestore_fn.on_document_created (Cloud Functions v2)
                 ├── Generates 10% Welcome Voucher (vouchers/{code})
                 ├── Initializes User Settings (settings/{userId})
                 └── Queues Transactional Welcome Email

## Quick Start (Local Emulators)

    cd infra
    docker-compose up -d

---

## Case Study Index

| Case Study | Focus Area | Key Evidence & Artifacts |
|---|---|---|
| **[01. Event-Driven Architecture](docs/case-studies/01-event-driven-architecture.md)** | Trigger design, failure handling, state consistency | [ADR 0001](docs/architecture/adr/0001-python-cloud-functions.md), [ADR 0002](docs/architecture/adr/0002-firestore-triggers-vs-pubsub.md) |
| **[02. Voucher Redemption Under Load](docs/case-studies/02-voucher-redemption-performance.md)** | Atomicity, concurrency, optimistic locking | [Load Test Before](loadtests/results/01-before-fix.md), [Load Test After](loadtests/results/02-after-fix.md), [ADR 0003](docs/architecture/adr/0003-atomic-voucher-redemption.md) |
| **[03. CI/CD & Local Development](.github/workflows/ci.yml)** | Automation, reproducibility, containerized emulators | [GitHub Actions Workflow](.github/workflows/ci.yml), [Docker Compose](infra/docker-compose.yml) |
| **[04. Observability & Runbooks](docs/runbooks/email-queue-failure.md)** | Operational monitoring, incident response | [Email Queue Runbook](docs/runbooks/email-queue-failure.md) |
| **[05. Analytics Pipeline](analytics/export_events.py)** | Data warehousing, event extraction | [Export Pipeline Script](analytics/export_events.py) |

---

## License
MIT License - Developed by Alexander Macharia.
