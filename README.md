# ember-cli-svgstore-with-g

This is a last resort if you really like the idea of merging svgs into a single file in your ember application, yet the excellent addon [ember-cli-svgstore](https://www.npmjs.com/package/ember-cli-svgstore) may not serve your purpose. The major difference is that this addon allows you to use `<g>` tag in the merged svg file, instead of `<symbol>`. In addition, this addon provides a few more features that can potentially be useful for your usecase. However, there are known issues using `<g>` over `<symbol>`, and in many cases you should try as much as possible to use `ember-cli-svgstore` first.

## Why `<g>`?

Although the recommended way to combine svgs together is through `<symbol>` (see for instance [this CSS Tricks post](http://css-tricks.com/svg-sprites-use-better-icon-fonts/)), it does not work with CSS styles. More specifically, the following style does not work:
```
background-image: merged.svg#foo
```
It turns out if we use `<g>` instead, the above syntax would work in almost all modern browsers. However, there are at least two known issues:
1. The svg sprites cannot be dynamically resized. That is, if your original svg is 64x64 in size, it will stick to this precise size, regardless of the container size. This can be resolved by adding an additional layer of `scale` transform to your original svg file in many cases, yet is annoying sometimes.
2. Animations in the original svgs do not carry over.

As a result, *use with caution* as this addon may not work as you expected.

## Installation

```
npm install --save-dev ember-cli-svgstore-with-g
```

## Usage

### Compatible configurations with `ember-cli-svgstore`.
The configuration of this addon is compatible with that for `ember-cli-svgstore`. That is, all configurations for `ember-cli-svgstore` would work for this addon. For instance, below would combine all SVGs under `app/icons` into one file `icons.svg`:

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
Similarly, you can also exclude your source files from your `public/` folder via the `excludeSourceFiles` flag:
```js
// ember-cli-build.js

var app = new EmberApp(defaults, {
  svgstore: {
    excludeSourceFiles: true, // exclude all processed source files
    files: {
      sourceDirs: ['public/icons'],
      outputFile: '/assets/icons.svg',
      excludeSourceFiles: true // exclude source files only for this master SVG
    }
  }
});
```
Following exactly the same settings for `ember-cli-svgstore`, you can pass options to `svgstore` too:

```js
var app = new EmberAddon(defaults, {
  svgstore: {
    excludeSourceFiles: true, // exclude all processed source files
    files: {
      sourceDirs: ['public/icons'],
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

### Start using `<g>`
By default, this addon still uses `<symbol>` in the merged file. To start using `<g>`, set the `useGroup` flag:

```js
var app = new EmberAddon(defaults, {
  svgstore: {
    files: {
      sourceDirs: ['public/icons'],
      outputFile: '/assets/icons.svg'
    },
    svgstoreOpts: {
      svgstoreOpts: {
        useGroup: true
      }
    }
  }
});
```

### Files to keep
As mentioned above, using `<g>` leads to a few issues. The simplest way in most cases to resolve such issue is to simply exclude the specific svg from being merged. To do so, this addon implements a `filesToKeep` flag:

```js
var app = new EmberAddon(defaults, {
  svgstore: {
    files: {
      sourceDirs: ['public/icons'],
      outputFile: '/assets/icons.svg'
      filesToKeep: ['spinning-wheel.svg']
    }
  }
});
```

This way you can refer to `spinning-wheel.svg` in your application to keep the spinning animations.

### Preliminary SASS support
Another feature this addon implements is a SASS type variable replacement. This feature is particularly handy when you need to update the color palette, as this would apply to your svg files too. For instance, the following setting would replace all `$light-green` variables in your svgs with `#92D050`:
```js
var app = new EmberAddon(defaults, {
  svgstore: {
    files: {
      sourceDirs: ['public/icons'],
      outputFile: '/assets/icons.svg'
    },
    svgstoreOpts: {
      svgstoreOpts: {
        sassVarsMap: {
          "$light-green": "#92D050"
        }
      }
    }
  }
});
```

### Id unification
A potential issue when merging svg files come from conflicting ids. That is, if `id=foo` is declared by two separate files, the merged svg will have two tags with the same id `foo`. This in some cases can cause quite tricky-to-debug issues. As a resort, this addon implements an id unitifcation utility that ensures all conflicting ids are renamed during the processing. To enable this feature, simply do:
```js
var app = new EmberAddon(defaults, {
  svgstore: {
    files: {
      sourceDirs: ['public/icons'],
      outputFile: '/assets/icons.svg'
    },
    svgstoreOpts: {
      svgstoreOpts: {
        useGroup: true,
        unifyIds: true
      }
    }
  }
});
```
