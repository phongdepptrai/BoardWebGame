1. **Explore the codebase**
   - Understand the current state of the application's login/join room forms.
2. **Implement UX Improvements**
   - In `client/src/App.jsx`, bind the "Alias" label to its input using `htmlFor` and `id` for accessibility.
   - Add an `aria-label` to the "Room Code" input to improve screen reader support since it lacks a visible label.
   - Add `disabled` states to the "Create New Room" and "Join Room" buttons based on whether the required inputs are filled out. This provides immediate visual feedback.
3. **Verify the work**
   - Use `pnpm lint` and `pnpm build` in the `client` directory to verify the changes.
4. **Complete pre-commit steps**
   - Ensure proper testing, verification, review, and reflection are done.
5. **Submit the PR**
   - Commit the changes and submit the PR as the "Palette" agent.
