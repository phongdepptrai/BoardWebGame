## 2024-05-28 - Input Label Association and Keyboard Focus
**Learning:** When inputs are visually missing a label or use `focus:outline-none`, they require `sr-only` labels (with `id` and `htmlFor`) and explicit visible focus indicators like `focus-visible:ring-2` to remain accessible via keyboard and screen readers.
**Action:** Pair `focus:outline-none` with `focus-visible:ring` and use `sr-only` visually hidden labels for inputs without visible text.
