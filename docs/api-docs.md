# DukaanDost Lite - API Documentation

Base URL (local): `http://localhost:5000/api`

Protected routes need the header `Authorization: Bearer <token>` (the token comes from login).
Errors always look like `{ "message": "..." }`.

| Method | Endpoint | Access | Feature |
|--------|----------|--------|---------|
| POST | /api/auth/register | Public | F01 |
| POST | /api/auth/login | Public | F01 |
| GET | /api/auth/me | Logged in | F01 |
| GET | /api/settings | Public | F02 |
| PUT | /api/settings | Seller | F02 |
| GET | /api/products?category= | Public | F03 |
| GET | /api/products/:id | Public | F03 |
| POST | /api/products | Seller | F02 |
| PUT | /api/products/:id | Seller | F02 |
| DELETE | /api/products/:id | Seller | F02 |
| POST | /api/orders | Customer | F03 |
| GET | /api/orders/my | Customer | F04 |
| GET | /api/orders | Seller | F04 |
| PATCH | /api/orders/:id/status | Seller | F04 |
| PATCH | /api/orders/:id/cancel | Customer (owner) | F04 |
| POST | /api/chat | Public | F05 |
| POST | /api/reviews | Customer | F06 |
| GET | /api/products/:id/reviews | Public | F06 |
| GET | /api/reviews/stats | Seller | F06 (extra) |

## F01 - Authentication

### POST /api/auth/register
Creates a customer account (the role is never taken from the request).

Body:
```json
{ "name": "Ali Raza", "email": "ali@gmail.com", "phone": "03001234567", "password": "Abc@1234" }
```
Response `201`:
```json
{ "message": "Registered successfully", "user": { "id": "665f1c2e9b1d4a0012ab34cd", "name": "Ali Raza", "email": "ali@gmail.com", "phone": "03001234567", "role": "customer" } }
```
Errors: `400` validation (email format, allowed email domain, password length 6+ with one special character, phone `03XXXXXXXXX`), `409` email already registered.

### POST /api/auth/login
Body: `{ "email": "customer@test.com", "password": "Test@1234" }`

Response `200`:
```json
{ "token": "<jwt>", "user": { "id": "665f...", "name": "Test Customer", "email": "customer@test.com", "phone": "03111234567", "role": "customer" } }
```
Errors: `400` missing fields, `401` invalid email or password.

### GET /api/auth/me
Header: Bearer token. Response `200`: `{ "user": { "_id": "665f...", "name": "...", "email": "...", "phone": "...", "role": "customer" } }`

Errors: `401` no token or invalid/expired token.

## F02 - Store settings and products

### GET /api/settings
Response `200`:
```json
{ "storeName": "DukaanDost", "city": "Lahore", "whatsappNumber": "03001234567", "deliveryPolicy": "Free delivery above Rs. 5000...", "faqs": [ { "question": "Do you offer Cash on Delivery?", "answer": "Yes." } ] }
```

### PUT /api/settings (Seller)
Body: same fields as the response above (at least 3 FAQs). Response `200`: the saved settings.

Errors: `400` missing fields, invalid WhatsApp number, fewer than 3 FAQs; `401`; `403` not a seller.

### GET /api/products?category=Kurtas
Response `200`: array of products (all products when `category` is omitted).
```json
[ { "_id": "665f...", "title": "Red Cotton Kurta", "description": "...", "price": 2500, "stock": 19, "category": "Kurtas", "images": ["https://..."], "averageRating": 4.5, "createdAt": "2026-10-01T10:00:00.000Z" } ]
```

### GET /api/products/:id
Response `200`: one product (same shape as above). Errors: `404` not found, `400` invalid id.

### POST /api/products (Seller)
Body:
```json
{ "title": "Red Cotton Kurta", "description": "Soft cotton kurta", "price": 2500, "stock": 10, "category": "Kurtas", "images": ["https://example.com/kurta.jpg"] }
```
Response `201`: the created product. Errors: `400` (empty required fields, price must be greater than 0, stock cannot be negative, at least one image), `401`, `403`.

