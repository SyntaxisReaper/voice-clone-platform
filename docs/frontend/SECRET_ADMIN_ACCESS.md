# Admin Access Guidelines

This document describes how to enable admin-only features safely. It intentionally does not contain any credentials, backdoor triggers, or secret sequences.

## Principles
- Admin privileges are enforced on the server via authenticated roles/claims.
- No keyboard shortcuts, secret key sequences, or hardcoded credentials are used.
- Admin UI elements are feature-flagged and must never grant access by themselves.

## Backend Enforcement
- Admin identity must be verified by the backend (e.g., Firebase ID token + custom claims or an allowlist).
- Suggested env variables (set on the server, not exposed to the client):
  - ADMIN_EMAILS: comma-separated list of admin emails
  - ADMIN_UIDS: comma-separated list of Firebase UIDs

The backend should reject any admin-only request unless the authenticated user is authorized as admin.

## Frontend Feature Flags
- Use a non-sensitive boolean to show/hide admin UI affordances in development only, e.g.:
  - NEXT_PUBLIC_ADMIN_UI_ENABLED=false
- This flag should only affect presentation, not authorization.

## Access Flow
1) User signs in normally (Firebase or your auth provider).
2) Client sends bearer token to the backend.
3) Backend verifies the token and checks admin claims/allowlists.
4) Admin-only routes respond only if the user is authorized; otherwise 403.

## Operational Notes
- Rotate credentials via your secret manager and environment variables.
- Never commit secrets to the repository.
- Audit logs for admin actions should be stored server-side.

If you need help wiring the backend admin checks or claims, see backend/app/core/firebase_auth.py and the environment variables in backend/.env.example.
