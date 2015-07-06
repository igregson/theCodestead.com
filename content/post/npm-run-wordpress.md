---
date: 2015-07-04T10:28:18+03:00
title: NPM Run WordPress
keywords:
  - npm run wordpress
  - npm run wp
  - npm wordpress
  - npm wp
  - node wordpress
  - node wp
  - modern wordpress
  - modern wordpress workflow
  - modern wp
  - modern wp workflow
description: > 
  Learn a modern and nimble WordPress workflow for theme/plugin development that uses Node's package manager: NPM.
summary: > 
  Having to work with WordPress doesn't require abandonment of developer joy, at least to a certain extent. Learn a modern and nimble WordPress workflow for theme/plugin development that uses Node's package manager: NPM.
---

Having to work with WordPress doesn't require abandonment of developer joy, at least to a certain extent.

I've recently refined my general WordPress-based project development workflow. The catalyst was a recent Ghost theme created by my wife and I which we adapted/ported to WordPress ([Blockster](http://crtv.mk/q0ANV)). All the while, this workflow is useful for any WordPress related project: themes, plugins, specific sites, etc.


I'm using NPM for build/watch and deployment purposes. Though I've yet to do any full-stack Node development, I do love the unique combination of power and simplicity that NPM brings to the development process.

### NPM?

