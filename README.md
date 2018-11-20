# ember-cli-svgstore-with-g

This is a last resort if you really like the idea of merging svgs into a single file in your ember application, yet the excellent addon [ember-cli-svgstore](https://www.npmjs.com/package/ember-cli-svgstore) may not serve your purpose. The major difference is that this addon allows you to use `<g>` tag in the merged svg file, instead of `<symbol>`. There are a few known issues using `<g>` over `<symbol>`, and in many cases you should try as much as possible to use `ember-cli-svgstore` first.

## Why `<g>`?

Although the recommended way to combine svgs together is through `<symbol>` (see for instance [this CSS Tricks post](http://css-tricks.com/svg-sprites-use-better-icon-fonts/), there is one usecase that I could not make it work: refer to svgs in CSS styles. More specifically, the following style does not work:
```
background-image: merged.svg#foo
```

When using `<g>`, the above CSS references work. However, there are at least two known issues:
1. The svg fragment cannot be dynamically resized
2. Animations do not carry over

As a result, *use with caution* as it may not work as you expected.

## Installation

```
npm install --save-dev ember-cli-svgstore-with-g
```

## Usage

The configuration of this addon is compatible with that for `ember-cli-svgstore`. That is, below would combine all SVGs under e.g. `app/icons` into one file `icons.svg`:

```js
// ember-cli-build.js

var app = new EmberApp(defaults, {
  svgstore: {
    files: {
      sourceDirs: 'app/icons',
      outputFile: '/assets/icons.svg'
    }
  }
});
```

Given an input file in `app/icons/user.svg`, the contents of that file could be embedded in a page like so:

```html
  <svg role="img">
    <use xlink:href="/assets/icons.svg#user"></use>
  </svg>
```

SVGs that are processed by this addon are usually more or less static assets, and it makes sense for them to live in the project's `public/` dir. However, since ember-cli automatically includes all files in `/public` in the build, they effectively get duplicated. To prevent processed files from ending up in `dist/`, use the `excludeSourceFiles` flag:

```js
// ember-cli-build.js

var app = new EmberApp(defaults, {
  svgstore: {
    excludeSourceFiles: true, // exclude all processed source files
    files: {
      sourceDirs: [ 'public/icons' ],
      outputFile: '/assets/icons.svg',
      excludeSourceFiles: true // exclude source files only for this master SVG
    }
  }
});
```

Note that if your source SVGs are in any other directory (i.e. `/app`, `/vendor`, etc.), they will not automatically be included in the build, and the `excludeSourceFiles` option is not necessary.

Because this addon uses `broccoli-svgstore` and `svgstore` under the hood it's possible
to pass the `options` accepted by `svgstore` through during the build.

For example, if you wanted to hide your `<svg>` of `<symbols>` from view, but
still keep it rendered in the DOM, you can take advantage of `svgstore`'s `svgAttrs` option:

```js
var app = new EmberAddon(defaults, {
  svgstore: {
    excludeSourceFiles: true, // exclude all processed source files
    files: {
      sourceDirs: [ 'public/icons' ],
      outputFile: '/assets/icons.svg',
      excludeSourceFiles: true // exclude source files only for this master SVG
    },
    svgstoreOpts: {
      svgAttrs: {
        style: 'position: absolute; top: 0; left: 0; width: 0%; height: 0%;'
      }
    }
  }
});
```

See the [`svgstore` options API](https://github.com/svgstore/svgstore#options) for more details.

## Options

### `files`
May be a single object or an array. Each object should have the following two keys:
 - `sourceDirs` a string or array of strings specifying the directories that should be crawled for SVGs to include
 - `outputFile` the destination to write the final SVG to
 - `excludeSourceFiles` whether the files in `sourceDirs` are excluded from the build or not


### `excludeSourceFiles`
Boolean indicating whether all source files should be excluded from the build or not, defaults to `false`.

### `svgstoreOpts`
An options hash to be passed through to `svgstore`.
