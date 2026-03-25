# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