If you're not familiar with NPM some reason, the acronym stands for **N**ode **P**ackage **M**anager. In other words, it's the command line tool to use for installing, uninstalling, updating, and performing other management type tasks for packages of code and it runs on Node.js (but doesn't require a node-specific project to be useful). Typically these packages are managed on a project-by-project basis, though it's also possible (and sometimes desirable) to use NPM for system-wide (global) package management.

While at it's heart NPM is a package management tool, it can also be used for much more. Here's a short list of a few other usages:

- Building
- Deploying
- Testing
- Project scaffolding/initiating
- Project configuring
- Setting environment/server variables

Of these, building is a good first place to start for using NPM in a modern WordPress development worfkflow.

> Note: Though it goes without say, you'll need both Node.js and NPM (often bundled with Node) installed on your system in order to use the workflow outlined below.

> Also: As pre/supplemental reading to the following, [this post](http://blog.keithcirkel.co.uk/how-to-use-npm-as-a-build-tool/) is extremely valuable.


### Command-line PHP Server

The key to using NPM as a build tool for WordPress is the surprisingly seldom-spoken of **php command line server*. Did you know that you can start a php server from the command line? I didn't.

> Note: You'll need php installed on your system and in your path to run a php command-line server. To test/ensure that your system is ready, open up a terminal and type `php -v`. If you get back version information about php on your system you're good to go. Otherwise, install php.

To start a PHP server from the command line simply type `php -S localhost:3000`. You can change `3000` to any open port. The root directory from where that command is run is the web root for that php process.

This is an extremely handy way to quickly test different php applications without fiddling with monolithic LAMP stacks (XAMPP, MAMP, WAMP, etc, etc). For example, I recently learned about the incredibly-awesome-and-promising [Cockpit API-driven CMS](http://getcockpit.com/) and wanted to quickly give it a test flight. With the php cli-server, doing so was as simple as
```html
git clone git@github.com:aheinze/cockpit.git
cd cockpit
php -S localhost:3000
```
Then, I simply opened a browser and went to localhost:3000. That was it!

## The NPM-WordPress Workflow

**TL;DR -** Add this line to a package.json script entry from the root of a theme directory to start a php server that listens for changes and effectively turns NPM into a WordPress development tool (assuming NPM is being used for other build tasks):
```
"wordpress": "cd ../../../ && pwd && php -S 127.0.0.1:7000"
```

### Step 1: Download WordPress

- visit https://wordpress.org/download/
- click `Download WordPress [version]`
- move the unzipped download to a directory of your choice

### Step 2: Create a MySQL Database

There's no reason to be afraid of working with MySQL directly from the command-line. It's really much easier than many may fear. 

Adapted from the [official WP docs](http://codex.wordpress.org/Installing_WordPress#Using_the_MySQL_Client):

```sql
$ mysql -u adminusername -p
Enter password:

// welcome text

mysql> CREATE DATABASE databasename;
Query OK, 1 row affected (0.00 sec)

mysql> GRANT ALL PRIVILEGES ON databasename.* TO "wordpressusername"@"localhost"
    -> IDENTIFIED BY "password";
Query OK, 0 rows affected (0.00 sec)

mysql> FLUSH PRIVILEGES;
Query OK, 0 rows affected (0.01 sec)

mysql> EXIT
```

### Step 3: `wp-config.php`

- Make a copy of `wp-config-sample.php` and name it to `wp-config.php`
- In the `MySQL Settings` (around line 21), enter the appropriate credentials. For example:

```php
// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'enter-database-name-here');

/** MySQL database username */
define('DB_USER', 'enter-wordpress-mysql-username-here');

/** MySQL database password */
define('DB_PASSWORD', 'enter-mysql-database-password-here');

/** MySQL hostname */
define('DB_HOST', 'localhost');

```

### Step 4: `package.json`

- Either in your theme or plugin directory, setup a `package.json` file. I like to use NPM itself to do this: `npm init` (after answering the questions from `npm init` you'll have a `package.json` file)
- Setup the `scripts` section of `package.json`. If you used `npm init` to create `package.json` then you'll have one item in the `scrpts` section called `test`. Delete this. Then add our WordPress/PHP server task:
`"wordpress": "cd ../../../ && pwd && php -S 127.0.0.1:7000"`
Call this whatever you'd like. Though I'm using `wordpress` here I prefer the shorter `php`. Especially since the task is simply starting a PHP server, calling it `php` seems better.
- Make sure in the above task that the change directory `cd` command brings you to the root of your WordPress installation. This is necessary for the PHP server to actually serve WordPress.
- Start the server:
`npm run wordpress`
- Open a browser and go to `localhost:3000`
- Follow the WordPress installation steps.

### Step 5: Setup build tasks

The last and biggest step of them all: setting up the build tasks to run via NPM.

These will differ with the particular needs of each project. For the sake of completeness, here are the full contents of the above mentioned Blockster theme's `package.json` in hopes that you can gather from it an idea of what's possible with this approach:

```
{
  "name": "blockster-wp",
  "version": "1.0.0",
  "description": "Filter, Sort, & More",
  "main": "index.js",
  "config": {
    "postcssPlugins": "require('autoprefixer')(), require('lost')()"
  },
  "scripts": {
    "php": "cd ../../../ && pwd && php -S 127.0.0.1:7000",
    "css:b": "NODE_PATH=$PWD && stylus --compress --use poststylus --with \"[$npm_package_config_postcssPlugins]\" --use rupture --use typographic ./app/assets-src/src-css/ --out ./app/assets/css",
    "css:w": "NODE_PATH=$PWD && stylus --compress --use poststylus --with \"[$npm_package_config_postcssPlugins]\" --use rupture --use typographic --sourcemap --sourcemap-base ./app/assets-src/src-css/ --watch ./app/assets-src/src-css/ --out ./app/assets/css",
    "js:b": "browserify app/assets-src/src-js/bundle/alpha.js -d -p [minifyify --map bundle.map.json --output app/assets/js/bundle.map.json] > app/assets/js/bundle.js",
    "postjs:b": "browser-sync reload",
    "js:w": "onchange 'app/assets-src/src-js/bundle/**' -- npm run js:b",
    "jsV:b": "cat app/assets-src/src-js/vendor/** > app/assets/js/vendor.js",
    "jsV:w": "onchange './app/assets-src/src-js/vendor/' -- npm run jsV:b",
    "browserSync": "browser-sync start --proxy 127.0.0.1:7000 --logLevel 'info' --no-ghost-mode --no-open --no-notify --files '**/*, !app/assets-src/**, !app/assets-src/src-css/**, !app/assets/css/*.map, !app/assets/js/**, !.git/**'",
    "build": "npm run css:b && npm run js:b && npm run jsV:b",
    "watch": "parallelshell 'npm run css:w' 'npm run js:w' 'npm run jsV:w' 'npm run browserSync'",
    "prewatch": "npm run build",
    "start": "npm run watch",
    "zip": "zip -q -r ../Blockster-WP.zip * -x 'node_modules/*' '.git/*' "
  },
  "author": "Pixel & Kraft",
  "license": "Commercial",
  "devDependencies": {
    "autoprefixer": "^5.2.0",
    "browser-sync": "^2.7.5",
    "browserify": "^10.2.1",
    "imagesloaded": "^3.1.8",
    "isotope-layout": "^2.2.0",
    "jquery-browserify": "^1.8.1",
    "layzr.js": "^1.3.0",
    "lost": "^6.4.0",
    "minifyify": "^7.0.0",
    "onchange": "^1.1.0",
    "parallelshell": "^1.1.1",
    "perfect-scrollbar": "^0.6.2",
    "poststylus": "^0.2.0",
    "rupture": "^0.6.1",
    "stylus": "^0.51.1",
    "typographic": "^2.9.3",
    "watchify": "^3.2.1"
  }
}
```


#### Notes on the above build tasks:

To start a work session, from the root directory of the theme I open two terminals and run a command in each:
`npm run php`
and
`npm start`

I then see php-specific errors in the terminal running the php task (server) and style/script info in the other.

- there are really only a few core tasks:
  - styles
  - scripts
  - browser sync
  - php server
- `:w` means "watch"
- ':b' means "build"
- the *V* in `jsV:b` and `jsV:w` stands for *vendor*
- `NODE_PATH=$PWD` is a really handy hack to prevent need for global npm-package installs in efforts to incorporate [Post CSS](https://github.com/postcss/postcss) goodness into my style tasks (thanks to GitHub user seaneking for [PostStylus](https://github.com/seaneking/poststylus) and GitHub user bedeoverend for [suggesting the approach](https://github.com/seaneking/poststylus/issues/1)).
- `$npm_package_config_postcssPlugins` is a handy usage for NPM's config settings that can be used as variables in the build tasks (though the syntax is unfortunately verbose).

If there are others parts of the scripts/tasks that could use more explanation just leave a comment and I'll be sure to better explain.

## Why NPM and not just [Gulp|Grunt|Broccoli|etc|etc]?

Because I find the NPM-script approach to be simpler yet just as powerful as any alternative. 

<div class="twitter-center">
  <blockquote class="twitter-tweet" lang="en"><p lang="en" dir="ltr">If you don’t actively fight for simplicity in software, complexity will win.&#10;&#10;…and it will suck.</p>&mdash; Henrik Joreteg (@HenrikJoreteg) <a href="https://twitter.com/HenrikJoreteg/status/364989455414726657">August 7, 2013</a></blockquote>
  <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
</div>

## Limitations

The above is an approach to using NPM as a build tool for an agile WordPress-theme-development workflow that fits my current needs quite well. They may or may not fit yours. Be sure to consider the limitations:

### `.htaccess`

One important limitation to know about is that `.htaccess` files have effect when using the command-line PHP server (because `.htaccess` files are an Apache server thing). Generally, this shouldn't be a problem, but it's still important to understand.

### Reproducability

Another limitation is that the above approach relies on several system-wide-installed dependencies: PHP and MySQL. This risks bugs between development/production and developer/developer (if working in a team) because of version and other discrepancies.

## Ship Early, Ship Often, Iterate with Ease

I love the nimbleness that comes with using the PHP command-line server. Server-side I'm usually working with Nginx. I generally try to avoid Apache whenever possible. So far, this approach has me well - perhaps it will help you too :)