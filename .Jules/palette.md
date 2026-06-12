## 2026-06-12 - Enhance form accessibility and focus states
**Learning:** Pairing `focus:outline-none` with `focus-visible` indicators (like `focus-visible:ring-2 focus-visible:ring-gold/50`) is crucial for maintaining proper keyboard accessibility while hiding default outlines for mouse users. Using `sr-only` labels ensures screen reader support for inputs that only rely on placeholders.
**Action:** Always verify keyboard accessibility and programmatic label associations for inputs. Use visually hidden labels (`sr-only`) when a placeholder is used instead of a visible label.
