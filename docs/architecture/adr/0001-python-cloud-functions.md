# ADR 0001: Python Cloud Functions (v2) for Serverless Backend Logic

**Status:** Accepted  
**Date:** 2026-11-18

## Context
Velox-Onboard requires a scalable, zero-ops backend runtime to handle user lifecycle events (provisioning, welcome vouchers, and notification queues) without managing virtual machine clusters or container orchestrators.

## Options Considered
1. **Node.js / Express on Cloud Run:** Standard and performant, but requires maintaining a separate server framework, route boilerplate, and package ecosystem.
2. **Python Flask on App Engine:** Good control, but slower cold starts and monolithic scaling compared to modern function-as-a-service runtimes.
3. **Google Cloud Functions (v2) with Python 3.10+:** Native integration with Firebase Gen 2 (Cloud Run under the hood), eventarc triggers, built-in Secret Manager support, and a clean decorator syntax (`@https_fn` and `@firestore_fn`).

## Decision
Adopt **Cloud Functions (v2) with Python** for all serverless endpoints and background triggers.

## Consequences
* **Positive:** Automatic scaling from zero to peak traffic, native integration with Firebase Emulators for local development, and simple modular code structure.
* **Negative:** Cold start latency on scale-up (mitigated by setting minimum instances if needed for production).
