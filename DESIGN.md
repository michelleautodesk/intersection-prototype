# Intersection Design Tool — "Good Foundation" Baseline

---

## Visual Elements

### Intersection Components

| Element | Description | Color |
|---------|-------------|-------|
| Road Surface | 2-lane driveway per leg | `#d4d4d4` (gray) |
| Lane Markings | Dashed center lines, solid edge lines | `#fff` / `#bbb` |
| Sidewalk | L-shaped areas at corners | `#a8c8dc` (light blue) |
| Corner Curve | Circular arc at each corner (curb line) | `#4a90d9` (blue) |

### Interactive Overlays

| Element | Purpose |
|---------|---------|
| Intersection Area | Clickable area to enter edit mode |
| Corner Hit Area | Pie-slice region for hovering/dragging corners |
| Midpoint Handle | Square handle on curve for visual feedback |
| Radius Length Line | Dashed line showing radius length |
| Radius Input | In-context input box (R = X m) |

---

## Interaction States

### 1. Default
- All overlays hidden
- Intersection area is hoverable

### 2. Intersection Selected
- Intersection area overlay visible (80% opacity)
- All 4 corner hit areas active (transparent)
- All 4 radius length lines dim (40% opacity)

### 3. Corner Hover (while intersection selected)
- Hit area fill: 8% opacity blue
- Radius length line: 80% opacity
- Midpoint handle: 80% opacity
- Radius input preview: 60% opacity
- Corner curve: hovered style

### 4. Corner Selected
- Corner curve: 100% visible
- Endpoint handles: visible (white circles)
- Midpoint handle: 100% visible (blue square)
- Radius length line: 100% opacity
- Radius input: fully interactive

### 5. Dragging
- Relative drag (no jump on start)
- Outward drag → increase radius
- Inward drag → decrease radius
- On release → return to intersection selected state

---

## State Transition Diagram

```
DEFAULT
    │
    │ click intersection area
    ▼
INTERSECTION SELECTED ◀──────────────────┐
    │                                    │
    │ hover corner                       │
    ▼                                    │
CORNER HOVER                             │
    │                                    │
    │ click or drag                      │
    ▼                                    │
CORNER SELECTED                          │
    │         │                          │
    │         │ click intersection area  │
    │         └──────────────────────────┘
    │
    │ drag
    ▼
DRAGGING
    │
    │ mouse up
    │
    └────────────────────────────────────┘
                (back to intersection selected)

click outside → DEFAULT
```

---

## Visual Specifications

### Opacity Values

| State | Element | Opacity |
|-------|---------|---------|
| Intersection hover | Overlay | 60% |
| Intersection selected | Overlay | 80% |
| Radius length line dim | Line | 40% |
| Radius length line hover | Line | 80% |
| Radius length line visible | Line | 100% |
| Midpoint handle hover | Handle | 80% |
| Radius input hover | Container | 60% |
| Hit area hover | Fill | 8% |

### Colors

| Element | Color |
|---------|-------|
| Primary blue | `#4a90d9` |
| Intersection hover | `rgba(220, 233, 240, 0.6)` |
| Intersection selected | `rgba(200, 221, 233, 0.8)` |
| Radius length line stroke | `#777` |
| Hit area hover fill | `rgba(74, 144, 217, 0.08)` |
| Curve stroke | `#4a90d9` |
| Endpoint handle | `#fff` with `#4a90d9` stroke |
| Midpoint handle | `#4a90d9` |