### PUT /api/products/:id (Seller)
Body: same as POST. Response `200`: the updated product. Errors: `400`, `401`, `403`, `404`.

### DELETE /api/products/:id (Seller)
Response `200`: `{ "message": "Product deleted" }`. Errors: `401`, `403`, `404`.

## F03 / F04 - Orders

### POST /api/orders (Customer)
The browser sends only product ids and quantities; prices and titles are read from the database. Stock is reduced when the order is placed.

Body:
```json
{ "items": [ { "product": "665f...", "quantity": 2 } ], "shippingAddress": { "name": "Ali Raza", "phone": "03001234567", "city": "Lahore", "address": "House 1, Street 2" } }
```
Response `201`:
```json
{ "_id": "665f...", "orderNumber": "DD-1790873483919", "customer": "665f...", "items": [ { "product": "665f...", "title": "Red Cotton Kurta", "price": 2500, "quantity": 2 } ], "totalAmount": 5000, "paymentMethod": "Cash on Delivery", "shippingAddress": { "name": "Ali Raza", "phone": "03001234567", "city": "Lahore", "address": "House 1, Street 2" }, "status": "Pending", "createdAt": "2026-10-01T16:51:23.919Z" }
```
Errors: `400` (empty cart, missing address fields, invalid phone, not enough stock), `401`, `403`.

### GET /api/orders/my (Customer)
Response `200`: array of the logged-in customer's orders, newest first.

### GET /api/orders (Seller)
Response `200`: array of all orders; `customer` contains `name`, `email`, `phone`.

### PATCH /api/orders/:id/status (Seller)
Body: `{ "status": "Confirmed" }`

Allowed changes: Pending to Confirmed, Confirmed to Delivered, Pending to Cancelled. Cancelling returns the stock.

Response `200`: the updated order. Errors: `400` (for example `Cannot change status from Pending to Delivered`), `404`, `409`.

### PATCH /api/orders/:id/cancel (Customer, owner only)
No body. Works only while the order is Pending; the stock is returned.

Response `200`: the updated order. Errors: `400` `Only pending orders can be cancelled`, `404` (also when the order belongs to someone else).

## F05 - AI Store Assistant

### POST /api/chat
Body (the new message and the last 10 earlier messages):
```json
{ "message": "what is its price?", "history": [ { "role": "user", "content": "Do you have a red kurta?" }, { "role": "assistant", "content": "Yes, the Red Cotton Kurta is in stock." } ] }
```
Response `200`: `{ "reply": "The Red Cotton Kurta costs Rs. 2500." }`

Errors: `400` empty or too long message (max 500 characters); `502` `{ "message": "Sorry, the assistant is unavailable right now. Please try again in a moment or contact the store on WhatsApp." }` when the AI service fails.

## F06 - Reviews

### POST /api/reviews (Customer)
Only customers with a Delivered order containing the product can review it (one review per product).

Body: `{ "productId": "665f...", "rating": 5, "text": "Amazing quality!" }`

Response `201`:
```json
{ "_id": "665f...", "product": "665f...", "customer": { "_id": "665f...", "name": "Test Customer" }, "rating": 5, "text": "Amazing quality!", "sentiment": "positive", "createdAt": "2026-10-01T18:00:00.000Z" }
```
Errors: `400` (rating not 1 to 5, empty text), `403` no delivered order for this product, `404` product not found, `409` already reviewed.

### GET /api/products/:id/reviews
Response `200`: array of reviews for the product, newest first, each with `customer.name`, `rating`, `text`, `sentiment`.

### GET /api/reviews/stats (Seller)
Response `200`: `{ "positive": 3, "neutral": 1, "negative": 1, "unanalyzed": 0 }`