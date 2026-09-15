# react-image-annotate-mngo

A high-performance, responsive React image annotation and markup component library built with TypeScript and Tailwind CSS. Annotate, sketch, stamp custom icons/shapes, and place text overlays directly on images or an interactive fallback canvas.

[Live Demo](https://annotate.adityas.site)

---

## Features

- **GPU-Accelerated CSS Transforms**: Elements use `transform: translate3d(...) rotate(...)` instead of `top`/`left` layout properties, leveraging GPU compositing for 60fps rendering without layout reflows.
- **Direct CSS DOM Mutation During Interactions**: Dragging, rotating, and resizing modify CSS variables directly on the element's DOM node in real-time, completely bypassing React re-renders during active interaction.
- **Commit-on-Release State Model**: State updates commit to the store only on pointer release (`pointerup`), eliminating continuous store updates and re-render cycles during user interaction.
- **Frame-Synced Updates with `requestAnimationFrame`**: Interactive gesture pipelines throttle visual DOM updates to the display's refresh rate via `requestAnimationFrame`.
- **CSS Variable-Driven Container Scaling**: Scale factors (`--scale-x`, `--scale-y`) are stored as CSS custom properties on the root container, allowing all annotations and strokes to scale instantly on window or container resize without iterating over individual elements.
- **Universal Pointer Event Handling**: Utilizes `pointerdown`, `pointermove`, and `pointerup` with `setPointerCapture` to deliver uniform gesture interactions across mouse, touchscreens, and styluses.
- **Atomic State Management & Granular Subscriptions**: Each annotation element subscribes strictly to its own ID via `useSyncExternalStore`, ensuring modifying or selecting one item never triggers re-renders on other items.
- **High-DPI Freehand Sketching**: Canvas rendering accounts for `devicePixelRatio` with midpoint quadratic bezier curves for smooth pencil strokes without pixelation.
- **Dual Mode Support**: Annotate images with automatic aspect-ratio scaling, or use the coordinate grid canvas when no background image is provided.
- **Extensible Tool Registry**: Supports custom tool definitions and SVG stamps via the `tools` prop for specialized diagramming workflows.
- **Undo & Redo Stack**: Complete immutable snapshot history with dedicated toolbar controls and hotkeys.
- **Keyboard Shortcuts**: Built-in hotkeys for Undo (<kbd>Ctrl/Cmd+Z</kbd>), Redo (<kbd>Ctrl/Cmd+Shift+Z</kbd> / <kbd>Ctrl+Y</kbd>), Copy/Paste (<kbd>Ctrl/Cmd+C</kbd>, <kbd>Ctrl/Cmd+V</kbd>), and Delete (<kbd>Delete</kbd> / <kbd>Backspace</kbd>), with smart input focus suppression.
- **Zero-Config CSS Injection**: Component styles are bundled and injected automatically via JavaScript runtime — no external CSS imports required.
- **Fully Typed**: Written in TypeScript with complete declarations (`.d.ts`) exported out of the box.

---

## 📦 Installation

```bash
npm install react-image-annotate-mngo
# or
yarn add react-image-annotate-mngo
# or
pnpm add react-image-annotate-mngo
```

### Peer Dependencies
- `react` >= 18.0.0 (Supports React 18 & 19)
- `react-dom` >= 18.0.0

---

## 🚀 Quick Start

```tsx
import { useState } from 'react';
import MNgoImageAnnotate, { type AnnotationData } from 'react-image-annotate-mngo';

export default function App() {
  const [annotationData, setAnnotationData] = useState<AnnotationData>({
    annotationIds: [],
    annotations: {},
    highestZIndex: 0,
  });

  return (
    <div style={{ width: '100%', height: '80vh' }}>
      <MNgoImageAnnotate
        imgSrc="https://images.unsplash.com/photo-1579783902614-a3fb3927b675?auto=format&fit=crop&w=1200&q=80"
        annotationData={annotationData}
        onAnnotationDataChange={setAnnotationData}
      />
    </div>
  );
}
```

> **Note**: Give the parent container an explicit height (e.g. `height: 80vh` or `h-screen`) so the component can expand smoothly to fit your layout.

---

## 🛠️ Adding Custom Tools / Shapes

You can extend the toolbar with your own custom tools or icon stamps using the `tools` prop:

```tsx
import MNgoImageAnnotate, { type Tool } from 'react-image-annotate-mngo';

const CUSTOM_TOOLS: Tool[] = [
  {
    name: 'server',
    btnIcon: <ServerIcon className="w-5 h-5" />, // Displayed in the toolbar
    elementIcon: <ServerIcon className="w-full h-full text-indigo-600" />, // Displayed when placed on the canvas
  },
  {
    name: 'database',
    btnIcon: <DatabaseIcon className="w-5 h-5" />,
    elementIcon: <DatabaseIcon className="w-full h-full text-emerald-600" />,
  },
];

export default function CustomToolsExample() {
  return (
    <div style={{ height: '100vh' }}>
      <MNgoImageAnnotate
        imgSrc="/architecture.png"
        tools={CUSTOM_TOOLS}
      />
    </div>
  );
}
```

---

## 📖 Component Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `imgSrc` | `string` | `undefined` | Image URL or base64 data string to annotate. If omitted, renders an interactive grid fallback canvas. |
| `readonly` | `boolean` | `false` | When set to `true`, disables interaction, dragging, tools, and shortcuts (view-only mode). |
| `tools` | `Tool[]` | `undefined` | Custom tools/stamps added to the right side of the toolbar. |
| `annotationData` | `AnnotationData` | `undefined` | Controlled annotation data state. |
| `onAnnotationDataChange` | `(data: AnnotationData) => void` | `undefined` | Callback invoked whenever annotations are added, modified, moved, rotated, resized, or deleted. |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Notes |
|---|---|---|
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Z</kbd> | Undo | Reverts previous annotation modification |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>Shift</kbd> + <kbd>Z</kbd> | Redo | Also supports <kbd>Ctrl</kbd> + <kbd>Y</kbd> |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>C</kbd> | Copy | Copies the currently selected element |
| <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> + <kbd>V</kbd> | Paste | Pastes the copied element with offset |
| <kbd>Delete</kbd> / <kbd>Backspace</kbd> | Delete | Removes the currently selected element |

*Shortcuts are automatically suppressed when typing inside `<input>`, `<textarea>`, or content-editable elements.*

---

## 📐 TypeScript Interfaces

```typescript
export interface Tool {
  name: string;
  btnIcon: ReactNode;
  elementIcon?: ReactNode;
}

export interface AnnotationData {
  annotationIds: string[];
  annotations: Record<string, Annotation>;
  highestZIndex: number;
}

export interface Annotation {
  id: string;
  name: string;
  zIndex: number;
  pos?: { x: number; y: number };
  rotation?: number;
  dimensions?: { width: number; height: number };
  text?: string;
  points?: number[][]; // Pencil stroke coordinates
}

export interface MNgoImageAnnotateProps {
  readonly?: boolean;
  imgSrc?: string;
  tools?: Tool[];
  annotationData?: AnnotationData;
  onAnnotationDataChange?: (newData: AnnotationData) => void;
}
```

---

## 📄 License

MIT © [Aditya Suman](https://github.com/adityasuman2025)

