# Customer Portal Layout & UX Specification
## TrustZone Mobile Care — Customer Experience Portal

---

## 1. Portal Navigation & Responsive Layout Frame

The Customer Portal uses a **centered dashboard grid layout** to make it easy for customers to book repairs, view progress, and pay invoices.

```
+---------------------------------------------------------------------------------------------------+
|  [LOGO] TrustZone Portal           Book New Repair   Support Helpdesk   |   [ Bell (2) ]  [Profile]  |
+---------------------------------------------------------------------------------------------------+
|  (User Navigation)         |  (Main Portal Canvas)                                                 |
|  * Dashboard Overview      |  Welcome back, Alex!                                                  |
|  * Track Active Repair     |  Need help today? [ Start a New Repair Booking ]                      |
|  * My Device Vault         |                                                                       |
|  * Invoices & Receipts     |  +-- ACTIVE REPAIR -------------------------------------------------+ |
|  * Warranty Certificates   |  | Ticket #TZ-9921: iPhone 14 Pro  -->  Status: [ IN REPAIR ]         | |
|  * Support Tickets         |  | Progress: [===============>            ] Est. Completion: Today   | |
|  * Account Settings        |  | [ View Live Timeline ]                                           | |
|                            |  +------------------------------------------------------------------+ |
+---------------------------------------------------------------------------------------------------+
```

### 1.1 Responsive Layout Adaptations
*   **Desktop (1440px+):** Left-side dashboard navigation list (240px wide). Centered grid content (12-columns). Notifications dropdown menu flags new alerts inside the top header bar.
*   **Tablet (768px - 1023px):** Nav list collapses into a top slider bar. Active repair cards fill the layout width.
*   **Mobile (320px - 767px):** Bottom navigation tab bar locking pages to "Home", "Track", "Book", and "Support".

---

## 2. Screen-by-Screen Layout Specifications

### 2.1 Screen 1: Dashboard Overview
The customer landing panel displaying current active repair progress, quick links, and active device warranty statuses.

