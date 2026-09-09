# react-image-annotate-mngo

A responsive, highly customizable React and TypeScript component library providing an interactive area over images for annotations, markups, drawing, and text.

This library is available on npm at [react-image-annotate-mngo](https://www.npmjs.com/package/react-image-annotate-mngo).

---

## Demo

- Live Demo: [annotate.adityas.site](https://annotate.adityas.site)

---

## Features

- **Interactive Canvas**: Annotate, sketch, mark up, and add custom shapes directly on top of any image.
- **Tools Included**: Pencil drawing tool, text tool, undo, redo, delete, rotate, and full-screen support.
- **Custom Shapes**: Extensible shape configuration for custom SVG/image stamps (rectangles, circles, custom icons).
- **Dark Mode Support**: Seamless toggle between dark and light themes.
- **Lightweight & Modular**: Written in React & TypeScript with zero heavy dependencies.

---

## Installation

```bash
npm install react-image-annotate-mngo
```

---

## Usage

```tsx
import React, { useState } from 'react';
import { MNgoImageAnnotate } from 'react-image-annotate-mngo';
import 'react-image-annotate-mngo/style.css';

export default function AnnotateDemo() {
  const [annotations, setAnnotations] = useState([]);

  return (
    <MNgoImageAnnotate
      image="https://tinypng.com/images/social/website.jpg"
      imgWidth={900}
      isDarkMode={false}
      annotations={annotations}
      onChange={(data) => {
        console.log("Updated annotations:", data);
        setAnnotations(data.annotations);
      }}
    />
  );
}
```

---

## Component Props

| Prop | Type | Default | Description |
|---|---|---|---|
| `image` | `string` | `undefined` | URL or base64 string of the image to annotate. |
| `imgWidth` | `number` | `900` | Display width of the image. |
| `isViewMode` | `boolean` | `false` | When true, renders canvas in read-only / view-only mode. |
| `isDarkMode` | `boolean` | `false` | Toggles dark theme styling. |
| `compIdx` | `number` | `0` | Unique component index when using multiple instances on one page. |
| `compMaxHeight` | `string` | `undefined` | Maximum height constraint for the component (e.g. `'100vh'`). |
| `compMaxWidth` | `number` | `undefined` | Maximum width constraint for the component. |
| `loc` | `number[]` | `undefined` | Coordinates `[x1, y1, x2, y2]` of the visible portion of the image. |
| `loadingRenderer` | `string \| ReactElement` | `'loading'` | Custom loader element while image is loading. |
| `errorRenderer` | `string \| ReactElement` | `'something went wrong'` | Custom error display if image fails to load. |
| `textInputField` | `function` | `undefined` | Custom render function for text tool input field. |
| `shapes` | `object` | `{}` | Key-value mapping of custom shape buttons and icons. |
| `annotations` | `any[]` | `[]` | Current array of annotations on the image. |
| `onChange` | `(data) => void` | `undefined` | Callback invoked whenever annotations change. |

---

## License

MIT © Aditya Suman
