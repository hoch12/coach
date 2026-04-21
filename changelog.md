# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.1.0] - 2026-04-21
### Added
- **Extreme Onboarding Personalization**: Support for exact training frequency (1-7 days), specific home equipment selection, and location-aware exercise pools.
- **Vast Databases**: Implemented static databases for 250+ unique exercises and meals, categorized by equipment, diet, and level.
- **Science-Driven Nutrition**: Automatic BMR/TDEE transparent calculation with safety calorie floors.
- **Optional Body Fat**: Refined the body fat estimation logic to be optional while maintaining high calculation accuracy.
- **Professional Training Splits**: Dynamic mapping of frequency to professional splits (PPL, Upper/Lower, Full Body).

## [2.16.0] - 2026-04-21
### Added
- **Extreme Personalization Engine**: A data-driven onboarding system that generates training, nutrition, and lifestyle plans using professional-grade logic. Every input (limitations, equipment, frequency, motivation) directly influences the 250+ item content pool.
- **Dynamic Training Splits**: Added support for 2-day Full Body splits up to 6-day PPL (Push/Pull/Legs) splits.
- **Location-Aware Training**: Specific exercise pools for Gym, Home, Outdoor/Park, and Mixed environments.
- **Dietary Deep-Dive**: Added "Pros & Cons" and "Strategy" sections for specific diets like Vegan and Keto in the nutrition plan.
- **Safety Calorie Floors**: Implemented professional safe limits for daily calories (1400/1600 kcal) to prevent dangerously low intakes.
- **Improved UI Step Navigation**: Added body fat slider and expanded health/advantage selections in the onboarding form.

## [2.15.0] - 2026-04-21
### Added
- **Admin Panel Enhancements**: Switched admin panel to `7xl` max-width.
- **Admin Messaging Control**: Admin can now initiate conversations with trainers and view their profiles (including their assigned clients).
- **Redesigned Notification Badges**: Unread message counts are now accurate across all dashboards.
- **Direct Trainer Communication**: Added `/support-initiate` endpoint for starting new threads from the admin panel.

### Fixed
- Express routing conflict for messaging endpoints.
- Message list listed all users, allowing admin to initiate chat even without previous activity.

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
