## 2024-05-15 - Aria labels for visual cards and input labeling
**Learning:** Emoji-based game cards and icon-only interactions in games are often overlooked for screen reader support. Additionally, custom styled inputs without proper `id` and `htmlFor` associations break accessibility context.
**Action:** Always add descriptive `aria-label`s to game elements (like hands or decks) that lack text content, and ensure all inputs have associated labels or `aria-label` attributes.
