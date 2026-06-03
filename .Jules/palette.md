## 2024-05-24 - Glassmorphism Focus Visibility Loss
**Learning:** In themes with high transparency (glassmorphism/dark mode), relying on `focus:outline-none` for aesthetic purposes completely removes visual keyboard tracking. Standard outlines are often removed because they clash with the glowing UI, but without a replacement, accessibility is destroyed.
**Action:** Always pair `focus:outline-none` with `focus-visible:ring-2 focus-visible:ring-[theme-color]/50` (like `gold/50`) to maintain both the magical aesthetic and crucial keyboard accessibility.
