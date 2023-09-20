# Textolite examples

There are 2 exemples. One uses React, second is just Vanilla JS.
Examples were meant to be used with local version of ```textolite``` library, but you can also use latest released version.

## Using latest released version of textolite library:

Skip this is you want to use local library.

1. Go to folder with example:
```shell
cd examples/react-example
```
2. Install textolite:
```shell
npm i textolite
```

## Create link to local textolite library:

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

## Running example

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
