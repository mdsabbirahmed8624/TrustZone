# REST API Specification & Reference Documentation
## TrustZone Mobile Care — Platform API Gateway

---

## 1. Global API Standards

All endpoints are versioned and expose structured JSON data.

*   **Production Base URL:** `https://api.trustzone.care/api/v1`
*   **Sandbox Base URL:** `https://sandbox.api.trustzone.care/api/v1`
*   **Default Headers:**
    *   `Content-Type: application/json`
    *   `Accept: application/json`

### 1.1 Standard Response Envelopes

#### Success Envelope (Paginated)
```json
{
  "success": true,
  "data": [],
  "meta": {
    "page": 1,
    "limit": 20,
    "totalCount": 142,
    "totalPages": 8
  }
}
```

#### Error Envelope (Validation Failures)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_FAILED",
    "message": "One or more request parameters failed validation checks.",
    "details": [
      {
        "field": "email",
        "issue": "must be a valid email address"
      },
      {
        "field": "imei",
        "issue": "must match format regex check"
      }
    ]
  }
}
```

---

## 2. API Endpoint Directory

### 2.1 Authentication Module (`/auth`)

#### `POST /auth/login`
Authenticates a user, issues a short-lived access token, and sets a secure http-only refresh cookie.
*   **Auth Required:** None (Public)
*   **Request Body:**
    ```json
    {
      "email": "alex.smith@email.com",
      "password": "SecretPassword123!"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expiresIn": 900,
        "user": {
          "id": "usr-882199ab-b12a",
          "firstName": "Alex",
          "lastName": "Smith",
          "email": "alex.smith@email.com",
          "role": "customer"
        }
      }
    }
    ```
*   **Common Errors:** `401 Invalid Credentials`, `429 Too Many Requests`.

#### `POST /auth/refresh`
Refreshes an active access token using the HTTP-only refresh cookie.
*   **Auth Required:** None (Reads Cookie)
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "accessToken": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
        "expiresIn": 900
      }
    }
    ```

#### `POST /auth/logout`
Revokes active session tokens and invalidates refresh cookies.
*   **Auth Required:** Bearer Access Token
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "message": "Session invalidated successfully."
    }
    ```

---

### 2.2 Customer & Profile Module (`/customers`)

#### `GET /customers/profile`
Retrieves details of the authenticated customer.
*   **Auth Required:** Bearer Access Token (Customer scope)
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": "cust-99881a2b",
        "firstName": "Alex",
        "lastName": "Smith",
        "phone": "+1 555-0199",
        "loyaltyPoints": 340,
        "address": "123 Maple Street, Apt 4B, New York, NY 10001"
      }
    }
    ```

---

### 2.3 Ticket & Booking Module (`/tickets`)

#### `POST /tickets/book`
Submits a new repair booking request. Creates a customer account automatically if the email is unregistered.
*   **Auth Required:** None (Public)
*   **Request Body:**
    ```json
    {
      "device": {
        "brand": "Apple",
        "model": "iPhone 14 Pro",
        "imei": "359210001112223"
      },
      "symptoms": "Cracked OLED display, touchscreen dead",
      "branchId": "br-DowntownShop",
      "logistics": "walk_in",
      "scheduledTime": "2026-07-09T14:30:00Z",
      "contact": {
        "firstName": "Alex",
        "lastName": "Smith",
        "email": "alex.smith@email.com",
        "phone": "+1 555-0199"
      }
    }
    ```
*   **Response (210 Created):**
    ```json
    {
      "success": true,
      "data": {
        "ticketId": "tk-9921",
        "trackingUrl": "https://portal.trustzone.care/track/tk-9921",
        "status": "booked",
        "estimateCost": 170.00
      }
    }
    ```

#### `GET /tickets/:id`
Retrieves the real-time progress history of a ticket.
*   **Auth Required:** Bearer Access Token (Customer, Tech, or Admin owner)
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "id": "tk-9921",
        "status": "diagnosing",
        "assignedTech": "Marcus Bench #3",
        "history": [
          { "status": "booked", "timestamp": "2026-07-08T11:30:00Z" },
          { "status": "checked_in", "timestamp": "2026-07-08T13:15:00Z" }
        ],
        "evidencePhotos": [
          "https://cdn.trustzone.care/tickets/tk-9921/pre_damage_1.webp"
        ]
      }
    }
    ```

#### `PATCH /tickets/:id/status`
Updates ticket statuses and checklist checks.
*   **Auth Required:** Bearer Access Token (Technician or Admin scope)
*   **Request Body:**
    ```json
    {
      "status": "repairing",
      "diagnosticNotes": "OLED screen replacement and frame normalization complete.",
      "qaChecks": {
        "touchScreenGrid": true,
        "dualBandWifi": true,
        "chargeRateChecked": true
      }
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "ticketId": "tk-9921",
        "status": "repairing",
        "updatedAt": "2026-07-08T15:30:00Z"
      }
    }
    ```

---

### 2.4 Inventory Module (`/inventory`)

#### `POST /inventory/parts/allocate`
Allocates a replacement part from a branch's local inventory to an active ticket.
*   **Auth Required:** Bearer Access Token (Technician or Admin scope)
*   **Request Body:**
    ```json
    {
      "ticketId": "tk-9921",
      "partSku": "AP-OLED14",
      "quantity": 1
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "sku": "AP-OLED14",
        "allocatedQuantity": 1,
        "remainingBranchStock": 11
      }
    }
    ```

---

### 2.5 Billing & Payments Module (`/billing`)

#### `POST /billing/payments/charge`
Processes credit card payments for invoices via Stripe.
*   **Auth Required:** Bearer Access Token (Customer or Admin scope)
*   **Request Body:**
    ```json
    {
      "invoiceId": "inv-9901",
      "stripeToken": "tok_1M82hH2eZvKYlo2C",
      "paymentMethod": "stripe"
    }
    ```
*   **Response (200 OK):**
    ```json
    {
      "success": true,
      "data": {
        "transactionId": "txn_882991001",
        "status": "succeeded",
        "amountPaid": 170.00,
        "invoiceStatus": "paid"
      }
    }
    ```

---

### 2.6 Support Module (`/support`)

#### `POST /support/tickets`
Creates a support ticket in the customer helpdesk.
*   **Auth Required:** Bearer Access Token (Customer scope)
*   **Request Body:**
    ```json
    {
      "category": "shipping",
      "subject": "Missing Mail-In Box Package",
      "message": "My mail-in shipping label arrived, but the physical packaging box has not arrived."
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "data": {
        "supportTicketId": "sup-1022",
        "status": "open",
        "createdAt": "2026-07-08T16:00:00Z"
      }
    }
    ```

---

### 2.7 Review Module (`/reviews`)

#### `POST /reviews`
Submits feedback for a completed repair.
*   **Auth Required:** Bearer Access Token (Customer scope)
*   **Request Body:**
    ```json
    {
      "ticketId": "tk-9811",
      "rating": 5,
      "comment": "Screen is fully responsive, repair was quick!",
      "featurePublicly": true
    }
    ```
*   **Response (201 Created):**
    ```json
    {
      "success": true,
      "message": "Review submitted successfully."
    }
    ```
