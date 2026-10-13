# CodeAlpha_Ecommerce_Store
### Full Stack Development Internship — Task 1

**Intern Name:** REDEEMER JERREY KOW WILLIAMS  
**Student ID:** CA/DF1/320453  
**Domain:** Full Stack Web Development  
**Batch:** 20th October 2026 to 20th November 2026  
**Company:** [CodeAlpha](https://www.codealpha.tech)

---

## 📌 Project Overview
**Apex Store** is a responsive, feature-rich Full-Stack E-commerce web application developed to fulfill Task 1 of the CodeAlpha Full Stack Development Internship. 

The application provides customers with a seamless online shopping experience, including dynamic product listings, search & category filters, interactive product detail modals, a real-time cart drawer, user authentication (JWT + Bcrypt), and a robust checkout & order processing system backed by persistent storage.

---

## 🚀 Key Features

1. **Product Catalog & Details:**
   - Filter by categories (Electronics, Fashion, Home) and sort by price/rating.
   - Live search by product name, description, and tags.
   - Interactive product quick-view modal with high-res imagery, rating reviews, and stock count.

2. **Persistent Shopping Cart:**
   - Client-side cart persistence via `localStorage`.
   - Real-time subtotal, 8% tax calculation, and free shipping on orders above $150.
   - Quantity modification and single-click removal.

3. **User Authentication & Profiles:**
   - Secure User Registration and Login.
   - Passwords hashed using `bcryptjs`.
   - Stateless session management with JSON Web Tokens (`JWT`).

4. **Order Processing & Fulfillment:**
   - Comprehensive checkout form (shipping details, address validation, payment selector).
   - Server-side price recalculation and order validation.
   - Order history tracking per authenticated user.

5. **Responsive & Modern UI:**
   - Built with pure CSS3 modern design (grid, flexbox, glassmorphism, responsive navigation).
   - FontAwesome iconography and Plus Jakarta Sans typography.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+), FontAwesome
- **Backend:** Node.js, Express.js REST API
- **Authentication:** JSON Web Tokens (`jsonwebtoken`), `bcryptjs`
- **Database:** File-backed persistent JSON database (`users.json`, `products.json`, `orders.json`)

---

## 🏁 Quick Start Guide

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/CodeAlpha_Ecommerce_Store.git
   cd CodeAlpha_Ecommerce_Store
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Launch the development server:
   ```bash
   npm start
   ```

4. Open your browser and navigate to:
   ```text
   http://localhost:3000
   ```

---

## 📡 REST API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/products` | Fetch catalog with filters/search | No |
| `GET` | `/api/products/:id` | Fetch single product by ID | No |
| `POST` | `/api/auth/register` | Register new user account | No |
| `POST` | `/api/auth/login` | Log in and receive JWT token | No |
| `GET` | `/api/auth/me` | Fetch currently authenticated user | Yes |
| `POST` | `/api/orders` | Submit new customer order | Optional |
| `GET` | `/api/orders` | Retrieve authenticated user's orders | Yes |

---

## 📄 License
This project is submitted as part of the CodeAlpha Internship Program. Licensed under the MIT License.

