---
date: 2015-07-06T14:15:01+03:00
title: Access Package.json Data via Gulpfile
type: quicktip
keywords: 
  - package.json in gulp
  - package.json in gulpfile
  - gulpfile access package.json
  - share variables gulp package.json
description: > 
  An example of how to access a json-key's value from a package.json file inside of a gulpfile.
url: quicktip/access-package-json-via-gulpfile
---

Much of development seems to consist of wiring together files/data/languages/etc/etc. While trivially easy in many cases, learning how isn't always obvious.

Here's an example of how to access a json-key's value from a `package.json` file inside of a gulpfile, useful for versioning shippable packages. 

**Package.json**

```
{
  "version": "1.0.2",
  ...
}
```


**gulpfile.js**

```
// Variablize access to package.json by requiring it:

var packageJSON = require('./package.json')

// Now we can access any json-key value by calling
// packageJSON.key, where 'key' is the json key. 

// Here's one use case, adding a version number to a shippable package:

gulp.task('build', function() {
    ...
    .pipe(gulp.dest('../' + 'shippable-package-v' + packageJSON.version))
})

// This creates: shippable-package-v1.0.2
```

<!--more-->