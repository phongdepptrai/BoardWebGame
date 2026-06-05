
## 2024-05-18 - Input Accessibility & Focus Indicators
**Learning:** Found inputs in the entry/lobby screen lacking explicit `label` associations (`htmlFor` matching `id`) and proper focus states (when `focus:outline-none` is used, keyboard users lose focus visibility without a fallback).
**Action:** Always pair `focus:outline-none` with `focus-visible:ring-*` to preserve accessibility for keyboard users while styling inputs. Ensure inputs using placeholders instead of visible labels have a screen-reader-only (`sr-only`) label.
