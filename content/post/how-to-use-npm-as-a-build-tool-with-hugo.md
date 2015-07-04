---
date: 2015-04-04T22:57:35+03:00
title: How To Use NPM as a Build Tool with Hugo
keywords: 
  - hugo 
  - npm as build tool
  - hugo preprocessor
  - golang build tool
  - golang static build tool
  - hipster website building
description: >
  Hugo is a fast and all-around awesome tool for creating website. NPM has build-tool superpowers that folks seem to just now be realizing. Combining the two makes for a sweet setup. Let's learn how.
summary: >
  Hugo is a fast and all-around awesome tool for creating website. NPM has build-tool superpowers that folks seem to just now be realizing. Combining the two makes for a sweet setup. Let's learn how.
---

> **TL;DR** &ndash; Use NPM as a build tool for processing raw-asset files into one of Hugo's default directories which will trigger's Hugo's watcher to reload (which makes for a simple yet powerful development setup).

[Hugo](http://gohugo.io/) is ~~a rather~~ an incredibly powerful tool for building websites. At its core it's a static site generator. It's built in the Go programming language. It's *incredibly* fast.

NPM is a package manager. Though the acronym stands for **Node** **P**ackage **M**anager its use extends beyond Node.js projects. Namely, it can be used as a simple yet powerful build tool. 

Let's learn how to use NPM with Hugo to process our scripts and styles.

### Requirements

Here are the bare-bones requirements of what I'd consider essential for
developing a modern site:

- CSS pre & post processing
- JS concatenation/bundling
- Minification of CSS & JS
- A live-reloading dev environment
- JS and CSS source maps (for easy debugging)

### Hugo Provides the Watcher (live reloading)

Out of the box, Hugo includes a super fast and resource-friendly `watch` feature that "just works." There are of course fancier ways to watch a build
environment, but when working with Hugo I'm grateful for the simplicity and "just-works" nature of its built-in watch feature. 

### A Hugo Project's Default Structure

Creating a new Hugo-based project is easily done by running `hugo new site`. This tells Hugo to setup a new project with a default directory structure, which looks like this:

```html
content/
layouts/
static/
archetypes/
data/
public/
```
> Note: `public` is the root directory of the built site. If desired, this can be changed in your project config file (via the `publishdir` key, see [here in the Hugo docs](http://gohugo.io/overview/configuration/)).

#### Hugo's Theme Directory

Hugo has a theme feature (and it's pretty sweet). To use it, add a `themes` directory to the default project structure (outlined above). Theme directories go inside of the `themes` directory. It's that simple. 

Let's add a `themes` directory to our Hugo project and the default structure for a theme (notice how it mirrors the structure of the base project's root):

```
content/
layouts/
static/
archetypes/
data/
themes/
  my-hugo-theme/
    content/
    layouts/
    static/
    archetypes/
```

### The Behavior of Hugo's Watcher

Hugo's watcher **only watches for changes inside of default Hugo directories,** the ones listed above.

#### Being resourceful codesteaders...

The fact that Hugo only watches for changes in its default directories is very handy for our purposes. Essentially, this allows us to harness the Hugo watcher for our development/building purposes via NPM.

Broken down, with Hugo's watcher we can...

- organize our unprocessed styles, scripts, and other files (`.scss|.sass|.styl|.less|.etc` `.coffee|.js|.etc`) however we'd like, only **they cannot be inside of Hugo's core directories**. 
- utilize NPM build tasks (scripts) to process and send post/ready files to Hugo's core directories that will then trigger Hugo's watcher to reload. 

> Aside: Before learning about this behavior of Hugo's watcher I was organizing my unprocessed asset files outside of my Hugo projects' roots. Learning that I didn't need to do this brought great happiness.

### Unprocessed CSS and JS Source Organization

In efforts to keep things simple, I organize all project assets in a project (or theme) root directory named `static-src/`. I like to more-or-less mirror the directory structure of `static-src/` to the structure inside of Hugo's `static/` directory. Why? Doing so seems intuitive, reduces mental overhead, and generally keeps things simple.

Let's add it into our directory structure (with examples of using and not using a theme): 

```html
<!-- Without a theme -->

content/
layouts/
archetypes/
data/
static/
static-src/  <!-- our custom directory -->

<!-- With a theme -->

content/
layouts/
static/
archetypes/
data/
themes/
  my-hugo-theme/
    content/
    layouts/
    static/
    archetypes/
    static-src/  <!-- our custom directory -->
```

Now, inside of `static-src` we can arrange our unprocessed CSS (Sass, Stylus, Less, etc), JS, and other assets (like images and such) as we please. 

Changes to files inside of `static-src` won't trigger Hugo's watcher. We'll use NPM scripts to watch the files, process them as necessary, and send them to the `static` directory (which will trigger Hugo's watcher and reload our project). 


#### Understand How Hugo Handles the `static/` Directory

It's important to understand that everything inside of Hugo's `static/` directory goes to the root of the built site (`public/`, by default).

Essentially, this:

```html
static/
  assets/
    main.css
    bundle.js
```

Gets built to this:

```
public/
  assets/
    main.css
    bundle.js
```

In other words, there's no `static` directory in the built/deployable site.

### `static-src` Organization

You can organize your source files however you or your team prefer. For now, let's do it like this: 

```html
static-src/
  /assets
    /src-sass
      main.sass  <!-- and the rest of our unprocessed css here -->
    /src-js
      index.js  <!-- and the rest of our unprocessed js here -->
```

### Creating the NPM Build Chain

First off, if you're not familiar with the general idea of using NPM as a build tool, I recommend reading [this excellent article on the topic](http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/).

Now, with a general understanding of harnessing NPM's build-tool potential, lets wire up our `package.json` file.

```
// package.json

"scripts": {
  "css:build": "scss-cli --source-map --output-style compressed './static-src/src-assets/sass/**/*.{scss,sass}' --glob -o static/assets/css",
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

#### Notes on the above:

- **Package `parallelshell`**  
`paralellshell` is [a package](https://github.com/keithamus/parallelshell) for doing exactly what it says: running tasks in parallel. It's written and maintained by Keith Cirkel, who wrote the [above mentioned article](http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/) on using NPM as a build tool. If you're familiar with bash commands you may be curious about the reasons to use this package instead of the `&` operator. If so, [see Keith's answer](https://github.com/keithamus/parallelshell/issues/5) to my asking of this question.

- **Package `onchange`**  
Since we still need to watch for changes in our source assets it's necessary to use a specific package. There are several out there. I settled on the [onChange package](https://github.com/Qard/onchange) for now.

- **NPM `pre` and `post` hooks**  
NPM gives `pre` and `post` hooks for each script command you create. These are
*really* handy. They let us do things like building before we start watching and autoprefix our css after it's been de-pre-processorified. 

### More is Possible

It's possible to use NPM's build-tool superpowers for much more than the above. Asset versioning is one. Deployment another. Image sprinting and minification are others.

### This is how I'm currently building The Codestead.

If you look at `package.json` in [The Codestead's source](https://github.com/igregson/theCodestead.com) you'll see something like the above.

> UPDATE: High on my priority list is to switch from Sass to Stylus... stay tunned for an updated `package.json`

### Improvements?

See something above that could be improved? Please share!