#### Wireframe & Component Hierarchy
```
+---------------------------------------------------------------------------------------------------+
|  Dashboard Overview                                                                                |
+---------------------------------------------------------------------------------------------------+
|  +-- ACTIVE SERVICE TRACKER -----------------------------+ +-- QUICK SERVICES ------------------+  |
|  | Ticket: #TZ-9921 | Device: iPhone 14 Pro              | | [ Book a New Repair ]              |  |
|  | Status: [ Diagnosing ]                                | | [ Open a Support Ticket ]          |  |
|  | Message: Tech is running diagnostic checks.           | | [ Register a New Device ]          |  |
|  | [ Go to Tracking Page ]                               | |                                    |
|  +-------------------------------------------------------+ +------------------------------------+  |
|                                                                                                   |
|  +-- MY DEVICE VAULT (Registered Devices) ---------------+ +-- UNPAID INVOICES ----------------+  |
|  | * Alex's iPhone 15 Pro Max   | Active Warranty        | | #INV-9901 | iPhone OLED  | $220.00  |  |
|  | * Mom's iPad Pro             | Out of Warranty        | | [ Pay Online via Stripe ]          |  |
|  +-------------------------------------------------------+ +------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

---

### 2.2 Screen 2: Dynamic Booking Wizard
A multi-step, questionnaire-driven booking flow.

#### Wireframe & Component Hierarchy
```
+---------------------------------------------------------------------------------------------------+
|  Book a Repair Service                                          Step: [1. Device ] -> 2 -> 3 -> 4 |
+---------------------------------------------------------------------------------------------------+
|  +-- WIZARD STEP PANEL: Device Information ----------------------------------------------------+  |
|  |                                                                                               |
|  | Select Device Category:                                                                       |
|  | ( ) Smartphone       ( ) Tablet       ( ) Laptop       ( ) Smartwatch                         |
|  |                                                                                               |
|  | Device Brand: [ Select Brand (v) ]       Device Model: [ Select Model (v) ]                   |
|  |                                                                                               |
|  | Serial / IMEI Number (Optional):                                                              |
|  | [ Enter Serial or IMEI...               ] [ Camera Scan Barcode ]                             |
|  |                                                                                               |
|  +-----------------------------------------------------------------------------------------------+  |
|  Action Buttons: [ Back to Dashboard ]                                          [ Next Step: Issues > ]|
+---------------------------------------------------------------------------------------------------+
```
*   **Wizard Steps:** Step 1: Device Specs, Step 2: Issue Selection (Estimate Calculator), Step 3: Logistics (Mail-in vs Walk-in scheduler), Step 4: Contact & Review.

---

### 2.3 Screen 3: Live Repair Tracker & Diagnostics Review
Displays the real-time stage progress, technician diagnostic photos, and estimate approval choices.

#### Wireframe & Component Hierarchy
```
+---------------------------------------------------------------------------------------------------+
|  Repair Tracker: Ticket #TZ-9921                                                    Status: Active|
+---------------------------------------------------------------------------------------------------+
|  +-- PROGRESS TIMELINE ------------------------------------------------------------------------+  |
|  | [x] Booked ----> [x] Checked In ----> [/] DIAGNOSING ----> [ ] Repairing ----> [ ] Ready     |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                                                                   |
|  +-- DIAGNOSTICS & PICTURE PROOF ---------+ +-- ESTIMATE APPROVAL CONTROL ----------------------+  |
|  | Technician Log:                        | | Diagnostic Report Summary:                        |  |
|  | "Cracked OLED display with deep glass  | | * LCD Screen Replacement:  $150.00                |  |
|  | damage. Frame remains intact."         | | * Diagnostic Fee:          $20.00                 |  |
|  |                                        | |---------------------------------------------------|  |
|  | Evidence Photos:                       | | Estimated Total:           $170.00                |  |
|  | [ Image: Front Screen Shatter ]        | |                                                   |  |
|  | [ Image: Close-up Corner Scratch ]     | | [ Approve & Start Repair ]    [ Reject & Return ] |  |
|  +----------------------------------------+ +---------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```
*   **Status Indicators:** When awaiting client approval, the Estimate Approval block highlights in **Amber**, blocking status shifts until action is taken.

---

### 2.4 Screen 4: Invoices & Payments Panel
A clear interface listing invoice histories and processing secure credit card checkouts.

#### Wireframe & Component Hierarchy
```
+---------------------------------------------------------------------------------------------------+
|  Invoices & Payments                                                                               |
+---------------------------------------------------------------------------------------------------+
|  +-- INVOICE LIST LEDGER ----------------------------------------------------------------------+  |
|  | Invoice # | Date Issued | Device Covered   | Total Amount | Status      | Action            |  |
|  |-----------|-------------|------------------|--------------|-------------|-------------------|  |
|  | INV-9901  | 2026-07-08  | iPhone 14 Pro    | $170.00      | [Unpaid]    | [ Pay Invoice ]   |  |
|  | INV-9811  | 2026-04-12  | iPad Air 4       | $89.00       | [Paid]      | [ Download PDF ]  |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                                                                   |
|  +-- SECURE STIPULATED CHECKOUT (Stripe Inline Widget) ----------------------------------------+  |
|  | Cardholder Name:  [ Enter Name...          ]                                                |  |
|  | Card Number:      [ XXXX XXXX XXXX XXXX ]  Expiry: [ MM / YY ]  CVC: [ *** ]                |  |
|  | [ Submit Secure Payment of $170.00 ]  * Fully encrypted TLS transactions.                   |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

---

### 2.5 Screen 5: Warranty Vault & Device Registry
Manages active warranty periods, logs expired coverage, and allows registering new devices.

