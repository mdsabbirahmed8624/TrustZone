# Enterprise Admin Dashboard Layout & UX Specification
## TrustZone Mobile Care — Platform Administration Command Center

---

## 1. Dashboard Layout & Navigation Frame

The Admin Dashboard uses a **three-column layout** on desktop screens to manage data, workspace controls, and notifications.

```
+---------------------------------------------------------------------------------------------------+
|  [LOGO] TrustZone Admin   |   Search Tickets, Inventory, Customers...   | Branch: [ Downtown (v) ] [A] |
+---------------------------------------------------------------------------------------------------+
|  (Nav Sidebar)            |  (Main Content Canvas)                                                |
|  * Overview               |  Active Branch: Downtown Shop                                         |
|  * Orders & Repairs       |                                                                       |
|  * Inventory Control      |  +-- REVENUE 30D --+  +-- REPAIRS IN PROG --+  +-- SLA WARNINGS ----+ |
|  * Staff & Roles          |  |  $48,920.00     |  |  34 Active          |  |  2 Breached (Alert)| |
|  * CRM & Customers        |  |  (+8% vs prev)  |  |  (12 Parts Pending) |  |  [ View Breaches ] | |
|  * Invoicing & Payments   |  +-----------------+  +---------------------+  +--------------------+ |
|  * Reports Exporter       |                                                                       |
|  * Settings & Temp        |  [ Real-time Workbench Workload Chart / Multi-Branch map widget ]     |
|                           |                                                                       |
+---------------------------------------------------------------------------------------------------+
```

### 1.1 Responsive Layout Adaptations
*   **Desktop (1440px+):** Collapsible left sidebar (240px wide). Centered grid content (12-columns). Optional sliding right panel (320px wide) for context-dependent actions (such as invoice previews or customer detail sheets).
*   **Tablet (768px - 1023px):** Left sidebar collapses into a floating bottom bar or top header menu. Right panel transitions to full-width drawer sheet overlays.
*   **Mobile (320px - 767px):** Single-column layout. Tab-bar locking controls to "Overview", "Queue", "Stock", and "Alerts".

---

## 2. Page-by-Page Screen Wireframes & UI Logic

### 2.1 Page 1: Overview & Analytics Dashboard
Visualizes real-time performance indicators and operational health across branches.

#### Wireframe & Component Hierarchy
```
+---------------------------------------------------------------------------------------------------+
|  Overview & Analytics                                                       Date Range: [ Last 30 Days ]|
+---------------------------------------------------------------------------------------------------+
|  [ KPI Grid: Revenue | Average Ticket Value | Parts Consumed | NPS Score (4.8/5.0) ]              |
|                                                                                                   |
|  +-- WORKBENCH LOAD BY BRANCH -----+ +-- LIVE SLA TRACKER -------------------------------------+  |
|  | Downtown Shop:  [█████████] 90%  | | [High Priority] #TZ-9921 | iPhone Screen | Overdue 2h   |  |
|  | Northside Shop: [█████] 50%      | | [Medium Priority] #TZ-9955 | iPad Battery  | 45m left     |  |
|  | West End Shop:  [████████] 80%   | | [Low Priority] #TZ-9988 | Galaxy USB-C  | 3h left      |  |
|  +---------------------------------+ +---------------------------------------------------------+  |
|                                                                                                   |
|  +-- REVENUE TREND CHART ----------------------------------------------------------------------+  |
|  |  (Visual line graph showing weekly diagnostic fee receipts vs mechanical repair revenues)   |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```
*   **Color Accents:** Live SLA Tracker warnings flash in **Amber** or **Red** based on time remaining to focus manager attention.

---

### 2.2 Page 2: Orders & Repair Management Console
A unified control center to triage, assign, and track the status of all active device repairs.

#### Wireframe & Component Hierarchy
```
+---------------------------------------------------------------------------------------------------+
|  Orders & Repairs                                                Filters: [ Status ] [ Assignee ] |
+---------------------------------------------------------------------------------------------------+
|  Search bar: [ Search ticket, serial or customer... ]               Action: [ + Create walk-in ]  |
|                                                                                                   |
|  +-- TICKET LIST GRID -------------------------------------------------------------------------+  |
|  | Ticket ID | Device         | Customer   | Assigned Tech | Status          | Priority | Action  |  |
|  |-----------|----------------|------------|---------------|-----------------|----------|---------|  |
|  | #TZ-9921  | iPhone 14 Pro  | A. Smith   | Marcus        | [In Repair]     | HIGH     | [View]  |  |
|  | #TZ-9922  | Galaxy S23     | J. Doe     | Sarah         | [Diagnosing]    | MEDIUM   | [View]  |  |
|  | #TZ-9923  | iPad Air       | R. Jones   | Unassigned    | [Waiting Parts] | LOW      | [Assign]|  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```
*   **Quick Actions:** Clicking `[Assign]` opens a popover showing technician availability and workload scores to optimize resource scheduling.

