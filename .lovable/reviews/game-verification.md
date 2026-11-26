# Game verification

Verified the requested changes in the running app at 1366 × 768 and 390 × 667.

- Main menu fits the viewport without page scrolling, header, footer, journey section, eyebrow, ornament, caption or bottom labels.
- All three introductory dialogue screens show the main dialogue and skip action without surrounding headings or footers.
- Gameplay fills the screen, retains the in-game life, pause, home and fragment controls, and omits the external instructions and progress strip.
- Poppins is used throughout the interface.
- The day and night artwork is continuous rather than tiled with a visible seam. Platforms have rounded soil and a soft grass edge instead of triangular spikes.
- Day uses the rock golem and spiny plant; night adds pincers and the night spirit. The supplied closed and open chest artwork is integrated.
- All three day questions and both night questions were reached through gameplay at both viewport sizes. A wrong answer showed its hint; the correct answer collected the fragment. All three answer choices stayed inside the screen, including the long variable and Boolean questions.
- Each run continued through the next level, final victory and return to the main menu. Reattempting after defeat also worked.
- Reviewed screenshots of both menus, all introductory dialogues, all questions with hints, and both reward screens. No clipped answers or overlapping dialog content were found in these checks.
- Automated rule and routing checks: 18 passing tests. Latest preview build: OK.

Touch movement buttons remain available on phones; desktop movement uses the keyboard. No additional color theme is exposed.