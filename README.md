![icon](icon-jetpack-placeholder.png)
# icon-jetpack

SVGO based plugin for Figma (and eventually, Penpot) that:
1. Takes selected icon frame
2. Extracts applied color tokens
3. Optimizes selected icon with SVGO
4. Concats required CSS classes, using the token name and value

We extract the color tokens instead of matching to the Breeze color palette in order to make this tool as simple and design system agnostic as possible.
