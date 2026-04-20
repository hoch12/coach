# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.14.6] - 2026-04-20
### Fixed
- **Unified Activity Sorting**: Merged "System Admin" and "Clients" into a single activity-sorted list in the Trainer Dashboard.
- **Data Fetching Fix**: Resolved a bug where the client list would not populate in the Chat tab if visited directly.
- **Performance**: Improved logic for calculating the latest message timestamps in conversation lists.

## [3.0.1] - 2026-04-20
### Added
- **Back to Home Button**: Implemented a ghost-variant navigation button with hover effects on the authentication pages (Login & Register) to improve user experience and navigation flow.
- **Translation Entry**: Added `backToHome` key to the language system.

## [3.0.0] - 2026-04-20
### Added
- **Architectural Shift to PostgreSQL**: Migrated from file-based SQLite to persistent PostgreSQL (optimized for Neon.tech and Render.com). This resolves the issue where user data was lost daily due to Render's ephemeral filesystem.
- **Async Backend Core**: Refactored every API endpoint to be asynchronous, utilizing connection pooling for high-concurrency stability.
- **Cloud-Native persistence**: Integrated `dotenv` and Environment Variable support for secure production deployments.

### Changed
- **Database Driver**: Switched from `better-sqlite3` to `pg`.
- **SQL Schema Auto-Init**: Server now automatically verifies and builds the required tables and constraints on every startup.

## [2.14.0] - 2026-04-17
### Added
- **Admin Inbox Visual Indicators**: Added "Trainer" and "Client" badges to conversation threads in the Admin support panel for easier identification.
- **Improved Chat Header**: The active conversation in the Admin view now clearly indicates the role of the person being messaged.
- **Enhanced Badge Component**: Added a `hero` variant to the `Badge` UI component using the brand's primary styling.
