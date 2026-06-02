
## 2024-05-15 - Interactive Elements Require Explicit Focus-Visible
**Learning:** In this project's design system, using `focus:outline-none` removes default focus rings, which creates an accessibility gap for keyboard users.
**Action:** Always pair `focus:outline-none` with explicit focus indicators like `focus-visible:ring-2 focus-visible:ring-gold/50` to maintain proper keyboard accessibility while respecting visual design constraints.