#### Wireframe & Component Hierarchy
```
+---------------------------------------------------------------------------------------------------+
|  Warranty & Device Vault                                          Action: [ + Register a Device ] |
+---------------------------------------------------------------------------------------------------+
|  +-- ACTIVE WARRANTY CERTIFICATES -------------------------------------------------------------+  |
|  | Device Name         | Serial / IMEI  | Covered Issues     | Valid Until | Status            |  |
|  |---------------------|----------------|--------------------|-------------|-------------------|  |
|  | iPhone 14 Pro       | SN: DX892100   | Screen defects     | 2026-10-08  | [ Active: 90d ]   |  |
|  | iPad Air 4          | SN: DLX9882A   | Battery failures   | 2026-04-12  | [ Expired ]       |  |
|  +---------------------------------------------------------------------------------------------+  |
|  * Click on any active device row to [ Download PDF Certificate ] or [ Claim Warranty Service ].   |
+---------------------------------------------------------------------------------------------------+
```

---

### 2.6 Screen 6: Customer Support Desk (Support Tickets)
A text-based thread interface to open support cases and message store representatives.

#### Wireframe & Component Hierarchy
```
+---------------------------------------------------------------------------------------------------+
|  Support Tickets & Helpdesk                                    Action: [ + Open Support Ticket ]  |
+---------------------------------------------------------------------------------------------------+
|  +-- ACTIVE CONVERSATION: Ticket #SUP-1022 ----------------------------------------------------+  |
|  | Category: Shipping Issue | Date Opened: 2026-07-07                                           |  |
|  |                                                                                               |
|  | [User - 2026-07-07 14:00] My mail-in box hasn't arrived at my home address yet.               |
|  | [Support - 2026-07-07 15:30] Hi Alex, we checked the tracking code. It is currently in transit |
|  |                              and will deliver tomorrow afternoon.                             |
|  |                                                                                               |
|  | Write message response:                                                                       |
|  | [ Enter response details here...                                                           ]  |
|  | [ Attach Image / File ]                                                   [ Send Message ]    |
|  +-----------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

---

### 2.7 Screen 7: Repair Reviews & Feedback
Allows customers to rate completed repair services and write testimonials.

#### Wireframe & Component Hierarchy
```
+---------------------------------------------------------------------------------------------------+
|  Submit Service Review: Ticket #TZ-9811                                                            |
+---------------------------------------------------------------------------------------------------+
|  +-- REVIEW FORM ------------------------------------------------------------------------------+  |
|  | How would you rate the repair quality of your iPad Air 4?                                      |  |
|  | Star Rating:  [ * ] [ * ] [ * ] [ * ] [ * ] (5/5 Outstanding)                                  |  |
|  |                                                                                               |
|  | Share your feedback:                                                                          |
|  | [ Screen looks brand new, touch is highly responsive, and turnaround was super fast!       ]  |
|  |                                                                                               |
|  | [x] I agree to feature this review publicly on TrustZone's landing testimonials section.       |
|  +---------------------------------------------------------------------------------------------+  |
|  Action Buttons: [ Skip Review ]                                            [ Submit Testimonial ]|
+---------------------------------------------------------------------------------------------------+
```

---

### 2.8 Screen 8: Account Settings & Notification Preferences
Manages user profiles, delivery addresses, and communications toggles.

#### Wireframe & Component Hierarchy
```
+---------------------------------------------------------------------------------------------------+
|  Account Settings                                                                                 |
+---------------------------------------------------------------------------------------------------+
|  +-- USER PROFILE -----------------------+ +-- COMMUNICATION PREFERENCES -----------------------+  |
|  | First Name: [ Alex         ]          | | Notify me on repair status updates via:            |  |
|  | Last Name:  [ Smith        ]          | | [x] SMS Notifications                              |  |
|  | Email:      [ alex@smith.com ]        | | [x] Email Newsletters                              |  |
|  | Phone:      [ +1 555-0199  ]          | | [ ] Promotional updates & Loyalty offers           |  |
|  +---------------------------------------+ +----------------------------------------------------+  |
|  +-- ADDRESS BOOK -----------------------------------------------------------------------------+  |
|  | Default Address: [ 123 Maple Street, Apt 4B, New York, NY 10001                          ]  |
|  +---------------------------------------------------------------------------------------------+  |
|  Action Buttons: [ Cancel Changes ]                                       [ Save Settings Base ]  |
+---------------------------------------------------------------------------------------------------+
```
