<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

## Game architecture
- Keep platform physics in a browser-initialized Matter.js Canvas engine; React owns HUD and story/challenge screens, so rendering and educational state stay separate.
- Embed original artwork and transparent animation frames in self-contained SVG data URLs generated from source modules, without runtime CDN or asset-pointer imports, so images remain portable across hosting providers.
- Keep historical asset pointers under `.lovable/legacy-assets` only; do not delete their CDN objects because earlier deployments still reference them.
- Keep life and progression rules in a pure tested module, and synthesize sound with Web Audio after user interaction.
- Resize Canvas world framing to the available screen while retaining physics coordinates; extend the scenery rather than stretching characters or leaving letterbox bars.
- Define level layouts in a pure browser-safe module and test progression geometry, so longer courses remain traversable independently of Canvas rendering.