---

### 2.3 Page 3: Multi-Branch Inventory Ledger
Manages parts directories, stock reconciliations, and automated reorder points across warehouses.

#### Wireframe & Component Hierarchy
```
+---------------------------------------------------------------------------------------------------+
|  Inventory Ledger                                            Warehouse: [ Central Warehouse (v) ] |
+---------------------------------------------------------------------------------------------------+
|  [ Alert Bar: 3 SKUs running below minimum stock buffers. Auto-purchase order generated. ]        |
|                                                                                                   |
|  +-- STOCK RECORD MATRIX ----------------------------------------------------------------------+  |
|  | SKU          | Part Name        | Compatible Models | Stock (Qty) | Buffer Limit | Bin Loc  |  |
|  |--------------|------------------|-------------------|-------------|--------------|----------|  |
|  | AP-OLED14    | iPhone 14 Screen | iPhone 14 Pro     | 12          | 5            | Shelf B3 |  |
|  | SM-BATTS23   | Galaxy Battery   | S23, S23 Plus     | 2 (Alert)   | 8            | Shelf A1 |  |
|  | GG-CHGPORT   | Pixel USB-C Port | Pixel 7, 7 Pro    | 24          | 10           | Drawer 4 |  |
|  +---------------------------------------------------------------------------------------------+  |
|  Action Buttons: [ Export Stock Report ]    [ Trigger Manual Audits ]    [ Scan Incoming Parts ]  |
+---------------------------------------------------------------------------------------------------+
```
*   **Visual Warning:** Rows containing parts falling below buffer levels highlight in light amber backgrounds to flag manual ordering requirements.

---

### 2.4 Page 4: CRM & Customers Portal
Displays unified communication logs, loyalty point tallies, and hardware ownership history.

