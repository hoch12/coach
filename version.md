2.14.6

and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
