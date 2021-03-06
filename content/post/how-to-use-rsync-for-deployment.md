---
date: 2015-03-15T09:31:12+03:00
title: How To Use Rsync for Deployment 
summary: > 
  Deployment options abound. This means that choosing one can be quite overwhelming. One simple yet effective approach is to use `rsync`, a handy command line utility.
---

<!--see:
 http://www.thegeekstuff.com/2010/09/rsync-command-examples/ 
 http://aaronlord.is/deploying-to-multiple-environments-via-git/
-->

Deployment options abound. This means that choosing one can be quite overwhelming.

Rather than try and provide a complete list of deployment options (Chris Coyier [already did that](https://css-tricks.com/deployment/) a while back), I'd like to share about one that I've recently begun using on a number of small projects: rsync.

### rsync - the big picture

`rsync` is a simple but powerful command line utility. The nerdy-way of learning about a such things is to simply "man the command." In other words, bring up the [man page](http://en.wikipedia.org/wiki/Man_page) for the command in question. 

```
$ man rsync
```

> Rsync is a fast and extraordinarily versatile file copying tool. It can copy locally, to/from another host over any remote shell, or to/from a remote rsync daemon. It offers a large number of options that control every aspect of its behavior and permit very flexible specification of the set of files to be copied. It is famous for its delta-transfer algorithm, which reduces the amount of data sent over the network by sending only the differences between the source files and the existing files in the destination. Rsync is widely used for backups and mirror‐ing and as an improved copy command for everyday use.

> Rsync finds files that need to be transferred using a "quick check" algorithm (by default) that looks for files that have changed in size or in last-modified time. Any changes in the other preserved attributes (as requested by options) are made on the destination file directly when the quick check indicates that the file’s data does not need to be updated.

> Some of the additional features of rsync are:

>
  - support for copying links, devices, owners, groups, and permissions
  - exclude and exclude-from options similar to GNU tar
  - a CVS exclude mode for ignoring the same files that CVS would ignore
  - can use any transparent remote shell, including ssh or rsh
  - does not require super-user privileges
  - pipelining of file transfers to minimize latency costs
  - support for anonymous or authenticated rsync daemons (ideal for mirroring)

<small>Note: the above is a bit abbreviated from the original</small>


#### In Other Words:

Rsync is a command line interface tool with superpowers.  
A mere *1-line* rsync command can send your entire site to a remote server (or do the opposite), quickly and securely.

Let's learn how to use it. 


## Deploying with `rsync`

#### Formula:  

`$ rsync options source destination`

#### Examples:  

```
        ⊢-- options --⊣   ⊢-- source path ---⊣   ⊢---- destination path -----⊣
$ rsync   --delete -r        ./public            user@domain.com:/path/to/location/on/remote
```

#### Local &#8594; Remote


```
$ rsync --delete -r public/ user@your-domain.com:/path/to/location/on/remote
```

#### Remote &#8594; Local


```
$ rsync --delete -r user@your-domain.com:/path/to/location/on/remote ./
```



### Tips

#### `--delete`

Passing this flag as an option deletes the destination target before copying-over the new. This is handy to ensure exact replication between development and production environments. In some cases, though, this isn't desired - - use it wisely. 

#### Test First

Rsync has the option to do a "dry run," meaning it will not actually copy anything. This is great for testing your rsync command to ensure you're not going to break anything. 

To do a dry run: 
add `--dry-drun` or `n` to the options 


#### Understand the trailing slash `/`

For the source string of an rsync command a trailing slash (or lack thereof) **is significant.** 

**Include** the trailing slash to include the directory itself: 

```
$ rsync /my/local/site/ user@domain.com/path/to/remote/root
[result...]
/path/to/remote/root/file1
/path/to/remote/root/file2
/path/to/remote/root/file3
/path/to/remote/root/file4
[...etc]
```

**Do not include** the trailing slash to not include the directory itself. 


```
$ rsync /my/local/site user@domain.com/path/to/remote/root
[result...]
/path/to/remote/site/root/file1
/path/to/remote/site/root/file2
/path/to/remote/site/root/file3
/path/to/remote/site/root/file4
[...etc]
```


### When `rsync` Isn't Good For Deployment

`rsync` won't work for deployment when one needs to trigger or perform certain server tasks pre or post deploying. Perhaps the most common need here in restarting a service. Sites running on Ghost are a good example of this, though of course there are plenty of others. For these types of scenarios, a formal continuous integration setup is a good route.

For folks who want to integrate as thoroughly as possible with Git or another form of version control, it'd still be possible to trigger an `rsync` command via custom pre and post commit hooks. I just make sure to only run an `rsync` deployment after committing and pushing any changes. 