#### Wireframe & Component Hierarchy
```
+---------------------------------------------------------------------------------------------------+
|  Customer Management                                                                               |
+---------------------------------------------------------------------------------------------------+
|  +-- CUSTOMER DIRECTORY ------------+ +-- SELECTED CUSTOMER: Alex Smith ------------------------+  |
|  | [ Search customer records...   ] | | Email: alex.smith@email.com   Phone: +1 555-0199        |  |
|  |----------------------------------| | Loyalty Level: Gold (340 pts)  Branch: Downtown         |  |
|  | Alex Smith     | alex@smith.com  | +-- OWNED DEVICES ---------------------------------------+  |
|  | Brenda Lee     | b.lee@email.com | | iPhone 14 Pro (IMEI: 3591...) | Status: In Repair      |  |
|  | Charles Davis  | charlie@d.com   | | iPad Air 4    (SN: DLX...)    | Status: Completed      |  |
|  |                              | +-- DIALOGUE TIMELINE -----------------------------------+  |
|  |                                  | | [SMS Sent] "Your diagnostic estimate is ready" (10m)   |  |
|  |                                  | | [Email Sent] "Welcome to TrustZone Mobile Care" (2d ago) |  |
|  +----------------------------------+ +---------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

---

### 2.5 Page 5: Staff & Role Configuration (Permissions Matrix)
Enforces Role-Based Access Control (RBAC) schemas across administrative and field employees.

#### Wireframe & Component Hierarchy
```
+---------------------------------------------------------------------------------------------------+
|  Staff & Role Configurations                                                                      |
+---------------------------------------------------------------------------------------------------+
|  Tabs: [ Staff Rosters ]   [ Role Matrix ]   [ System Permissions Manager ]                       |
|                                                                                                   |
|  +-- ROLE PERMISSIONS GRID --------------------------------------------------------------------+  |
|  | Permission Context     | Admin (Global) | Manager (Branch) | Technician | Customer          |  |
|  |------------------------|----------------|------------------|------------|-------------------|  |
|  | View Global Analytics  |      [x]       |       [ ]        |    [ ]     |        [ ]        |  |
|  | Edit Invoices          |      [x]       |       [x]        |    [ ]     |        [ ]        |  |
|  | Update Work Status     |      [x]       |       [x]        |    [x]     |        [ ]        |  |
|  | Request Parts          |      [x]       |       [x]        |    [x]     |        [ ]        |  |
|  | Access Database logs   |      [x]       |       [ ]        |    [ ]     |        [ ]        |  |
|  +---------------------------------------------------------------------------------------------+  |
|  Action Buttons: [ Apply System-Wide Changes ]                   [ Add New Role Custom Template ]|
+---------------------------------------------------------------------------------------------------+
```

---

### 2.6 Page 6: Financial Center (Invoices, Payments, Reports)
Traces invoice states, processes refunds, and exports tax documentation.

#### Wireframe & Component Hierarchy
```
+---------------------------------------------------------------------------------------------------+
|  Financial Center                                                                                 |
+---------------------------------------------------------------------------------------------------+
|  +-- TRANSACTION INTAKE LEDGER ----------------------------------------------------------------+  |
|  | Invoice #  | Ticket ID  | Total Cost | Tax (7%) | Payout Method | Stripe ID   | Status      |  |
|  |------------|------------|------------|----------|---------------|-------------|-------------|  |
|  | INV-9901   | #TZ-9921   | $220.00    | $15.40   | Credit Card   | ch_3M82...  | [Paid]      |  |
|  | INV-9902   | #TZ-9955   | $129.00    | $9.03    | Stripe POS    | ch_3M88...  | [Paid]      |  |
|  | INV-9903   | #TZ-9988   | $89.00     | $6.23    | Cash          | N/A         | [Pending]   |  |
|  +---------------------------------------------------------------------------------------------+  |
|                                                                                                   |
|  +-- REPORT EXPORTER TOOL ---------------------------------------------------------------------+  |
|  | Document Type: [ Tax Statement / Payout Summary (v) ]    Branch Scope: [ All Branches (v) ] |  |
|  | Range: [ Last Fiscal Quarter (v) ]                       Format: [ CSV / PDF (v) ]          |  |
|  | [ Export Document to Queue ]                                                                |  |
|  +---------------------------------------------------------------------------------------------+  |
+---------------------------------------------------------------------------------------------------+
```

---

### 2.7 Page 7: Settings & Notification Templates Configuration
Configures multi-branch operating rules, API channels, and webhook listeners.

#### Wireframe & Component Hierarchy
```
+---------------------------------------------------------------------------------------------------+
|  System Settings                                                                                  |
+---------------------------------------------------------------------------------------------------+
|  Categories: [ General ]   [ Branch Rules ]   [ API Binds ]   [ Notification Templates ]          |
|                                                                                                   |
|  +-- NOTIFICATION TEMPLATE MANAGER ------------------------------------------------------------+  |
|  | Channel Type: [ SMS Template (v) ]      Trigger Point: [ Ticket Changed to "Ready" (v) ]    |  |
|  |                                                                                               |
|  | Template Markup Editor:                                                                       |
|  | +-------------------------------------------------------------------------------------------+ |  |
|  | | Hello {{customer.firstName}}, your device {{device.model}} is ready for pickup at our     | |  |
|  | | {{branch.name}} store. Please have your Ticket ID {{ticket.id}} ready at checkout.        | |  |
|  | +-------------------------------------------------------------------------------------------+ |  |
|  | Dynamic Variable Tags: [ {{customer.name}} ]   [ {{ticket.id}} ]   [ {{invoice.total}} ]     |  |
|  +---------------------------------------------------------------------------------------------+  |
|  Action Buttons: [ Send Test Message ]                       [ Save System Configuration Binds ]|
+---------------------------------------------------------------------------------------------------+
```

---

## 3. Global Notification & Task System

The dashboard includes a sliding drawer notification system to alert admins to key events.

```
+-- NOTIFICATIONS PANEL (Sliding Drawer) --+
|  [X] Close Panel                         |
|  ======================================= |
|  [Alert] Downtown Branch                 |
|  SLA Breach: Ticket #TZ-9921 is overdue. |
|  --------------------------------------- |
|  [System] Inventory                      |
|  Samsung OLED screens low stock limit.   |
|  --------------------------------------- |
|  [Stripe] Payout                         |
|  Daily batch payout of $22,400 completed |
+------------------------------------------+
```
*   **Behavior:** New notifications slide out from the right sidebar. If the event is critical (e.g., SLA breach), the notification sounds a low-frequency tone and blinks in the header navigation frame until clicked.
*   **Dynamic Polling:** Leverages WebSockets to push instant notification items directly from backend modules without browser refreshes.
