# SS-Hugo

A starting point for Hugo theme development.

## Usage: Setting Up

- `mkdir dir new-project-name`
- `cd new-project-name`
- `hugo new site .` or `hugo new site ./`
- `mkdir themes`
- `cd themes`
- `git clone https://github.com/Pixel-and-Kraft/ss-hugo.git`
- `cd ss-hugo`
- `npm install`

## Usage: Developing a Theme

In 2 terminals, 2 commands:  

1. `gulp`
2. `gulp hugo-watch`

**Command 1:**  
First, cleans destination (build) theme.
Then, runs front-end-asset development watch tasks.  
- .sass/.scss to .css
- script lenting via jshint
- single browserified js build via watchify

**Command 2:**  
A convenience task for running the necessary hugo commands from the development theme's directory (`hugo server --theme=ss-hugo --buildDrafts --watch`). An attempt to reduce complexity. 

**With both commands running (each in their own terminal),** develop away :)

*Note: running 'gulp watch' is the same as simply running 'gulp' except that it skips the initial cleaning task (not recommended, but useful if you're sure of no orphans)*

## ABB (Always Be Building)

A goal of ss-hugo is to introduce no more mental load than necessary. Accordingly, the `gulp watch` command (which is started via the `default` task, the one that runs when via `gulp` in the console) simultaneously watches and builds two theme versions: 

1. A development version
2. A deployment version

In **the development version,** scripts and styles include source maps for sane debugging.

In **the deployment version,** scripts and styles are minified. No source maps are included. 

## Note

- A work in progress. 
- Use at your own risk! 
- Feel free to request insight/help and such in the issues.
- Insight/feedback/PRs welcomed.

---

**For the Curious:**  
The repo's "ss" is short for "Solid Start."

see here for npm cli flags:  
https://docs.npmjs.com/misc/config
