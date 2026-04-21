2.15.0

and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.15.0] - 2026-04-21
### Added
- **Admin Panel Full Width**: Changed admin panel max-width from `4xl` to `7xl` so content uses the full screen on wide displays while maintaining mobile responsiveness.
- **Admin Initiates Trainer Chat**: Admin can now click a message icon next to any trainer in the Manage Trainers tab to open a new conversation, even if the trainer hasn't written first. New backend endpoint `/api/admin/support/initiate` was added.
- **Trainer Profile Dialog**: Clicking the eye icon on a trainer in Manage Trainers shows a dialog with the trainer's assigned clients and a "Send Message" button.
- **Unread Badge - Admin**: The "Messaging" tab badge now shows the count of conversations where the last message is from the other party (truly unread), not the total open ticket count.
- **Unread Badge - Trainer**: Trainer sidebar and mobile nav "Messages" icon now shows a red badge with unread conversation count.

### Fixed
- Admin inbox sidebar now lists all trainers even without existing messages (greyed out), allowing admin to initiate conversations.
- Message sorting is now stable (ascending by created_at) in the chat window.

## [2.14.9] - 2026-04-21
### Fixed
- **DB Startup Stability**: Added retry logic (5 attempts, 3s delay) for database initialization on server startup to handle Neon cold-start timeouts on Render.
- **Non-Fatal Startup**: Server no longer calls `process.exit(1)` on DB init failure — it starts anyway and retries, preventing Render restart loops.
- **Root Cause**: The Neon project was newly created on 2026-04-20 with empty tables. The DB was only initialized successfully from localhost. All users must be re-registered.

## [2.14.8] - 2026-04-20
### Fixed
- **Auth Sync Loop Fix**: Resolved a critical issue where invalid tokens caused a loop of 403/500 errors in the console.
- **Backend Stability**: Fixed a potential 500 Internal Server Error in the `/api/user/settings` endpoint by adding better input validation and error logging.
- **Graceful Logout**: Updated the logout process to clear auth states immediately, preventing background components from using stale tokens.

## [2.14.6] - 2026-04-20
### Fixed
- **Unified Activity Sorting**: Merged "System Admin" and "Clients" into a single activity-sorted list in the Trainer Dashboard.
- **Data Fetching Fix**: Resolved a bug where the client list would not populate in the Chat tab if visited directly.
- **Performance**: Improved logic for calculating the latest message timestamps in conversation lists.

## [3.0.1] - 2026-04-20
### Added
- **Navigation Enhancement**: Added a "Back to Home" button on both Login and Register pages to allow easy navigation back to the landing page.
- **Localized Navigation**: Support for both Czech and English labels for the new navigation button.

## [3.0.0] - 2026-04-20
### Added
- **PostgreSQL Migration**: Fully migrated the backend from SQLite to PostgreSQL (Neon.tech/Render) to ensure permanent data persistence on ephemeral cloud platforms.
- **Asynchronous Database Layer**: Refactored the entire `server/index.js` to use `async/await` pattern for improved performance and non-blocking I/O.
- **Auto-Initialization**: Implemented automatic database schema creation and field migrations on server startup.
- **Environment Support**: Added `.env` support for secure database credential management.

### Changed
- **Dependencies**: Replaced `better-sqlite3` with `pg` and added `dotenv`.
- **SQL Syntax**: Updated all queries to use PostgreSQL-compliant parameterization ($1, $2) and conflict handling (EXCLUDED).

## [2.14.5] - 2026-04-19
### Fixed
- **Admin Inbox Regression**: Fixed a `ReferenceError` that broke the Admin message sidebar due to a missing variable definition.
- **Conversation Sorting**: Implemented activity-based sorting in the Trainer dashboard. Conversations with the most recent messages are now automatically moved to the top of the client list.
- **Notification Consistency**: Synchronized the "pending reply" notification logic across all dashboards.
