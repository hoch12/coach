# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
