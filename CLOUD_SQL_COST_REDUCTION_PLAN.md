# Cloud SQL Cost Reduction Plan

This project is already a Firebase-first static web app.
There is no runtime Postgres/MySQL/Cloud SQL dependency in the repo.
That means the Cloud SQL bill is almost certainly coming from unused GCP infrastructure, not application code.

## Goal

Reduce monthly cloud spend without breaking the website, checkout flow, admin panel, or Firestore-based data model.

## What the app actually uses

- Static file server for local development: `server.js`
- Firestore for products, orders, and settings: `js/firebase-adapter.js`
- Firebase Auth and Storage helpers: `js/firebase-config.js`
- Admin UI reads and writes Firestore data through the adapter: `admin/admin.js`
- Checkout saves orders to Firestore, then redirects to WhatsApp: `main.js`

## What the app does not use

- Postgres client libraries
- MySQL client libraries
- SQL connection strings
- Any Cloud SQL runtime code path

## Safe removal strategy

### Phase 1: Confirm no external SQL dependency

1. Check Cloud SQL metrics for active connections, query volume, and recent CPU usage.
2. Verify the app is not using any Cloud SQL proxy, connector, or SQL credential outside this repo.
3. Keep a final backup before changing anything.

Success criteria:

- No active application traffic depends on Cloud SQL
- The website continues to work with Firestore only

### Phase 2: Freeze cost first

1. Stop the Cloud SQL instance during a low-traffic window.
2. Test the public site, checkout, and admin pages.
3. If everything still works, leave it stopped for 24 to 48 hours.

Why this is safe:

- Stopping the instance gives immediate cost relief with the option to start it again.
- The codebase does not contain a SQL runtime path, so a breakage would likely come from unrelated infrastructure rather than the app itself.

### Phase 3: Delete unused SQL resources

1. Delete the Cloud SQL instance once the stopped period is confirmed safe.
2. Remove unattached disks, snapshots, and backups that are no longer needed.
3. Confirm the billing graph drops the next day.

Expected result:

- Cloud SQL compute charges go to zero
- Cloud SQL storage charges disappear after cleanup

## Firestore hardening to avoid regressions

The app already relies on Firestore, so the remaining work is to keep that path efficient and stable.

1. Use direct document reads for settings instead of scanning collections.
2. Avoid full collection scans for order updates and deletes when a document ID is already available.
3. Keep the health check page read-only by default so it does not create unnecessary writes.
4. Keep admin page refreshes and snapshot listeners from duplicating the same reads.

These changes have already been applied in the branch `cost-reduction-safe`.

## Validation checklist

Run these checks after each infrastructure step:

1. Home page loads.
2. Products page loads and shows Firestore data.
3. Add to cart works.
4. Checkout saves an order to Firestore.
5. Admin login works.
6. Admin products page loads.
7. Admin orders page loads.
8. Health page reads Firestore successfully.

## Rollback plan

If something unexpected breaks after stopping Cloud SQL:

1. Restart the Cloud SQL instance.
2. Recheck the app flow.
3. Keep the instance running only if an actual dependency is discovered.

If the instance was deleted:

1. Restore from the final backup only if the data is still needed.
2. Otherwise keep the architecture Firebase-only and remove any leftover billing artifacts.

## Recommended final state

- Firestore for products, orders, and settings
- Firebase Storage for product images
- Firebase Auth for admin access
- Static hosting for the storefront
- No Cloud SQL instance
- No App Engine service unless it is explicitly needed

## Bottom line

The app should not be migrated from Cloud SQL to Firestore inside the codebase because it already uses Firestore.
The correct cost reduction action is to remove the unused Cloud SQL infrastructure while keeping the app on its existing Firebase stack.
