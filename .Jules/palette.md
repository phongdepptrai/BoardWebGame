## 2024-06-24 - Form Accessibility and Focus Management
**Learning:** Inputs using 'focus:outline-none' without visible focus rings break keyboard navigation. Additionally, placeholders are insufficient for screen readers and must be paired with properly linked labels.
**Action:** Always pair 'focus:outline-none' with a visible focus indicator like 'focus-visible:ring-2 focus-visible:ring-gold/50', and ensure all inputs have programmatically associated labels (using 'sr-only' if visually hidden).
