# NovaBoard | E-Commerce Control Portal & Storefront

[![React Version](https://img.shields.io/badge/React-19.2.7-61dafb.svg?style=flat&logo=react)](https://react.dev/)
[![React Router](https://img.shields.io/badge/React_Router-7.18.1-ca4245.svg?style=flat&logo=react-router)](https://reactrouter.com/)
[![Supabase Client](https://img.shields.io/badge/@supabase/supabase--js-2.110.0-3ecf8e.svg?style=flat&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.19-38bdf8.svg?style=flat&logo=tailwind-css)](https://tailwindcss.com/)
[![Recharts](https://img.shields.io/badge/Recharts-3.9.1-22c55e.svg?style=flat)](https://recharts.org/)
[![jsPDF](https://img.shields.io/badge/jsPDF-4.2.1-e11d48.svg?style=flat)](https://github.com/parallax/jsPDF)
[![Lucide Icons](https://img.shields.io/badge/Lucide_React-1.22.0-f59e0b.svg?style=flat&logo=lucide)](https://lucide.dev/)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen.svg?style=flat)](#51-production-build--asset-optimization)
[![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat)](#57-contributing-guidelines-authors-license--acknowledgments)

---

## Table of Contents

1. [Project Header & Badges](#1-project-header--badges)
2. [Project Overview & Executive Summary](#2-project-overview--executive-summary)
3. [Core Value Proposition & System Highlights](#3-core-value-proposition--system-highlights)
4. [High-Level System Architecture](#4-high-level-system-architecture)
5. [Component Hierarchy & Routing Topology](#5-component-hierarchy--routing-topology)
6. [Complete Technology Stack & Specifications](#6-complete-technology-stack--specifications)
7. [Repository Directory Structure](#7-repository-directory-structure)
8. [Database Architecture & Entity Relationships](#8-database-architecture--entity-relationships)
9. [Supabase Backend Infrastructure & Storage](#9-supabase-backend-infrastructure--storage)
10. [Row-Level Security (RLS) & Access Control Policies](#10-row-level-security-rls--access-control-policies)
11. [Database Triggers, Functions & Constraints](#11-database-triggers-functions--constraints)
12. [Authentication & Authorization Flow (RBAC)](#12-authentication--authorization-flow-rbac)
13. [Dynamic Dashboard Redirection Engine](#13-dynamic-dashboard-redirection-engine)
14. [Global State Management (CartContext)](#14-global-state-management-cartcontext)
15. [End-to-End E-Commerce Customer Journey](#15-end-to-end-e-commerce-customer-journey)
16. [Product Catalog, Multi-Filter & Search Engine](#16-product-catalog-multi-filter--search-engine)
17. [Product Detail View & Recommendation Engine](#17-product-detail-view--recommendation-engine)
18. [Product Reviews & Customer Rating System](#18-product-reviews--customer-rating-system)
19. [Database-Backed Shopping Cart Synchronization](#19-database-backed-shopping-cart-synchronization)
20. [Persistent User Wishlist Management](#20-persistent-user-wishlist-management)
21. [Multi-Step Checkout Workflow](#21-multi-step-checkout-workflow)
22. [Simulated Payment Processing Gateway](#22-simulated-payment-processing-gateway)
23. [Order Placement & Database Schema](#23-order-placement--database-schema)
24. [Visual Order Tracking Timeline & Status Lifecycle](#24-visual-order-tracking-timeline--status-lifecycle)
25. [Automated PDF Invoice & Receipt Generation (jsPDF)](#25-automated-pdf-invoice--receipt-generation-jspdf)
26. [Customer Account Hub & Navigation Portal](#26-customer-account-hub--navigation-portal)
27. [Profile Information & Address Management](#27-profile-information--address-management)
28. [Customer Orders History & Reordering Portal](#28-customer-orders-history--reordering-portal)
29. [Customer Support & Contact Us Workflow](#29-customer-support--contact-us-workflow)
30. [Admin Control Portal & Capabilities Overview](#30-admin-control-portal--capabilities-overview)
31. [Real-Time Business Analytics & KPI Dashboard (Recharts)](#31-real-time-business-analytics--kpi-dashboard-recharts)
32. [Product Inventory & Catalog Management (CRUD)](#32-product-inventory--catalog-management-crud)
33. [Product Image Upload Pipeline (products-image Bucket)](#33-product-image-upload-pipeline-products-image-bucket)
34. [Admin Order Management & Fulfillment Pipeline](#34-admin-order-management--fulfillment-pipeline)
35. [Admin Customer Intelligence & Spend Analytics](#35-admin-customer-intelligence--spend-analytics)
36. [Admin Manual Order & Customer Creation](#36-admin-manual-order--customer-creation)
37. [Admin Profile & Session Inspection](#37-admin-profile--session-inspection)
38. [UI/UX Design System & Dark Mode Aesthetics](#38-uiux-design-system--dark-mode-aesthetics)
39. [CSS Architecture, Design Tokens & Tailwind Configuration](#39-css-architecture-design-tokens--tailwind-configuration)
40. [Responsive & Mobile Design Strategy](#40-responsive--mobile-design-strategy)
41. [Security Architecture & Credential Protection](#41-security-architecture--credential-protection)
42. [Data Validation & Client/Server Error Handling](#42-data-validation--clientserver-error-handling)
43. [Image Asset Pipeline & Local Media Assets](#43-image-asset-pipeline--local-media-assets)
44. [Environment Variables & Secret Configuration](#44-environment-variables--secret-configuration)
45. [Prerequisites & System Requirements](#45-prerequisites--system-requirements)
46. [Step-by-Step Installation & Dependency Setup](#46-step-by-step-installation--dependency-setup)
47. [Local Development Execution Guide](#47-local-development-execution-guide)
48. [Database Setup, Schema Migration & Constraints](#48-database-setup-schema-migration--constraints)
49. [Database Utility, Diagnostic & Maintenance Scripts](#49-database-utility-diagnostic--maintenance-scripts)
50. [Testing Strategy, Test Execution & Known Issues](#50-testing-strategy-test-execution--known-issues)
51. [Production Build & Asset Optimization](#51-production-build--asset-optimization)
52. [Web Vitals & Frontend Performance Optimization](#52-web-vitals--frontend-performance-optimization)
53. [Cross-Browser & Cross-Platform Compatibility](#53-cross-browser--cross-platform-compatibility)
54. [Code Quality, ESLint Diagnostics & Static Analysis](#54-code-quality-eslint-diagnostics--static-analysis)
55. [Troubleshooting & Common Pitfalls](#55-troubleshooting--common-pitfalls)
56. [Feature Implementation Audit (Implemented, Partial, Deprecated & Planned)](#56-feature-implementation-audit-implemented-partial-deprecated--planned)
57. [Contributing Guidelines, Authors, License & Acknowledgments](#57-contributing-guidelines-authors-license--acknowledgments)

---

## 1. Project Header & Badges

NovaBoard is an enterprise-grade full-stack e-commerce storefront and operations management control portal. The system features a responsive, dark-mode glassmorphic user interface built with React 19 and Tailwind CSS, backed by a persistent PostgreSQL database on Supabase Cloud.

* **Repository Remote**: `https://github.com/ankitha2910/E-commerce_website-order_management.git`
* **Target Audience**: Digital commerce businesses, inventory operators, fulfillment managers, and retail customers.
* **Primary Currency**: Indian Rupee (`₹` / `INR`).
* **Framework**: React 19 SPA bootstrapped with Create React App (CRA).

---

## 2. Project Overview & Executive Summary

NovaBoard solves the fragmentation between consumer storefront browsing and backend administrative commerce operations. Built as a single cohesive React Single Page Application (SPA), the system operates across two distinct domains:

1. **Customer E-Commerce Storefront**: Allows visitors to discover trending products, search and filter catalog inventories, read customer reviews and aggregate ratings, manage a persistent shopping cart and wishlist synced directly to Supabase, complete a multi-step checkout with simulated card processing, track delivery progress through a multi-stage timeline, and download official PDF order receipts on demand.
2. **Administrative Control Portal (ERP)**: Equips store managers with executive revenue metrics, low-stock notifications, Recharts analytical breakdowns, complete product inventory CRUD (including Supabase Storage image asset uploading), real-time order lifecycle status management, customer intelligence with lifetime order value aggregation, and customer profile maintenance.

Role-Based Access Control (RBAC) and database-level constraints guarantee that customers and administrators interact only with their designated application views.

---

## 3. Core Value Proposition & System Highlights

* **Cross-Device Persistent Cart & Wishlist**: Unlike traditional localStorage-bound carts, NovaBoard stores all cart items and wishlist entries in PostgreSQL via Supabase PostgREST, preventing cross-account state leakage and preserving shopper data across login sessions and devices.
* **Dynamic Role-Based Redirection**: A dedicated routing resolver queries user profiles upon authentication, routing administrators directly to `/admin` and consumers to `/shop`.
* **Administrative Security via Invite Code**: Admin account creation is protected by mandatory verification (`NOVA-2026`) during registration.
* **On-Demand PDF Invoicing**: Customers and administrators can generate and download structured PDF receipts instantly via client-side `jsPDF`.
* **Visual Order Progress Pipeline**: Customer orders reflect four distinct fulfillment stages (`Pending` -> `Packed` -> `Shipped` -> `Delivered`) rendered on an interactive visual progress timeline.
* **Real-Time Data Analytics**: Administrative dashboard with interactive Recharts BarCharts and PieCharts tracking categorical distributions and financial health.
* **Modern Dark-Mode Aesthetics**: High-end styling with backdrop filters, gradient borders, glowing interactive accents, and typography driven by Google Fonts (`Inter` & `Outfit`).

---

## 4. High-Level System Architecture

The following diagram illustrates the verified communication flow between frontend client components, Supabase cloud services, and auxiliary maintenance tools:

```mermaid
flowchart TD
    subgraph Client ["Frontend Client (React 19 SPA)"]
        UI_Storefront["Customer Storefront<br/>(Landing, Shop, ProductDetail)"]
        UI_Checkout["Checkout & Order Processing<br/>(Checkout, OrderSuccess)"]
        UI_Account["Customer Account Hub<br/>(AccountHub, Orders, Profile)"]
        UI_Admin["Admin Operations Portal<br/>(Dashboard, Products, Orders, Customers)"]
        Cart_Context["Cart Context Provider<br/>(Optimistic State + Sync)"]
    end

    subgraph Supabase ["Supabase Cloud Services"]
        S_Auth["Supabase Auth Engine<br/>(JWT, Session Persistence)"]
        S_PostgREST["PostgREST API Gateway<br/>(RESTful Database Access)"]
        S_Storage["Supabase Storage<br/>(Bucket: products-image)"]
    end

    subgraph PostgreSQL ["PostgreSQL Database Engine"]
        T_Profiles[("profiles")]
        T_Products[("products")]
        T_Orders[("orders")]
        T_Reviews[("reviews")]
        T_Cart[("cart_items")]
        T_Wishlist[("wishlist_items")]
        T_Customers[("customers")]
    end

    subgraph Diagnostics ["Node.js Diagnostic & Maintenance Tooling"]
        Script_PG["Direct PG Scripts<br/>(fix-everything.js, test-pg.js)"]
        Script_Images["Media Seed Scripts<br/>(scratch-download-images.js)"]
    end

    UI_Storefront --> Cart_Context
    Cart_Context --> S_PostgREST
    UI_Storefront --> S_PostgREST
    UI_Checkout --> S_PostgREST
    UI_Account --> S_PostgREST
    UI_Admin --> S_PostgREST
    UI_Admin --> S_Storage
    Client --> S_Auth

    S_PostgREST --> T_Profiles
    S_PostgREST --> T_Products
    S_PostgREST --> T_Orders
    S_PostgREST --> T_Reviews
    S_PostgREST --> T_Cart
    S_PostgREST --> T_Wishlist
    S_PostgREST --> T_Customers

    Script_PG --> PostgreSQL
    Script_Images --> PostgreSQL
```

---

## 5. Component Hierarchy & Routing Topology

Application routing is managed by `react-router-dom` (v7) in `src/App.js`. The tree below details public routes, protected user routes, administrative pathways, and route resolvers:

```mermaid
flowchart LR
    App["src/App.js (CartProvider)"] --> Router["BrowserRouter / Routes"]

    Router --> Public_Landing["/ -> Landing.jsx (if guest)"]
    Router --> Public_Login["/login -> auth.jsx (if guest)"]
    Router --> Public_Reset["/reset-password -> ResetPassword.jsx"]
    Router --> Resolve_Dash["/dashboard -> DashboardRedirect()"]

    Resolve_Dash -->|"role == 'admin'"| Page_Admin["/admin -> admin.jsx"]
    Resolve_Dash -->|"role == 'customer'"| Page_Shop["/shop -> shop.jsx"]

    Router --> Page_Admin_Alias["/admin/dashboard -> admin.jsx"]
    Router --> Page_Shop
    Router --> Page_Checkout["/checkout -> checkout.jsx"]
    Router --> Page_Success["/success -> OrderSuccess.jsx"]
    Router --> Page_Product["/product/:id -> ProductDetail.jsx (Protected)"]
    Router --> Page_Account["/account -> AccountHub.jsx (Protected)"]
    Router --> Page_CustOrders["/account/orders -> CustomerOrders.jsx (Protected)"]
    Router --> Page_CustEdit["/account/edit -> CustomerProfileEdit.jsx (Protected)"]
    Router --> Page_CustContact["/account/contact -> ContactUs.jsx (Protected)"]
    Router --> Page_OrdersLegacy["/orders -> Orders.jsx"]
    Router --> Page_CustomersAdmin["/customers -> Customers.jsx"]
    Router --> Wildcard["* -> Navigate('/')"]
```

---

## 6. Complete Technology Stack & Specifications

### Frontend Framework & Core Libraries
* **React** (`19.2.7`): Component-driven application layer using React Hooks (`useState`, `useEffect`, `useRef`, `useContext`).
* **React DOM** (`19.2.7`): DOM renderer for React components.
* **React Router DOM** (`7.18.1`): Client-side declarative routing, URL parameter extraction, location state passing, and redirection.
* **Create React App / react-scripts** (`5.0.1`): Webpack-based bundling and compilation harness.
* **Web Vitals** (`2.1.4`): Core performance profiling hooks.

### Backend Infrastructure & Data Access
* **@supabase/supabase-js** (`2.110.0`): Supabase JavaScript client for authentication, PostgREST queries, and storage asset management.
* **pg** (`8.22.0`): PostgreSQL client for direct database maintenance, constraint alterations, and diagnostic tooling.

### Data Visualization & Document Generation
* **Recharts** (`3.9.1`): Composable charting library providing `<ResponsiveContainer>`, `<BarChart>`, `<Bar>`, `<PieChart>`, and `<Cell>`.
* **jsPDF** (`4.2.1`): Client-side vector PDF generation engine for order invoices.

### Styling, Icons & UI
* **Tailwind CSS** (`3.4.19`): Utility-first CSS framework with dark-mode class toggling and responsive utilities.
* **@tailwindcss/postcss** (`4.3.2`) & **PostCSS** (`8.5.16`): CSS preprocessing toolchain.
* **Autoprefixer** (`10.5.2`): PostCSS plugin to parse CSS and add vendor prefixes.
* **Lucide React** (`1.22.0`): Feather-derived SVG icon system.
* **Google Fonts**: Webfont typography importing `Inter` (body font) and `Outfit` (heading font).

### Testing Tooling
* **@testing-library/react** (`16.3.2`): Component render and assertion utilities.
* **@testing-library/jest-dom** (`6.9.1`): Custom Jest matchers for DOM assertions.
* **@testing-library/user-event** (`13.5.0`): User event simulation.
* **@testing-library/dom** (`10.4.1`): Core DOM testing utilities.

---

## 7. Repository Directory Structure

```
novaboard/
├── .gitignore                          # Standard CRA git ignore rules
├── app.js                              # [Deprecated] Early prototype monolithic admin dashboard
├── check-constraint.js                 # Diagnostic script verifying profiles_role_check constraint
├── fix-everything.js                   # Migration script altering constraints, RLS policies, backfilling profiles
├── fix-rls.js                          # Database script granting INSERT policies on profiles and customers
├── package.json                        # NPM package manifest with dependencies, scripts, and browserslist
├── package-lock.json                   # Deterministic dependency lockfile
├── README.md                           # Comprehensive project documentation
├── scratch-copy-generated.js           # Maintenance utility copying generated product assets to public/
├── scratch-download-images.js          # Image scraping script fetching assets from Amazon CDN
├── scratch-download-images2.js         # Media downloading utility pulling from Unsplash and Picsum
├── scratch-download-real-images.js     # Image fetching utility updating database records from LoremFlickr
├── tailwind.config.js                  # Tailwind configuration with dark mode and template paths
├── test-admin.js                       # Verification script testing Supabase Admin API createUser
├── test-db.js                          # Diagnostic script checking profiles, customers, and admins tables
├── test-pg.js                          # PostgreSQL script inspecting and dropping blocking auth.users triggers
├── test-phone.js                       # Verification test for phone-number user registration
├── test-signup.js                      # Automated client-side signup test script
├── test-triggers.js                    # Query script checking information_schema.triggers
├── pages/
│   └── auth.jsx                        # [Orphaned] 0-byte placeholder outside src directory
├── public/
│   ├── favicon.ico                     # Browser tab icon
│   ├── index.html                      # HTML template with page title "NovaBoard | E-Commerce Control Portal"
│   ├── logo192.png                     # Standard PWA 192x192 PNG icon
│   ├── logo512.png                     # Standard PWA 512x512 PNG icon
│   ├── manifest.json                   # Web application manifest configuration
│   ├── robots.txt                      # Search engine crawler configuration
│   └── images/                         # 26 pre-bundled local product image assets (JPG / PNG)
└── src/
    ├── App.css                         # Default CRA styles and logo animation keyframes
    ├── App.js                          # Main application component, BrowserRouter definitions, DashboardRedirect
    ├── App.test.js                     # Jest unit test suite (defaults to CRA link assertion)
    ├── index.css                       # Global CSS design tokens, custom utility classes, animations, scrollbars
    ├── index.js                        # React 19 root bootstrap mounting App inside React.StrictMode
    ├── logo.svg                        # React logo graphic
    ├── reportWebVitals.js              # Performance metrics collector
    ├── setupTests.js                   # Jest DOM extension configuration
    ├── supabaseClient.js               # Supabase JS client initialization with project credentials
    ├── components/
    │   ├── checkout.jsx                # Multi-step checkout accordion with simulated payment processing
    │   ├── login.jsx                   # [Alternative/Unused] Standalone customer login/signup component
    │   ├── Orders.jsx                  # Basic orders display component routed at /orders
    │   ├── ProductCard.jsx             # [Component] Standalone product card UI component
    │   └── ProductDetail.jsx           # Product detail view, review submission, and recommendation engine
    ├── context/
    │   └── CartContext.js              # React context managing cart state and bi-directional Supabase DB sync
    └── pages/
        ├── AccountHub.jsx              # Customer account landing navigation hub with 4 primary action cards
        ├── admin.jsx                   # 861-line comprehensive ERP admin portal (Dashboard, Products, Orders, Customers)
        ├── auth.jsx                    # Unified customer/admin authentication page with custom dropdowns
        ├── ContactUs.jsx               # Customer support information page with inquiry submission form
        ├── CustomerOrders.jsx          # Customer order history, multi-stage timeline tracking, PDF invoicing
        ├── CustomerProfileEdit.jsx     # Profile editing view for name, mobile number, and delivery address
        ├── Customers.jsx               # Admin customer intelligence table calculating lifetime order statistics
        ├── Landing.jsx                 # Public landing showcase displaying products before authentication
        ├── OrderSuccess.jsx            # Order confirmation receipt page
        ├── ResetPassword.jsx           # Secure password recovery and update interface
        └── shop.jsx                    # Core customer storefront with category filters, search, wishlist, cart drawer
```

---

## 8. Database Architecture & Entity Relationships

The underlying database is hosted on PostgreSQL within Supabase Cloud. The diagram below illustrates the actual schemas, primary keys, foreign keys, and relationships verified from code and diagnostic scripts:

```mermaid
erDiagram
    PROFILES ||--o{ ORDERS : "places (user_id)"
    PROFILES ||--o{ REVIEWS : "writes (user_id)"
    PROFILES ||--o{ CART_ITEMS : "holds (user_id)"
    PROFILES ||--o{ WISHLIST_ITEMS : "saves (user_id)"
    PROFILES ||--o| CUSTOMERS : "mirrors (id)"
    PRODUCTS ||--o{ REVIEWS : "receives (product_id)"
    PRODUCTS ||--o{ CART_ITEMS : "referenced_in (product_id)"
    PRODUCTS ||--o{ WISHLIST_ITEMS : "referenced_in (product_id)"

    PROFILES {
        uuid id PK "References auth.users.id"
        text role "CHECK role IN ('customer','admin','student')"
        text username "Customer display name"
        text email "User email address"
        text mobile "Contact phone number"
        text mobile_number "Alias for mobile"
        text address "Default shipping address"
        timestamp created_at "Record creation timestamp"
    }

    CUSTOMERS {
        uuid id PK "Customer identifier or profiles.id"
        uuid user_id FK "References auth.users.id"
        text name "Full name"
        text email "Customer email address"
        text phone "Customer mobile number"
        text address "Physical delivery address"
        timestamp created_at "Record timestamp"
    }

    PRODUCTS {
        bigint id PK "Auto-incrementing product ID"
        text name "Product title"
        text description "Detailed product specifications"
        numeric price "Discounted selling price (INR)"
        numeric mrp "Maximum Retail Price (INR)"
        integer stock_quantity "Available stock count"
        text category "Category (Electronics, Fashion, etc.)"
        text status "Status ('active' / 'inactive')"
        text image_url "URL path to image (/images/... or CDN)"
        text delivery_date "Estimated delivery timeframe"
        uuid user_id FK "Admin user who added product"
        timestamp created_at "Catalog entry timestamp"
    }

    ORDERS {
        bigint id PK "Auto-incrementing order ID"
        uuid user_id FK "References auth.users.id"
        text customer_name "Recipient full name"
        text customer_phone "Primary contact phone"
        text phone "Secondary phone column alias"
        text address "Delivery destination"
        text payment_method "Payment mode (COD, UPI, Card, Net Banking)"
        numeric total_amount "Order final total (INR)"
        numeric total "Total column alias"
        jsonb items "JSON array of line items [id, name, price, qty, image_url]"
        text status "Status ('Pending', 'Packed', 'Shipped', 'Delivered', 'Cancelled')"
        timestamp created_at "Order placement timestamp"
    }

    REVIEWS {
        bigint id PK "Auto-incrementing review ID"
        bigint product_id FK "References products.id"
        uuid user_id FK "References auth.users.id"
        integer rating "Star rating score (1 to 5)"
        text comment "Customer feedback text"
        timestamp created_at "Submission timestamp"
    }

    CART_ITEMS {
        bigint id PK "Auto-incrementing cart item ID"
        uuid user_id FK "References auth.users.id"
        bigint product_id FK "References products.id"
        integer quantity "Item quantity count"
        timestamp created_at "Timestamp"
    }

    WISHLIST_ITEMS {
        bigint id PK "Auto-incrementing wishlist item ID"
        uuid user_id FK "References auth.users.id"
        bigint product_id FK "References products.id"
        timestamp created_at "Timestamp"
    }
```

---

## 9. Supabase Backend Infrastructure & Storage

The application relies on Supabase as its unified Backend-as-a-Service (BaaS):

1. **PostgREST Gateway**: Enables the frontend SPA to perform relational SQL queries, joins (e.g. `cart_items` joining `products(*)`), updates, and insertions directly using `@supabase/supabase-js`.
2. **Supabase Auth**: Manages JSON Web Tokens (JWT), session lifecycles, encrypted password storage, and recovery tokens.
3. **Supabase Storage Bucket (`products-image`)**: Dedicated binary asset bucket utilized by the Admin portal (`src/pages/admin.jsx`). When an administrator selects a local image file during product creation:
   * A unique file key is generated: `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`.
   * Uploaded via `supabase.storage.from('products-image').upload(fileName, file)`.
   * The public retrieval URL is obtained via `supabase.storage.from('products-image').getPublicUrl(fileName).data.publicUrl` and committed to `products.image_url`.

---

## 10. Row-Level Security (RLS) & Access Control Policies

To safeguard customer privacy and administrative integrity, PostgreSQL Row-Level Security (RLS) policies are active across the database tables:

* **Profiles Table**:
  ```sql
  CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

  CREATE POLICY "Users can view profiles"
  ON profiles FOR SELECT
  USING (true);

  CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);
  ```
* **Customers Table**:
  ```sql
  CREATE POLICY "Users can insert their own customer record"
  ON customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);
  ```
* **Cart Items & Wishlist Items**:
  Scoped strictly to the authenticated user's UUID:
  ```sql
  CREATE POLICY "User cart isolation"
  ON cart_items FOR ALL
  USING (auth.uid() = user_id);

  CREATE POLICY "User wishlist isolation"
  ON wishlist_items FOR ALL
  USING (auth.uid() = user_id);
  ```
* **Orders Table**:
  Customers insert new orders referencing their `auth.uid()`, while administrators query and update all orders across the enterprise.

---

## 11. Database Triggers, Functions & Constraints

* **Role Validation Constraint**:
  The `profiles` table enforces strict role validity via the constraint `profiles_role_check`:
  ```sql
  ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('customer', 'admin', 'student'));
  ```
* **Trigger Resolution**:
  Earlier database migrations contained blocking triggers on `auth.users` that caused signup transactions to fail. As documented in `test-pg.js`, legacy user-creation triggers on `auth.users` were dropped to allow graceful client-driven profile provisioning:
  ```sql
  DROP TRIGGER IF EXISTS "on_auth_user_created" ON auth.users;
  ```

---

## 12. Authentication & Authorization Flow (RBAC)

The authentication workflow is governed by `src/pages/auth.jsx`. The page includes a dual-mode interface toggling between **Sign In** and **Sign Up**, with an interactive role selection dropdown:

```mermaid
sequenceDiagram
    autonumber
    actor User as User / Administrator
    participant AuthUI as auth.jsx
    participant SupabaseAuth as Supabase Auth
    participant ProfilesDB as profiles Table
    participant Router as React Router

    alt User Signs Up as Customer
        User->>AuthUI: Enter Name, Mobile, Email, Password, Role='customer'
        AuthUI->>SupabaseAuth: signUp({ email, password, data: { fullName, mobile, role } })
        SupabaseAuth-->>AuthUI: Return User Session
        AuthUI->>ProfilesDB: INSERT INTO profiles (id, name, mobile, email, role)
        AuthUI->>Router: Navigate to /dashboard -> /shop
    else User Signs Up as Admin
        User->>AuthUI: Enter Details, Role='admin', Admin Invite Code
        alt Invite Code != 'NOVA-2026'
            AuthUI-->>User: Show Error: "Invalid Admin Invite Code"
        else Invite Code == 'NOVA-2026'
            AuthUI->>SupabaseAuth: signUp({ email, password, data: { role: 'admin' } })
            AuthUI->>ProfilesDB: INSERT INTO profiles (id, name, mobile, email, role='admin')
            AuthUI->>Router: Navigate to /dashboard -> /admin/dashboard
        end
    else User Logs In
        User->>AuthUI: Enter Email, Password, Selected Role
        AuthUI->>SupabaseAuth: signInWithPassword({ email, password })
        SupabaseAuth-->>AuthUI: Return User Token
        AuthUI->>ProfilesDB: SELECT role FROM profiles WHERE id = user.id
        ProfilesDB-->>AuthUI: Return DB Role
        alt Selected Role != DB Role
            AuthUI->>SupabaseAuth: signOut()
            AuthUI-->>User: Show Error: "You are not an Admin/Customer"
        else Selected Role == DB Role
            AuthUI->>Router: Navigate to role dashboard (/admin or /shop)
        end
    end
```

---

## 13. Dynamic Dashboard Redirection Engine

Located in `src/App.js` as the `DashboardRedirect()` component, this engine acts as the central traffic controller for authenticated traffic:

1. When a user requests `/dashboard` or logs in, `DashboardRedirect` invokes `supabase.auth.getSession()`.
2. If no valid session exists, the visitor is redirected immediately to `/login`.
3. If an active session is found, it queries `supabase.from('profiles').select('role').eq('id', user.id).single()`.
4. Fallback role resolution checks `user.user_metadata?.role || 'customer'`.
5. If `role === 'admin'`, the component replaces the history stack with `/admin`.
6. Otherwise, it routes the shopper directly to the storefront at `/shop`.

---

## 14. Global State Management (`CartContext`)

Cart state is centralized across the application using React Context in `src/context/CartContext.js`.

### Exposed Context API
```javascript
const { cart, addToCart, updateQty, removeFromCart, clearCart, cartTotal } = useCart();
```

### Key Technical Mechanisms
* **Optimistic Local Updates**: When adding an item or modifying quantities, local React state is mutated immediately to guarantee a zero-latency UI response.
* **Database Synchronization**: Parallel asynchronous calls persist mutations to the Supabase table `cart_items` (`insert`, `update`, or `delete`).
* **Session Wipe**: Listening to `supabase.auth.onAuthStateChange`, the provider wipes in-memory cart state upon signout to eliminate cross-account data leaks.

---

## 15. End-to-End E-Commerce Customer Journey

```mermaid
flowchart LR
    subgraph Discovery ["1. Discovery & Browsing"]
        S1["Visit Landing Page<br/>(Explore Trending Items)"] --> S2["Filter Catalog<br/>(Category & Price Ranges)"]
    end

    subgraph Authentication ["2. Authentication"]
        S2 --> S3["Sign In / Register<br/>(Role: Customer)"]
        S3 --> S4["Redirect to Shop Portal<br/>(/shop)"]
    end

    subgraph Selection ["3. Item Selection"]
        S4 --> S5["View Product Details & Reviews<br/>(/product/:id)"]
        S5 --> S6["Add to Cart & Wishlist<br/>(Synced to Supabase)"]
    end

    subgraph Checkout ["4. Checkout & Payment"]
        S6 --> S7["Open Cart & Checkout<br/>(Fill Address & Contact)"]
        S7 --> S8["Simulate Payment<br/>(COD, UPI, Card, Net Banking)"]
    end

    subgraph Fulfillment ["5. Order & Invoice"]
        S8 --> S9["Order Confirmation<br/>(Order Placed)"]
        S9 --> S10["Track Order Pipeline<br/>(Pending -> Delivered)"]
        S10 --> S11["Download PDF Invoice<br/>(Client-Side jsPDF)"]
    end
```

---

## 16. Product Catalog, Multi-Filter & Search Engine

Located in `src/pages/shop.jsx`, the catalog offers comprehensive filtering:

* **Category Selection**:
  * `For You` (All categories)
  * `Electronics`
  * `Fashion`
  * `Home & Kitchen`
  * `Beauty`
* **Real-Time Keyword Search**: Matches against `product.name` and `product.description` case-insensitively.
* **Price Tier Filtering**:
  * `under1000`: Products under ₹1,000.
  * `1000to5000`: Products between ₹1,000 and ₹5,000.
  * `over5000`: Luxury and premium products above ₹5,000.
* **Sorting Capabilities**:
  * `new`: Default ID descending order.
  * `low`: Ascending price order.
  * `high`: Descending price order.

---

## 17. Product Detail View & Recommendation Engine

Accessible via `/product/:id` (`src/components/ProductDetail.jsx`):

* Displays full-resolution product imagery, title, pricing, MRP, calculated discount tag, and stock status.
* **Category Recommendation Algorithm**: Queries Supabase for related products within the identical category, excluding the current product ID:
  ```javascript
  const { data: recs } = await supabase
    .from('products')
    .select('*')
    .eq('category', data.category)
    .neq('id', data.id)
    .limit(8);
  ```
* Seamless "Add to Cart" and direct checkout execution.

---

## 18. Product Reviews & Customer Rating System

Also hosted in `src/components/ProductDetail.jsx`:

* Fetches all reviews joined with reviewer profiles:
  ```javascript
  supabase.from('reviews').select('*, profiles(username)').eq('product_id', id);
  ```
* Computes real-time average star ratings and dynamic distribution breakdown bars (5-star down to 1-star).
* Authenticated users can write a review by submitting a star rating (1–5) and feedback comment.

---

## 19. Database-Backed Shopping Cart Synchronization

The shopping cart eliminates ephemeral client storage bugs:

1. When a customer adds an item, `CartContext.js` queries `cart_items` for `(user_id, product_id)`.
2. If already present, it executes `.update({ quantity: newQty })`.
3. If new, it executes `.insert([{ user_id, product_id, quantity: 1 }])`.
4. When orders are finalized, `clearCart()` executes `.delete().eq('user_id', userId)`.

---

## 20. Persistent User Wishlist Management

Implemented in `src/pages/shop.jsx`:

* Stored in the `wishlist_items` table.
* Toggling the heart icon checks existing records for `(user_id, product_id)`.
* Adds or removes items instantly with optimistic state updates and toast notifications.
* Wishlist counter badge displayed in the navigation sidebar.

---

## 21. Multi-Step Checkout Workflow

Located in `src/components/checkout.jsx`, the checkout process uses an accordion interface:

* **Step 1: Delivery Address & Personal Details**:
  * Full Name (required)
  * Mobile Phone Number (required)
  * Delivery Address (required)
* **Step 2: Payment Method Selection**:
  * Cash On Delivery (COD)
  * UPI
  * Credit / Debit Card
  * Net Banking
* **Order Summary Sidebar**: Shows line items, subtotal, delivery fee calculation (free delivery), and grand total.

---

## 22. Simulated Payment Processing Gateway

When selecting **Credit / Debit Card** in `checkout.jsx`:

1. An interactive payment modal prompts for Card Number, Expiry Date, and CVV.
2. Validates card length (16 digits required) and field completeness.
3. Simulates gateway communication with an animated spinner for 2.5 seconds.
4. Triggers an authorized confirmation state for 1.5 seconds before committing the order to the database.

---

## 23. Order Placement & Database Schema

Upon order confirmation, `placeOrder()` in `checkout.jsx` inserts a structured record into the `orders` table:

```javascript
await supabase.from('orders').insert([{
  user_id: session.user.id,
  customer_name: name,
  customer_phone: phone,
  phone: phone,
  address: address,
  payment_method: payment,
  total_amount: cartTotal,
  total: cartTotal,
  items: cart, // JSON array of item objects
  status: 'Pending'
}]);
```

---

## 24. Visual Order Tracking Timeline & Status Lifecycle

In `src/pages/CustomerOrders.jsx`, each order card includes an interactive tracking timeline indicating fulfillment status:

```
[1. Pending] -------> [2. Packed] -------> [3. Shipped] -------> [4. Delivered]
```

* Steps completed display green background badges with checkmarks (`✓`).
* A connecting progress bar fills dynamically based on status progress percentage (0%, 33%, 66%, 100%).
* Orders marked `Cancelled` by administrators display distinct red warning tags.

---

## 25. Automated PDF Invoice & Receipt Generation (`jsPDF`)

Available in both `src/pages/CustomerOrders.jsx` and `src/pages/admin.jsx`:

* Instantiates `const doc = new jsPDF()`.
* Generates an official corporate invoice containing:
  * Document header and title.
  * Shortened 8-character Invoice Identifier (`Invoice ID: #...`).
  * Creation date timestamp.
  * Customer Name and Delivery Address.
  * Fulfillment Status.
  * Itemized line totals and Grand Total in INR.
* Executes `doc.save('Invoice-<id>.pdf')` triggering a direct browser file download.

---

## 26. Customer Account Hub & Navigation Portal

Rendered at `/account` (`src/pages/AccountHub.jsx`), this portal provides four quick-action cards:

1. **Your Orders** (`/account/orders`): View recent order history, check timeline statuses, and download invoices.
2. **Login & Security** (`/account/edit?section=security`): Update full name and registered phone number.
3. **Your Addresses** (`/account/edit?section=address`): Manage default physical delivery address.
4. **Contact Us** (`/account/contact`): Direct support contact options and customer inquiry form.

---

## 27. Profile Information & Address Management

Located in `src/pages/CustomerProfileEdit.jsx`:

* Adapts dynamically based on the URL query parameter (`?section=security` vs `?section=address`).
* Pre-populates existing user metadata and profile attributes from the `profiles` table.
* Commits updates (`username`, `mobile_number`, `address`) directly to `profiles` via Supabase RLS.

---

## 28. Customer Orders History & Reordering Portal

In `src/pages/CustomerOrders.jsx`:

* Fetches orders by `user_id`, with a secondary query fallback by `phone` to ensure legacy orders placed during phone checkouts remain accessible.
* Deduplicates retrieved orders and sorts them chronologically (newest first).
* Displays items purchased, quantities, pricing, order date, delivery address, and action buttons.

---

## 29. Customer Support & Contact Us Workflow

Implemented in `src/pages/ContactUs.jsx`:

* **Support Phone**: `7569817633` (Available 24/7)
* **Support Email**: `ankithkanchala06@gmail.com` (Replies within 2 hours)
* **Corporate Headquarters**: `krupanandha nagar, Anantapur, 515001`
* **Inquiry Submission**: Includes inquiry subject selection (Order Tracking, Returns, Product Info, Other), optional Order ID, message body, and success confirmation state.

---

## 30. Admin Control Portal & Capabilities Overview

The administrative control center is housed in `src/pages/admin.jsx` (861 lines of production code) and organized across four core views:

1. **Dashboard View**: High-level financial KPIs, revenue calculations, and Recharts graphical analysis.
2. **Products View**: Complete product catalog inventory table and grid, search, category filter, and modal forms.
3. **Orders View**: Master order fulfillment table with status update dropdowns and invoice downloads.
4. **Customers View**: Registered customer directory with order volume metrics and lifetime value calculations.

---

## 31. Real-Time Business Analytics & KPI Dashboard (`Recharts`)

The Dashboard view calculates executive metrics from live database records:

* **Total Revenue**: Sum of `total_amount` for all orders excluding `Cancelled`.
* **Total Orders**: Count of all system orders.
* **Total Products**: Count of active and inactive catalog items.
* **Low Stock Alerts**: Count of items with `stock_quantity < 10`.
* **Category Breakdown BarChart**: Displays distribution across electronics, apparel, and home goods.
* **Order Status PieChart**: Visualizes fulfillment distribution (`Pending`, `Packed`, `Shipped`, `Delivered`).

---

## 32. Product Inventory & Catalog Management (CRUD)

Administrators have full CRUD control over the product catalog:

* **Create**: Opens `ProductModal` to define title, category, price, stock quantity, description, status, and upload an image.
* **Read**: Toggle between table view and visual grid cards, with real-time text search and status filters.
* **Update**: Pre-populates `ProductModal` with existing product attributes for instant editing.
* **Delete**: Prompts for confirmation before calling `.delete().eq('id', product.id)`.

---

## 33. Product Image Upload Pipeline (`products-image` Bucket)

Detailed in `src/pages/admin.jsx`:

```javascript
const uploadImage = async (file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;

  const { error: uploadError } = await supabase.storage
    .from('products-image')
    .upload(fileName, file, { upsert: false });

  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('products-image').getPublicUrl(fileName);
  return data.publicUrl;
};
```

---

## 34. Admin Order Management & Fulfillment Pipeline

In the Orders view of `admin.jsx`:

* Lists all customer orders with customer name, phone, items list, total amount, and creation date.
* **Fulfillment Pipeline Updates**: Selecting a new status from the dropdown updates `orders.status` in Supabase:
  ```javascript
  await supabase.from('orders').update({ status }).eq('id', orderId);
  ```
* Invoices can be downloaded directly from the orders table.

---

## 35. Admin Customer Intelligence & Spend Analytics

Accessible through `src/pages/Customers.jsx` and the Customers view of `admin.jsx`:

* Fetches all user profiles where `role = 'customer'`.
* Correlates profiles with all corresponding records in `orders` where `orders.user_id === customer.id`.
* Aggregates:
  * **Total Orders**: Count of orders placed by customer.
  * **Total Spend (LTV)**: Sum of `order.total_amount` placed by customer.
* Includes a detail modal displaying complete customer contact information and order history.

---

## 36. Admin Manual Order & Customer Creation

* **Manual Customer Modal**: Allows administrators to provision customer accounts directly with name, email, phone, and delivery address.
* **Manual Order Modal**: Enables administrators to construct telephone or offline orders by selecting a registered customer, adding products and quantities, and saving directly to the database.

---

## 37. Admin Profile & Session Inspection

Accessible via the lower sidebar profile badge in `src/pages/admin.jsx`:

* Displays administrator display name, email, registered mobile number, and role badge.
* Includes an administrative session signout button that terminates the Supabase auth session and returns the user to the landing page.

---

## 38. UI/UX Design System & Dark Mode Aesthetics

NovaBoard uses a custom dark theme across its storefront:

* **Background Palette**: Deep obsidian (`#060608`) and dark slate surface panels (`#121217`, `#1c1c24`).
* **Brand Accents**: Royal Indigo (`#6366f1`) to Vivid Purple (`#a855f7`) linear gradients.
* **Glassmorphism**: Backdrop blur filters (`backdrop-filter: blur(16px)`), subtle translucent borders (`rgba(255, 255, 255, 0.05)`), and glow drop-shadows.

---

## 39. CSS Architecture, Design Tokens & Tailwind Configuration

Defined in `src/index.css` and `tailwind.config.js`:

```css
:root {
  --bg-main: #060608;
  --bg-surface: #121217;
  --bg-surface-hover: #1c1c24;
  --primary-accent: #6366f1;
  --secondary-accent: #a855f7;
  --text-main: #f8fafc;
  --text-muted: #94a3b8;
  --border-color: rgba(255, 255, 255, 0.08);
  --glass-bg: rgba(255, 255, 255, 0.03);
  --glass-border: rgba(255, 255, 255, 0.05);
  --gradient-brand: linear-gradient(135deg, var(--primary-accent), var(--secondary-accent));
  --shadow-glow: 0 0 20px rgba(99, 102, 241, 0.15);
}
```

---

## 40. Responsive & Mobile Design Strategy

* **Grid Layouts**: Flexible Tailwind grid rules (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4`).
* **Sidebars & Drawers**: Cart and wishlist slide-out panels with full-width viewports on smaller screens.
* **Touch Targets**: Buttons and input controls designed with comfortable touch target heights (48px minimum).

---

## 41. Security Architecture & Credential Protection

### Current Verified Implementation
* Supabase client initialization in `src/supabaseClient.js` currently uses hardcoded project URL and anonymous key.
* Diagnostic scripts (`fix-everything.js`, `test-pg.js`) contain direct PostgreSQL connection strings.

### Recommended Production Configuration
To follow security best practices, sensitive credentials should be migrated to environment variables:
* Store `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` in `.env.local` (ignored by git).
* Never expose the Supabase `SERVICE_ROLE_KEY` or direct PostgreSQL database password in client bundles. Service role keys bypass RLS and should only be used in secure backend environments.

---

## 42. Data Validation & Client/Server Error Handling

* **Email Regex**: Validates email format (`/^[^\s@]+@[^\s@]+\.[^\s@]+$/`).
* **Password Constraint**: Enforces a minimum length of 6 characters.
* **Admin Verification**: Checks invite code against `NOVA-2026`.
* **Card Validation**: Verifies card length (16 digits required) and presence of expiry and CVV.
* **Error Sanitization**: Extracts clear error messages from Supabase exceptions to avoid showing empty `{}` objects to users.

---

## 43. Image Asset Pipeline & Local Media Assets

The `public/images/` directory includes 26 pre-bundled product images:

* **Electronics**: Smart monitors, external hard drives, smartphones, noise-cancelling headphones, smart watches.
* **Fashion**: Jackets, winter coats, backpacks, casual t-shirts, running shoes.
* **Home & Kitchen**: Non-stick cookware sets, Egyptian cotton bedsheets, geometric area rugs, table lamps, air purifiers, oil diffusers.
* **Jewelry & Beauty**: Dragon station chain bracelets, princess necklaces, earrings.

---

## 44. Environment Variables & Secret Configuration

Create a `.env` file in the project root:

```env
# Supabase Public Configuration (Exposed to client bundle)
REACT_APP_SUPABASE_URL=https://zzcrhiawxhrdwnwauape.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Administrative & Database Tooling Configuration (Backend/Scripts only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
DATABASE_URL=postgresql://postgres:password@db.zzcrhiawxhrdwnwauape.supabase.co:5432/postgres
```

---

## 45. Prerequisites & System Requirements

* **Node.js**: `v18.x` or `v20.x` (LTS recommended)
* **Package Manager**: `npm` (`v9.x` or `v10.x`)
* **Operating System**: Windows 10/11, macOS, or modern Linux distribution
* **Browser**: Modern evergreen browser (Chrome, Edge, Firefox, Safari)

---

## 46. Step-by-Step Installation & Dependency Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/ankitha2910/E-commerce_website-order_management.git
   cd novaboard
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

---

## 47. Local Development Execution Guide

Start the local development server:

```bash
npm start
```

The application will compile and launch on `http://localhost:3000`. Changes saved to files will trigger automatic hot reloading.

---

## 48. Database Setup, Schema Migration & Constraints

Run the following SQL script in your Supabase SQL Editor to set up the required tables and constraints:

```sql
-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'customer',
  username TEXT,
  name TEXT,
  email TEXT,
  mobile TEXT,
  mobile_number TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT profiles_role_check CHECK (role IN ('customer', 'admin', 'student'))
);

-- 2. Customers Table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Products Table
CREATE TABLE IF NOT EXISTS products (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  mrp NUMERIC,
  stock_quantity INTEGER DEFAULT 0,
  category TEXT,
  status TEXT DEFAULT 'active',
  image_url TEXT,
  delivery_date TEXT,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  customer_name TEXT,
  customer_phone TEXT,
  phone TEXT,
  address TEXT,
  payment_method TEXT,
  total_amount NUMERIC NOT NULL,
  total NUMERIC,
  items JSONB,
  status TEXT DEFAULT 'Pending',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Cart Items Table
CREATE TABLE IF NOT EXISTS cart_items (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Wishlist Items Table
CREATE TABLE IF NOT EXISTS wishlist_items (
  id BIGINT GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 49. Database Utility, Diagnostic & Maintenance Scripts

The project includes several diagnostic and maintenance scripts in the root directory:

* `node check-constraint.js`: Connects via `pg` and verifies definitions of `profiles_role_check`.
* `node fix-everything.js`: Drops and recreates the role check constraint, configures RLS insert policies, and backfills missing profiles from `auth.users`.
* `node fix-rls.js`: Configures RLS insert policies for `profiles` and `customers`.
* `node test-admin.js`: Tests user creation using the Supabase Service Role Admin API.
* `node test-db.js`: Inspects `profiles`, `customers`, and `admins` tables using `@supabase/supabase-js`.
* `node test-pg.js`: Identifies and drops blocking triggers on `auth.users`.
* `node test-phone.js`: Tests creating user records using phone numbers.
* `node test-signup.js`: Runs an automated test of the customer signup flow.
* `node test-triggers.js`: Queries `information_schema.triggers` for active triggers.
* `node scratch-download-images.js` / `scratch-download-images2.js` / `scratch-download-real-images.js`: Media download scripts that fetch product images and update image URLs in PostgreSQL.
* `node scratch-copy-generated.js`: Copies generated asset files to `public/images/`.

---

## 50. Testing Strategy, Test Execution & Known Issues

### Test Runner Execution
Execute the test suite using:
```bash
npm test -- --watchAll=false
```

### Verified Test Suite Result
```
FAIL src/App.test.js
  ● Test suite failed to run

    Cannot find module 'react-router/dom' from 'node_modules/react-router-dom/dist/index.js'

      at Resolver.resolveModule (node_modules/jest-resolve/build/resolver.js:324:11)
      at Object.<anonymous> (node_modules/react-router-dom/dist/index.js:38:18)
      at Object.<anonymous> (src/App.js:1:1)
      at Object.<anonymous> (src/App.test.js:2:1)
```

### Root Cause & Resolution
`react-router-dom` v7 uses ES module package export maps that Jest in `react-scripts 5.0.1` does not resolve by default. To resolve this:
1. Configure `moduleNameMapper` in Jest to map `^react-router/dom$` to the appropriate distribution build.
2. Update `src/App.test.js` to render `<App />` within a test harness, replacing the default "learn react" assertion with NovaBoard-specific assertions.

---

## 51. Production Build & Asset Optimization

Generate an optimized production build:

```bash
npm run build
```

### Verified Production Build Output
```
Creating an optimized production build...

File sizes after gzip:
  400.11 kB  build/static/js/main.cf0f22e0.js
  46.35 kB   build/static/js/239.87ae253b.chunk.js
  43.31 kB   build/static/js/455.8e98e874.chunk.js
  10.49 kB   build/static/js/977.e7fab808.chunk.js
  6.58 kB    build/static/css/main.7855bdf1.css
  1.76 kB    build/static/js/453.9ba69f20.chunk.js
```

Serve the production build locally:
```bash
npx serve -s build
```

---

## 52. Web Vitals & Frontend Performance Optimization

* **Performance Monitoring**: Configured in `src/reportWebVitals.js` to track Cumulative Layout Shift (CLS), First Input Delay (FID), and Largest Contentful Paint (LCP).
* **Chunking**: Webpack automatically splits large dependencies (`recharts`, `jspdf`, `@supabase/supabase-js`) into standalone asynchronous chunks.
* **CSS Minification**: Tailwind CSS purges unused utility classes during the production build, producing a compact stylesheet (6.58 kB gzipped).

---

## 53. Cross-Browser & Cross-Platform Compatibility

Configured in `package.json` under `browserslist`:

* **Production**: `>0.2%`, `not dead`, `not op_mini all`
* **Development**: Latest versions of Chrome, Firefox, and Safari
* **Supported Platforms**: Windows, macOS, Linux, iOS Safari, Android Chrome

---

## 54. Code Quality, ESLint Diagnostics & Static Analysis

ESLint runs automatically during build and development (`react-app` configuration).

### Verified Compiler Warnings
* `src/App.js` (Line 11): `'Login'` is imported but not rendered (the route uses `<Auth />`).
* `src/components/ProductDetail.jsx` (Line 23): `useEffect` has missing dependencies: `'fetchProduct'` and `'fetchReviews'`.
* `src/components/ProductDetail.jsx` (Lines 115, 267): `<img>` elements missing `alt` attribute.
* `src/pages/shop.jsx` (Line 43): `useEffect` has missing dependency: `'fetchUserProfile'`.

---

## 55. Troubleshooting & Common Pitfalls

### 1. "Invalid Admin Invite Code"
* **Issue**: Admin signups fail with an invite code error.
* **Resolution**: Use the verified invite code: `NOVA-2026`.

### 2. "new row for relation 'profiles' violates check constraint"
* **Issue**: Signup transactions fail due to role restrictions.
* **Resolution**: Run `node fix-everything.js` to update the check constraint to `CHECK (role IN ('customer', 'admin', 'student'))`.

### 3. "new row violates row-level security policy"
* **Issue**: Inserting into `profiles` or `customers` fails with an RLS error.
* **Resolution**: Run `node fix-rls.js` to configure the missing INSERT policies (`auth.uid() = id` on `profiles`, `auth.uid() = user_id` on `customers`).

### 4. "Cannot find module 'react-router/dom'" in Jest
* **Issue**: `npm test` fails during module resolution.
* **Resolution**: Add a custom Jest module mapper or configure Babel transforms for package export maps.

### 5. Images Not Displaying
* **Issue**: Product image thumbnails appear broken.
* **Resolution**: Verify that image files exist in `public/images/`. Run `node scratch-copy-generated.js` to ensure generated assets are in place.

---

## 56. Feature Implementation Audit (Implemented, Partial, Deprecated & Planned)

| Component / Subsystem | Path | Implementation Status | Notes |
| :--- | :--- | :--- | :--- |
| **Storefront Landing Showcase** | `src/pages/Landing.jsx` | Fully Implemented | Trending products, dark-mode theme, smooth scroll navigation |
| **Authentication & Role Redirection** | `src/pages/auth.jsx` | Fully Implemented | Login, registration, role checks, invite code validation |
| **Password Reset** | `src/pages/ResetPassword.jsx` | Fully Implemented | Token-based recovery session, password updates |
| **Catalog Browsing & Search** | `src/pages/shop.jsx` | Fully Implemented | Real-time search, price range filter, category tabs |
| **Database-Backed Cart** | `src/context/CartContext.js` | Fully Implemented | Synced with Supabase `cart_items`, optimistic updates |
| **Database-Backed Wishlist** | `src/pages/shop.jsx` | Fully Implemented | Synced with Supabase `wishlist_items` |
| **Product Detail & Recommendations** | `src/components/ProductDetail.jsx` | Fully Implemented | Category-based recommendations, rating distributions |
| **Customer Review Submission** | `src/components/ProductDetail.jsx` | Fully Implemented | Star rating selector, text comments, database sync |
| **Multi-Step Checkout Flow** | `src/components/checkout.jsx` | Fully Implemented | Delivery address, payment mode selection, order summary |
| **Simulated Payment Gateway** | `src/components/checkout.jsx` | Fully Implemented | Card length checks, animated processing states |
| **Order Placement** | `src/components/checkout.jsx` | Fully Implemented | Saves order to `orders` table, clears active cart |
| **Order Tracking Timeline** | `src/pages/CustomerOrders.jsx` | Fully Implemented | Visual 4-step progress tracker (`Pending` to `Delivered`) |
| **PDF Invoice Generation** | `CustomerOrders.jsx` / `admin.jsx` | Fully Implemented | Vector PDF generation using `jsPDF` |
| **Customer Account Hub** | `src/pages/AccountHub.jsx` | Fully Implemented | 4 quick-action navigation cards |
| **Customer Profile & Address Edit** | `src/pages/CustomerProfileEdit.jsx`| Fully Implemented | Saves name, phone, and address to `profiles` |
| **Customer Order History** | `src/pages/CustomerOrders.jsx` | Fully Implemented | Fetches orders by `user_id` and fallback by `phone` |
| **Admin Analytics Dashboard** | `src/pages/admin.jsx` | Fully Implemented | Recharts BarChart & PieChart, financial KPIs |
| **Admin Product Management** | `src/pages/admin.jsx` | Fully Implemented | Create, read, update, delete products; image upload |
| **Admin Order Status Updates** | `src/pages/admin.jsx` | Fully Implemented | Status updater dropdown, table view, PDF download |
| **Admin Customer Spend Analytics** | `src/pages/Customers.jsx` | Fully Implemented | Aggregates order counts and lifetime value |
| **Support Contact Form** | `src/pages/ContactUs.jsx` | Partially Implemented | Form displays success state via timeout (no email dispatch) |
| **Alternative Login Component** | `src/components/login.jsx` | Unused | Imported in `App.js` but `/login` routes to `auth.jsx` |
| **Legacy Orders Component** | `src/components/Orders.jsx` | Superseded | Routed at `/orders`, replaced by `CustomerOrders.jsx` |
| **Standalone Product Card** | `src/components/ProductCard.jsx` | Unused | Light-theme component; pages use inline dark-mode cards |
| **Root Admin Prototype** | `app.js` | Deprecated | Early prototype replaced by `src/pages/admin.jsx` |
| **Root Placeholder Auth File** | `pages/auth.jsx` | Deprecated / Orphaned | 0-byte file located outside the `src/` directory |
| **Jest Unit Test Suite** | `src/App.test.js` | Incomplete | Contains default CRA test; requires router mock update |

---

## 57. Contributing Guidelines, Authors, License & Acknowledgments

### Author & Maintainer
* **Author**: Ankitha Kanchala ([@ankitha2910](https://github.com/ankitha2910))
* **Contact Email**: `ankithkanchala06@gmail.com`
* **Repository**: [https://github.com/ankitha2910/E-commerce_website-order_management](https://github.com/ankitha2910/E-commerce_website-order_management)

### Contributing Guidelines
1. Fork the repository.
2. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Commit your changes following standard commit conventions:
   ```bash
   git commit -m "feat: describe your feature"
   ```
4. Push to your branch and open a Pull Request against the `main` branch.

### License
This project is open-source software distributed under the **MIT License**.

### Acknowledgments
* [Supabase](https://supabase.com/) for backend database, authentication, and storage infrastructure.
* [Create React App](https://github.com/facebook/create-react-app) for the React application harness.
* [Lucide](https://lucide.dev/) for icon designs.
* [Recharts](https://recharts.org/) for composable chart components.
* [jsPDF](https://github.com/parallax/jsPDF) for client-side PDF document generation.
