# CSS module structure

This is a phase-1 compatibility scaffold. The existing visual output is preserved by keeping the active legacy CSS files in place:

- `style.css`
- `wide_vn.css`
- `route_mission_game.css`
- `ai_plan_game.css`
- `home_game.css`

New module files are loaded as safe placeholders so future work can move styles one screen at a time.

## Layers

1. `tokens.css`
   - Shared variables only.

2. `base.css`
   - Future home for global reset, typography, accessibility helpers.
   - Current active base rules remain in `style.css`.

3. `layout.css`
   - Future home for shared app/screen/viewport wrappers.
   - Current active layout overrides remain in `wide_vn.css`.

4. `components/`
   - Future home for shared buttons, cards, forms, HUD, modals, progress, speech bubbles, characters.

5. `screens/`
   - Future home for screen-scoped styles.
   - Move styles into these files gradually, keeping each selector scoped to `screen-sXXX` or the existing screen id.

## Migration rule

Move styles only when working on one specific screen. Do not split `wide_vn.css` or other legacy files in bulk.
