# ADR 0002: Firestore Document Triggers vs. Cloud Pub/Sub for User Onboarding

**Status:** Accepted  
**Date:** 2026-11-18

## Context
When a new user registers in Firebase Auth and a document is created in the `users` collection, downstream asynchronous tasks must execute: generating a 10% welcome voucher, initializing user default preferences, and queueing a welcome email.

## Options Considered
1. **Client-side orchestration:** The frontend makes sequential API calls to provision each item. Fragile, exposes business logic, and breaks if the client loses network connectivity mid-flow.
2. **Cloud Pub/Sub messaging:** High throughput and decoupled, but introduces message serialization overhead, topic management, and dead-letter queue configuration complexity for a straightforward CRUD-driven workflow.
3. **Firestore Document Triggers (`@firestore_fn.on_document_created`):** Native eventing directly tied to database writes. When a user doc is created, the background function fires automatically with guaranteed at-least-once delivery.

## Decision
Use **Firestore Document Triggers** (`onboard_new_user`) to react to document writes in the `users/{userId}` collection.

## Consequences
* **Positive:** Extremely clean architecture—writing the user doc is the single source of truth that kicks off provisioning automatically without extra queuing infrastructure.
* **Negative:** Requires idempotent handler logic to safely handle potential duplicate event deliveries from Eventarc.
