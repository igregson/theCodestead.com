---
date: 2015-04-04T22:57:35+03:00
title: NPM as a Build Tool with Hugo
description: Hugo is a fast and all-around awesome tool for creating website. NPM has build-tool superpowers that folks seem to just now be realizing. Combining the two makes for a sweet setup. Let's learn how.
summary: Hugo is a fast and all-around awesome tool for creating website. NPM has build-tool superpowers that folks seem to just now be realizing. Combining the two makes for a sweet setup. Let's learn how.
---

Hugo's a rather powerful tool for making websites. At its core it's a static
site generator, but it's also capable of quite a bit more. 

NPM's a rather powerful package manager. It's also a powerful build
tool. 

Let's learn how to setup NPM with Hugo to process our scripts and styles.

<!--more-->

### Requirements

Here are the bare-bones requirements of what I'd consider essential for
developing a modern site:

- CSS pre & post processing
- Js concatination/bundling
- Minification of CSS & Js
- A live-reloading dev environment
- Js and CSS source maps (for easy debugging)

### Hugo Provides the Watcher

Out of the box, Hugo includes a super fast and resource friendly `watch` feature
that "just works". There are of course fancier ways to watch a build
environment, but when working with Hugo I'm grateful for the simplicity and "just-works" nature of its built-in watch feature. 

### Hugo's Directory Structure

Here's the default Hugo directory structrue:

```
// Hugo-project-root

content/
layouts/
static/
archetypes/
data/
public/  --- where the site is built to, of no interest now
```

#### Hugo's Theme Directory

Hugo theme directories mirror the parent project root:

```
// Hugo-project-foot

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

One really nice thing about Hugo's watcher is that **it only watches for changes inside of the above core Hugo directories.** 

#### Why is this good?

This is good because it allows us source-file-organization freedom and gives NPM scripts a way to harness Hugos watcher. 

In other words, this allows us to:

- organize our unprocessed asset files (unprocessed CSS and Js) however we'd like (so long as they're outside of Hugo's core directories. 
- utilize NPM to watch for changes and send the processed versions to Hugo's core directories that will then trigger Hugo's watcher to reload. 

> Before learning the above behavior of Hugo's watcher I was organizing my unprocessed asset files outside of the root. Learning that I didn't need to do this brought incredible joy - no joke.

### Unprocessed CSS and Js Source Organization

In efforts to keep things simple, I organize all project assets in a project (or theme) root directory named `static-src/`. Inside of `static-src/` I like to more-or-less mirror directory structure to the structure inside of Hugo's `static/` directory. Doing this reduces mental overhead (which is a really good thing). 

Let's add it into our directory structure: 

```
// Hugo-project-root

content/
layouts/
archetypes/
data/
static/
static-src/ --- our custom directory
```

Now, inside of `static-src` we can arrange our unprocessed CSS (Sass, Less, Stylus, etc),
Js, and other assets (like images and such) as we please. 

Changes to files inside of `static-src` won't trigger Hugo's watcher, which means we can use NPM scripts to do the magic and send the built assets to the `static` directory. 


#### Understand How Hugo Handles the `static/` Directory

It's important to understand that everything inside of Hugo's `static/` directory goes to the root of the built site (or, `public/`) 

Essentially, this:

```
// Hugo-project-root

static/
	assets/
		main.css
		bundle.js
```

Gets built to this:

```
// Hugo-project-root

public/
	assets/
		main.css
		bundle.js
```

### `static-src` Organization

You can organize your source files however you or your team prefer. For this demo, let's do it like this: 

```
static-src/
  /assets
    /src-sass
      main.sass -- and the rest of our unprocessed css here
    /src-js
      index.js -- and the rest of our unprocessed js here
```

### Creating the NPM Build Chain

First off, if you're not familiar with the general idea of using NPM as a build tool, I highly recommend giving [this excelletn article on the topic](http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/) a read.

Now, with a general understanding of harnessing NPM build-tool potential, lets wire up our `package.json` file.

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

#### A few things here to note:

##### Package `parallelshell`   
`paralellshell` is [a package](https://github.com/keithamus/parallelshell) for doing exactly what it says: running tasks in parallel. It's written and maintained by Keith Cirkel, who wrote an [awesome article mentioned above](http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/) on using NPM as a build tool. If you're familiar with bash commands you may be wondering why to use this package instead of the `&` operator. If so, [see Keith's answer](https://github.com/keithamus/parallelshell/issues/5) to my asking of this question.

##### Package `onchange`
Since we still need to watch for changes in our source assets it's necessary to use a specific package. After trying several, I found the `onchange` [package](https://github.com/Qard/onchange) to work best for my particular approach. 

##### NPM `pre` and `post` hooks
NPM gives `pre` and `post` hooks for each script command you create. These are
really handy. They let us `build` before we `watch` and autoprefix our css after
it's been de-pre-processor-ified. 

##### The State of Libsass CLI Tools  
Libsass is written in C++. This means we have to use a compiled implementation that has a command line interface (cli). From [the many compiled implementations](https://github.com/sass/libsass/wiki/Implementations)  only some of them have mature CLIs. Still, I've yet to find one that I'm completely happy with. [Node Sass](https://github.com/sass/node-sass) has a very good CLI but I haven't yet gotten it to compile both `.scss` and `.sass` Sass versions (as I prefer to use both). I've also tried working directly with the [the official Sass C CLI](https://github.com/sass/sassc) but it's feature set is still rather sparse. The I found `scss-cli` ([here on Github](https://github.com/paulcpederson/scss-cli)) that fills in Node-Sass's gaps (not accepting file globs and ignoring files that start with an underscore). So `scss-cli` it is for now. 

### More is Possible

It's possible to use NPM's build-tool superpowers for much more than the above. Asset versioning is one. Deployment another. Image spriting and minification yet another. 

### This is How I'm Currently Building TheCodestead

If you [checkout theCodestead's source](https://github.com/igregson/theCodestead.com) you'll see my implementation of something close to the above. One difference is that I'm building things with a theme in order to stay module (should/when I want to do an overhaul). 

### Improvements?

See anything above that could be improved, let me know!
