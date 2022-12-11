# react-image-annotate-mngo
This library is available at [react-image-annotate-mngo](https://www.npmjs.com/package/react-image-annotate-mngo)

## Demo
[annotate.mngo.in](https://annotate.mngo.in)

## Brief:

A JavaScript Library (npm package ) to memic the design of Sublime Text Editor. One can easily create his web profile in react.js by installing `react-image-annotate-mngo` package

## Usage
    <MNgoImageAnnotate
        image={Image | string}
        width={number}
        loader={HTMLElement | string}
        error={HTMLElement | string}
        shapes={object}
        annotations={array}
        onChange={function}
    />

`props example`

1. `image`  image of type JS Image object or image url/link, e.g. [https://tinypng.com/images/social/website.jpg](https://tinypng.com/images/social/website.jpg)
2. `width`  width of the image, default value is 900
3. `loader`  HTMLElement or string to display while image is loading/downloading, default value is "loading"
4. `error`  HTMLElement or string to display when image could not be loaded, default value is "something went wrong"
5. `shapes`  shape button in tool bar


            {
                <shape type | title>: <Image | string>,
            }


        e.g.


            {
                "tick": tickImg,
                "cross": crossImg,
            }


6. `annotations` array of annotations present on the image


            [
                {
                    "type": <shape type or title>,
                    "pos": { "x": number, "y": number },
                    "size": { "height": number, "width": number }
                },
                {
                    "type": "pencil,
                    "src": <base64 image string | image url>,
                }
            ]


        e.g.


            [
                {
                    "type": "cross",
                    "pos": { "x": 757,"y": 224 },
                    "size": {"height": 50, "width": 50}
                },
                {
                    "type": "pencil",
                    "src": "data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAABTwAAAOoCAYAAAD8tDv4AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAA…",
                }
            ]


5. `onChange`  callback function run when any change is done on annotations

        onChange (annotationData: object) => void

        `annotationData` is { width: number, annotations: annotations[]}



## Installation

1. npm install
2. npm start

## Available Scripts

In the project directory, you can run

### `npm start`

Runs the app in the development mode
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

### `npm run babel-build`

it is for final package build which create `dist` folder.

### `npm publish`

to publish the project on npm

`Note`: do `npm run babel-build` before `npm publish` because it publishes dist folder as defined as key main, module, files in package.json, and do not forget to login in npm using `npm login`

### `npm run build-publish`

this command make build of the project and publishes it, basically it is combination of `npm run babel-build` and `npm publish`

## License

All rights reserved under MNgo.
