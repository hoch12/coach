# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.12.0] - 2026-04-17
### Added
- **Threaded Messenger Architecture**: Refactored the messaging system from a single-record "Ticket-Reply" model to a stream-based chronicling model.
- **Support for Unlimited Messages**: Users and staff can now send multiple consecutive messages without overwriting conversation history.
- **Auto-Scroll to Bottom**: Implemented automatic scrolling behavior in all chat windows (Trainer, Admin, and Client) to ensure the latest messages are always in view.
- **Recency-Based Sorting**: The Admin Inbox now automatically sorts conversations by the most recent message timestamp rather than alphabetically.

### Changed
- **Database Schema**: Introduced `sender_id` to `support_tickets` for precise message origin tracking and non-destructive historical storage.

## [2.11.0] - 2026-04-17
### Fixed
- **Unified Messenger Logic**: Standardized the messaging flow between Trainers and the System Administrator to match the reliable Trainer-Client implementation.
- **Message Threading**: Messages are now automatically grouped into existing 'open' threads, preventing fragmented conversations and ensuring full historical visibility for both parties.
- **Robust Filtering**: Implemented multi-layer ID comparison logic to correctly route and display messages even with varying data types.

## [2.10.0] - 2026-04-17
### Added
- **Localized Validation**: Onboarding form now provides fully localized error messages and toasts (Czech/English).
- **Admin Panel Localization**: Completely translated all headers, tooltips, and interactive elements in the Admin dashboard.
- **Onboarding UX**: Performance tracking "Step X / 6" label and improved vertical spacing for better readability.
- **Health Restriction Fix**: Translated "None" option in health limitation sector.

## [2.9.0] - 2026-04-17
### Added
- Chronological Sorting: Workout, Nutrition, and Daily logs in the Trainer Dashboard are now sorted by date (newest first) for easier progress monitoring.
- Persistent Messenger: Refactored Admin messaging from a ticket-style system to a continuous messenger-style chat by removing thread closing restrictions.
- Dynamic Plan Localization: Implemented client-side plan re-generation in the Dashboard, ensuring lifestyle tips and training advice translate instantly when toggling languages.
- Full Onboarding Localization: Applied t() translations to all 6 steps of the client onboarding form (labels, options, and placeholders).

## [2.8.0] - 2026-04-16
### Added
- Complete Admin Panel Overhaul: Restructured into dedicated "Manage Clients" and "Manage Trainers" views with premium responsive design.
- Communication Hub: Replaced support inbox with a modern dual-pane chat interface for Admin-Trainer/User communication.
- Trainer Progress Tracking: Professional view for trainers to monitor assigned clients' workout logs, nutrition history, and daily tracking.
- Trainer-Admin Messaging: Direct channel for staff and administrators within the dashboard.
- Localization Depth: Full application-wide Czech/English support using LanguageContext architecture.
- Feature allowing Trainers to initiate direct messages natively to their assigned clients via Trainer Dashboard.
- Responsive Management: New card-based mobile layouts for user assignment and admin tables.

## [2.6.0] - 2026-04-16
### Added
- Optional Onboarding allowing clients to access application without immediate plan generation.
- Empty State on Dashboard for missing plans with prompt to start Onboarding.
- Trainer feature to create or edit training/nutrition plans impersonating their clients directly from Trainer Dashboard.
- API endpoints payload enhancements to authorize `userId` mapping for client profiles and plans submitted by trainers.

## [2.5.0] - 2026-03-25
### Removed
- Profile Editing: Disabled public profile editing (username and avatar) for Clients to ensure production stability and resolve 404/413 errors.
- Support Recipient Toggle: Removed explicit recipient selection for Clients to simplify the communication flow.

### Changed
- Automatic Support Routing: Messages are now automatically routed based on user assignment (to trainer if assigned, otherwise to administration).
- Support Backend: Simplified the `/api/support` endpoint to remove explicit target flags.

## [2.4.0] - 2026-03-25
### Added
- New "Body Type" selection in Onboarding (replacing estimated body fat percentage) with descriptive labels (e.g., "Mega vysekany", "Hodně hubený").
- Premium branding: Updated favicon based on the new minimalist dumbbell design.
- Confirmation "recipient" feedback in support messaging server response.

### Changed
- Improved Profile UX: Unified save experience for public settings (username and image) with clearer buttons and instant feedback.
- Refined Macro Logic: Nutrtion generator now maps body types to precise body fat percentages for more accurate calculations.

