## 2024-06-25 - Form Input Accessibility
**Learning:** Found inputs lacking explicit label associations (`htmlFor`/`id`) and missing visually hidden labels for placeholder-only inputs. Also, `focus:outline-none` was used without a keyboard-accessible focus ring.
**Action:** Always pair `focus:outline-none` with `focus-visible:ring-2` to maintain keyboard accessibility. Ensure every input has a programmatic label, using `sr-only` if a visual label isn't present in the design.
