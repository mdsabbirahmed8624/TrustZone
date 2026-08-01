# TrustZone Mobile Care - Enterprise Mobile API Documentation

This documentation defines the foundation, architecture, and standards for the TrustZone Mobile Care Mobile API.

---

## 1. Architecture & Versioning

The Mobile API resides under a unified versioning schema.

- **Version 1 (Current)**: `/api/v1/mobile/...`
  - Routes are matched via the default global prefix `/api/v1` and controller routing paths.
- **Version 2 (Next)**: `/api/v2/mobile/...`
  - Routes bypass the global prefix through exclusions defined in `main.ts` to allow side-by-side execution with zero breaking changes to existing endpoints.

---

## 2. Request Headers

Every request to the Mobile API must include the following headers:

| Header | Required | Description |
| :--- | :--- | :--- |
| `Content-Type` | Yes | Must be `application/json` |
| `Authorization` | Yes (for protected routes) | JWT authorization token: `Bearer <access_token>` |
| `X-Request-ID` | No | Optional client-generated tracking ID. If omitted, the server automatically generates one. |

---

## 3. Shared Response Envelope

All Mobile API responses conform to a single, consistent JSON structure.

### Successful Response Envelope (2xx HTTP Status)
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... },
  "errors": null,
  "timestamp": "2026-07-16T05:18:29.412Z",
  "requestId": "req-178419829412-abc345"
}
```

### Error Response Envelope (4xx / 5xx HTTP Status)
```json
{
  "success": false,
  "message": "Error description message",
  "data": null,
  "errors": {
    "code": "ERROR_CODE",
    "message": "Detailed explanation of error"
  },
  "timestamp": "2026-07-16T05:18:35.801Z",
  "requestId": "req-178419829412-abc345"
}
```

---

## 4. Endpoints Reference

### 4.1 Authentication (v1)
- `POST /api/v1/mobile/auth/register` (Public)
  - Registers a new customer user profile.
- `POST /api/v1/mobile/auth/login` (Public)
  - Authenticates credentials and returns access and refresh tokens.
- `POST /api/v1/mobile/auth/verify-email` (Public)
  - Verifies registration verification OTP/token.
- `POST /api/v1/mobile/auth/refresh` (Public)
  - Rotates expired access tokens using a refresh token.
- `POST /api/v1/mobile/auth/logout` (Authenticated)
  - Blacklists tokens in Redis, revoking active sessions.

### 4.2 Customer Profiles (v1)
- `GET /api/v1/mobile/customer` (Authenticated - admin/manager)
  - Lists registered profiles with filters.
- `GET /api/v1/mobile/customer/:id` (Authenticated - admin/manager)
  - Retrieves detailed customer profiles and CRM timelines.

### 4.3 Mobile Dashboard (v1)
- `GET /api/v1/mobile/dashboard` (Authenticated - read:dashboard)
  - Fetches core metrics, active diagnostics queues, and financial stats.

### 4.4 Bookings & Tracking (v1)
- `POST /api/v1/mobile/booking` (Authenticated)
  - Schedules a diagnostic reservation.
- `GET /api/v1/mobile/tracking/:id` (Public)
  - Tracks the exact history, faults, and checklist milestones of a repair ticket.

### 4.5 Profile Management (v1)
- `GET /api/v1/mobile/profile` (Authenticated)
  - Fetches the active profile data for the logged-in session.
- `PUT /api/v1/mobile/profile` (Authenticated)
  - Modifies first and last name values.

### 4.6 Notifications Workspace (v1)
- `GET /api/v1/mobile/notifications` (Authenticated)
  - Lists in-app notifications for the user.
- `PATCH /api/v1/mobile/notifications/:id/read` (Authenticated)
  - Marks a notification as read.
- `PATCH /api/v1/mobile/notifications/all/read` (Authenticated)
  - Marks all notifications as read.
- `GET /api/v1/mobile/notifications/preferences` (Authenticated)
  - Retrieves channels toggles (in-app, SMS, email, push).
- `PUT /api/v1/mobile/notifications/preferences` (Authenticated)
  - Modifies channel notification options.

### 4.7 Device Management (v1)
- `GET /api/v1/mobile/device` (Authenticated)
  - Lists devices registered to the customer profile.
- `POST /api/v1/mobile/device` (Authenticated)
  - Registers a new device to the customer profile.

### 4.8 Authentication (v2)
- `GET /api/v2/mobile/auth/ping` (Public)
  - Version 2 sanity check endpoint.

---

## 5. Error Code Matrix

Mobile API errors are mapped cleanly to prevent internal leaks (e.g. raw SQL/Prisma details are abstracted).

| Error Code | HTTP Status | Description |
| :--- | :--- | :--- |
| `BAD_REQUEST` | 400 Bad Request | Payload validation or request parameters failure |
| `UNAUTHORIZED` | 401 Unauthorized | Missing, invalid, or expired session token |
| `FORBIDDEN` | 403 Forbidden | Authenticated user lacks permission scope for this action |
| `NOT_FOUND` | 404 Not Found | Requested entity (e.g. ticket, customer) does not exist |
| `CONFLICT` | 409 Conflict | Email registration or resource state conflict |
| `TOO_MANY_REQUESTS` | 429 Too Many Requests | Rate limit threshold exceeded |
| `INTERNAL_SERVER_ERROR` | 500 Internal Error | Unhandled server exception |
