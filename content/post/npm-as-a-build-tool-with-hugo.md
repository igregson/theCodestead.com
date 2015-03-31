---
date: 2015-03-03T22:57:35+03:00
title: NPM as a Build Tool with Hugo
draft: true
---

Hugo's a rather powerful tool for making websites. At its core it's a static
site generator, but it's also capable of quite a bit more. 

NPM's a rather powerful package manager. It's also a powerful build
tool. 

Developing with Hugo and NPM in collaboration makes for a powerful setup. Let's
learn how.

<!--more-->

### How to use NPM as a build tool with Hugo

Here are the bare-bones requirements of what I'd consider essential for
developing a modern site:

- CSS Pre & Post Processing
- JS concatination/bundling
- Minifying CSS & JS
- Live Reloading Developement Setup

on top of this, there are more "advanced" but nevertheless "nice-to-haves:"

- Source maps (for JS & CSS for debugging while developing)
- Asset versioning (for browser caching)
- Image minification
- Icon system building

Out of the box, Hugo includes a super fast and resource friendly `watch` feature
that "just works". There are of course fancier ways to watch a build
environment, but when working with Hugo I prefer to use its watch flag. 

For everything else, there's NPM.

Here's the bare-bones directory structure of a Hugo site

```
content
layouts
static

public -- the static build, not source files
```

There are a few other directories (`archetypes`, `data`, and `themes`) that are
usually part of a site, but there's no need to worry about these right now. 

Hugo watches for changes in its individual directories, not the main project
directory. This means we can add our own "special directoies" right inside our
project directory. 

Let's add a custom directory for our pre-compiled assets:

```
content
layouts
static-src --- our custom directory

public
```

Now, inside of `static-src` we can arrange our Sass (or Less, Stylus, etc),
scripts, and images however we'd like. Saves to files in this folder won't
trigger Hugo to reload, which means we can use NPM scripts to do the magic and
then send the built assets to the `static` directory. 

#### Organizing `static-src`

Organize `static-src` however you'd like. Even call it whatever you'd like.
These things don't matter. What matters is that there's logic to your naming
that make sense to you (and any others that you may be working with).

Let's say we organize `static-src` like this: 

```
static-src/
  /assets
    /src-sass
      main.sass -- and the rest of our pre-processed css here
    /src-js
      index.js -- and the rest of our pre-processed js here
```

Now, lets wire up the build steps in `package.json`.

```
// package.json

  "scripts": {
    "css:build": "scss-cli --output-style compressed './static-src/src-assets/sass/**/*.{scss,sass}' --glob -o static/assets/css",
    "postcss:build": "autoprefixer -b 'last 2 versions' static/src-assets/css/*.css",
    "css:watch": "onchange './static-src/assets/src-sass/' -- npm run css:build",
    "js:build": "browserify static-src/assets/js/index.js -o static/assets/js/bundle.js",
    "js:watch": "watchify static-src/assets/src-js/index.js -o static/assets/js/bundle.js",
    "build": "npm run css:build && npm run js:build",
    "prewatch": "npm run build",
    "watch": "parallelshell 'npm run css:watch' 'npm run js:watch'",
    "start": "npm run watch",
  },
```

#### A few things here to note:

`paralellshell` is [a package](https://github.com/keithamus/parallelshell) for doing exactly what it says: running tasks in parallel. It's written and maintained by Keith Cirkel, who wrote an [awesome article](http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/) on using NPM as a build tool. If you're famliar with bash commands you may be wondering why to use this package instead of the `&` operator. If so, [see Keith's great answer](https://github.com/keithamus/parallelshell/issues/5) to my asking of this question.


NPM gives `pre` and `post` hooks for each script command you create. These are
really handy. They let us `build` before we `watch` and autoprefix our css after
it's been de-sassified. 




### Why not just use Gulp, Grunt, Broccli, et all? 

Because I find it's beneficial to minimize mental overhead where possible. 

Using NPM as a build tool means that I can `cat package.json` in the terminal to
quickly glance at my entire build pipeline - usually without scrolling. As
a convert from Gulp (which I still use for some things) this is quite nice. Bugs
in things like wrong paths are also much easier to prevent (and catch).

Not having to use wrappers is also beneficial. Grunt, Gulp, and all the others
certainly have handy collections of plugins and such, but most of these are just
wrappers for their elder vanilla-js upstream superiors. This means that package
bugs are fewer and updates quicker. 

