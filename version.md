2.14.2

and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.14.2] - 2026-04-17
### Fixed
- **Bulletproof Trainer Identification**: Implemented a two-tier verification system in the Admin panel that cross-references conversation owners with the active Trainer list to ensure 100% accurate role labeling.
- **Type Safety**: Ensured consistent number/string handling for user IDs in support threads.

## [2.14.1] - 2026-04-17
### Fixed
- **Trainer Identification**: Resolved an issue where trainers were incorrectly labeled as "Clients" in the Admin panel by making role checks case-insensitive.
- **Support Routing**: Ensured explicit `target: 'admin'` is sent from the Trainer dashboard to avoid backend routing ambiguity.
