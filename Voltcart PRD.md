# Voltcart — Product Requirements Document

**Product:** Voltcart (gadget e-commerce web app) **Version:** 1.0 (QA practice build) **Owner:** Olayemi **Status:** For testing

## 1. Purpose

Voltcart lets a customer browse gadgets, build a cart, create an account, check out, and view past orders. This document defines exactly how each feature is meant to behave, so it can be used as the basis for test cases, a traceability matrix, and bug reports. Anything the live app does that contradicts this document is a candidate defect.

## 2. Scope

In scope: browsing, search/filter/sort, cart, coupons, registration/login, checkout, order confirmation, order history. Out of scope for v1: real payment processing, admin panel, product reviews, wishlists, email notifications, password reset.

## 3. User roles

- **Guest** — can browse, search, and add to cart, but must log in to check out.
- **Registered customer** — can check out and view their own order history.

## 4. Functional Requirements

### FR-01 Product catalog

- The catalog shows 12 products, each with name, category, price, stock level, and a thumbnail.
- Price is displayed in Naira, formatted with thousands separators (e.g. ₦520,000).
- An item with 0 stock is labeled "Out of stock" and its "Add to cart" control is disabled.

### FR-02 Search

- Typing in the search box filters the catalog by product name.
- Search is case-insensitive and matches partial names (e.g. "phone" matches "iPhone 13 128GB").
- If no product matches, the page shows a clear "no results" message that includes the search term.

### FR-03 Category filter

- A dropdown lists "All" plus every distinct category.
- Selecting a category shows only products in that category, combined with any active search term.

### FR-04 Sort

- Sorting by "Price: low to high" and "Price: high to low" orders products numerically by price, never alphabetically.

### FR-05 Cart — add/remove

- "Add to cart" adds one unit of a product, or increments quantity if it's already in the cart.
- A product cannot be added, or increased, beyond its available stock.
- Each cart line shows a quantity field the customer can edit directly.
- Quantity must be a whole number of 1 or more; the field rejects 0, negative numbers, and non-numeric input, and cannot exceed available stock.
- "Remove" deletes the line entirely.
- An empty cart shows a message and a link back to the shop.

### FR-06 Coupons

- Coupon codes are case-insensitive. Valid codes: `SAVE10` (10% off subtotal), `WELCOME5` (5% off subtotal).
- An invalid code shows an error and applies no discount.
- Only one discount may apply per cart at a time. Re-applying the same or a different valid code replaces the previous discount — it never stacks.

### FR-07 Delivery fee

- Delivery costs ₦2,000 per order.
- Delivery is free when the cart subtotal is **₦500,000 or more** (the ₦500,000 threshold itself qualifies for free delivery).

### FR-08 Order total

- Total = subtotal + delivery − discount, always. The total shown in the cart, at checkout, and on the confirmation page must match.

### FR-09 Registration

- Requires full name, a valid email address, and a password of at least 8 characters.
- A valid email must contain an "@" and a domain with a dot (e.g. `name@example.com`) — `a@b` is **not** valid.
- Registration fails with a clear error if the email is already registered.
- On success, the customer is automatically logged in.

### FR-10 Login

- Requires a registered email and matching password.
- Wrong email or wrong password shows one generic error ("Email or password is incorrect") — it must not reveal which field was wrong.

### FR-11 Session

- A logged-in customer's name appears in the header, replacing "Log in" with "Log out (name)".
- "Log out" ends the session and returns to the shop.
- Checkout is blocked for guests: attempting checkout while logged out redirects to login, and the customer returns to checkout (or is told to retry) after logging in.

### FR-12 Checkout form

- Required fields: recipient name, phone number, delivery address, payment method.
- Phone number must be exactly 11 digits, numeric only — letters or symbols are rejected.
- Address must be a real value (minimum length, not just whitespace).
- Payment method is chosen from: Card, Bank transfer, Pay on delivery. Checkout cannot proceed with no method selected.
- The total shown at checkout must equal the cart total at the moment checkout was entered.

### FR-13 Order confirmation

- Placing an order generates a unique order number and clears the cart and any applied coupon.
- The confirmation screen shows the order number and total paid.

### FR-14 Order history

- A logged-in customer sees only their own orders, most recent first.
- Each order shows order number, date, payment method, status, item list, and total.
- A customer with no orders sees a clear "no orders yet" message, not a blank page.
- A guest is prompted to log in rather than shown an empty or broken orders page.

## 5. Non-functional expectations

- All interactive elements are reachable and operable by keyboard (visible focus outline).
- The layout works down to a small mobile screen width without horizontal scrolling.
- No form ever submits silently on invalid input — every validation failure shows a visible, specific error message.
- Data persists across a page refresh (cart, session, and orders survive reload) but is scoped to one browser.

## 6. Explicitly out of scope for bug reports

- Real payment processing (this is a demo; no gateway is integrated)
- Cross-browser sync of data (localStorage is per-browser, by design)
- Password reset / forgot password flow (not built in v1)

## 7. Acceptance checklist (for traceability)

Each FR above should map to at least one test case in your test suite. A requirement with zero test cases, or a test case that doesn't map to any FR, is a gap worth flagging in your test plan.