### Fixed
- Support Routing: Hardened the logic to ensure "Admin" messages strictly bypass trainers.
- Persistence: Resolved profile image update issues by ensuring sync between server, context, and localStorage.

## [2.3.6] - 2026-03-25
### Added
- Custom favicon for the platform.
- Diagnostic logging to `AuthContext.tsx` to troubleshoot session persistence.

### Fixed
- Session persistence significantly improved by hardening the backend `SECRET_KEY` and making the client-side sync more resilient to network flickers.
- Support message routing accuracy fixed by improving the `toAdmin` flag handling and providing a clearer UI toggle for Clients.
- Profile image update feedback improved with explicit success/error toast messages and console logging in all dashboards.

## [2.3.5] - 2026-03-25
### Fixed
- Session persistence improved by implementing a stable `SECRET_KEY` in the backend, preventing accidental logouts on server restarts.
- Profile state synchronization resolved in `Profile.tsx` using `useEffect` to ensure UI reflects the latest database state from `AuthContext`.
- Message routing logic for "Admin Support" hardened in the backend with explicit boolean type checks and detailed server-side logging.
- Client-side messaging reliability improved in `SupportTab.tsx` with request payload verification.
- Safe navigation for avatars added to `TrainerDashboard.tsx` and improved UI feedback for image uploads.

## [2.3.4] - 2026-03-25
### Fixed
- Profile image persistence resolved via backend synchronization on mount in `AuthContext.tsx`.
- Mobile scrolling stability improved by replacing `ScrollArea` with `overflow-y-auto` divs across all dashboards.
- Safe navigation for user avatars (`user?.username?.[0]`) to prevent potential rendering crashes.
- Dialog layout consistency (Trainer, Admin) optimized for small screens with padded, scrollable content containers.
- Duplicate imports and JSX mismatches from previous refactoring cleaned up.

## [2.3.3] - 2026-03-25
### Fixed
- Persistent onboarding redirect loop resolved by switching to server-side plan verification.
- Mobile-responsive profile dialogs with `ScrollArea` and explicit "Zavřít" (Close) buttons.
- Profile dialog "X" button accessibility on small screens.
- "Quota Exceeded" errors in `localStorage` handled with try-catch for large profile images.
- Messaging routing fix: messages to Administration now correctly bypass coaches.
- Syntax errors in `TrainerDashboard.tsx` from previous partial refactors.
### Added
- Profile image and username customization for Administrators.
- 10MB image upload limit synchronized across all profile views.
- Loading states for onboarding verification.
- Destructured `updateUser` in Admin and Trainer dashboards for better state sync.

## [2.3.2] - 2026-03-25
### Fixed
- Critical JSX syntax errors in `Admin.tsx` and `Dashboard.tsx` causing build failures.
- Navigation entrapment in Onboarding for unauthenticated states.
- Horizontal scrolling on mobile in Admin panel (User/Trainer management tables replaced with cards).
- Mobile navigation accessibility (Logout/Profile buttons added to all responsive headers).
- Missing Logout button on Landings page for authenticated users.

## [2.3.1] - 2026-03-25
### Fixed
- Support message routing bug where Admin messages occasionally reached trainers.
- Mobile responsiveness issues in Admin panel header.
### Added
- Trainer profile management (username, avatar, password in dashboard).
- Client avatars visible to trainers and admins.
- Increased image upload limit to 10MB.

## [2.3.0] - 2026-03-25
### Added
- Direct messaging to Administration for all users.
- Automatic routing to Admin support for users without assigned coaches.
- Mobile-responsive navigation for all Dashboards.
- Improved table layouts and responsiveness for Admin panel.

## [2.2.0] - 2026-03-25
### Added
- Profile picture (avatar) support for all users.
- Ability to change username and profile photo in the Profile page.
- Persistent storage of profile images in the database.
- Dynamic avatar display in Sidebars and Headers.

## [2.1.0] - 2026-03-25
### Added
- Professional A0 project poster template (`docsablona/plakat26.tex`) for school presentation.
- Project poster mockup image.

### Updated
- Synchronized `package.json` and `version.md`.
- Expanded project documentation.

## [2.0.0] - 2026-03-24
### Added
- Integrated client details dialog for trainers.
- Profile management with dynamic API routing.
- Sidebar navigation improvements.

### Changed
- Major rebranding from HabitFuel Coach to **Coach-E**.
- Switched to HashRouter for GitHub Pages compatibility.
- Updated remote repository links.
