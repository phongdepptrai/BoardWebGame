## 2024-06-23 - Focus States and Form Labels

**Learning:** This app's inputs heavily rely on `focus:outline-none` and `placeholder` text, which negatively impacts keyboard accessibility and screen reader support without proper compensatory styling and structure.
**Action:** When creating or modifying form inputs in this app's design system, ensure they include programmatic label associations (`htmlFor`/`id`), utilize `.sr-only` for hidden labels when relying on placeholders, and append `focus-visible:ring-2 focus-visible:ring-gold/50` to maintain keyboard focus visibility alongside `focus:outline-none`.
