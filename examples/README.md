# Textolite

Textolite is a simle text editor.

![](./images/editor.png)

## Using

In order to install package:
```shell
npm i textolite
```

Then you can use it in your project:
```html
<div id="editor-container"></div>
```

```JavaScript
import { Editor } from 'textolite';
const editor = new Editor("editor-container");
```
For now editor still doesn't support json export, so the easiest method of getting inserted text is to read innerHTML property of editor container.

```JavaScript
const html = editor.getHTML();
```

Please find example of usage below.


## Running tests

Running unit/integration tests: ```npm test```<br/>
Running unit/integration tests with coverage details: ```npm test -- --coverage```<br/>
Checking formatting: ```npx eslint .``` or ```npm run lint .``` <br/>


## Example

There are 2 exemples. One uses React, second is just Vanilla JS.
Examples were ment to be used with local version of ```textolite``` library, but you can also use latest released version.

### Using latest released version of textolite library:

Skip this is you want to use local library.

1. Go to folder with example:
```shell
cd examples/react-example
```
2. Install textolite:
```shell
npm i textolite
```

### Create link to local textolite library:

Skip this is you use latest released textolite.

1. Go to ```textolite``` directory. 
2. Transpile typescript files to js:
```shell
tsc
```
3. Create global link to package:
```shell
npm link
```
4. Go to folder with example:
```shell
cd examples/react-example
```
5. Link local library to project:
```shell
npm link textolite
```

### Running example

1. Go to folder with example:
```shell
cd examples/react-example
```
2. Install packages:
```shell
npm install
```
3. Build main.js using webpack:
```shell
npm run build
```
3. Run example:
```shell
npm start
```
