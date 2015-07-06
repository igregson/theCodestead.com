---
date: 2015-04-14T20:15:01+03:00
title: Linux Live USBs - Simple & Powerful Use Case
summary: > 
  Linux live USBs are known as great tools for testing new distros, but they're also handy for much more. Here's one resourceful (and powerful) use case.
---

Linux live USBs are known as great tools for testing new distros, but they're also handy for much more. 

One such use case is **securely wiping hard drives**. 

While doing some spring computer cleaning I finally got around to recycling an old desktop. Before doing so however, I wanted to be responsible and securely wipe its hard drives. 

Initially I went down the path of using a dedicated boot-level program. Perhaps the most well known of these is [DBAN](http://www.dban.org/). After some hangups deciding on the best way to create a DBAN usb from a Linux system (which I run as my primary development machine), I explored some alternatives. 

Shortly thereafter while scrolling through comments on a forum thread (a forum with good info but dated design, which means I unfortunately don't remember the url) someone recommended to "simply use a Linux live USB." Since I like to always have at least one of these around the approach gained immediate fondness. On I went to learn the details and implement them. 

## The Process Overview

Essentially, here's the process: 

1. boot with the live USB
2. open a terminal
3. find out the name of the drive to be wiped
4. run a simple but powerful command

## The Process Nitty-Gritty

To expand with explanation and details (nitty-gritty) on the above steps:

### 1. boot with the live USB

Assuming you have a Linux live USB (find out how to create one [via Google](https://www.google.ru/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=how%20to%20create%20a%20linux%20live%20usb)), insert it into the turned-off machine, then boot. If nothing changes (it still boots into your default operating system) you'll need to move the "USB" option to first priority in your computer's BIOS ([Google can teach you that](https://www.google.ru/webhp?sourceid=chrome-instant&ion=1&espv=2&ie=UTF-8#q=how%20to%20access%20bios), too). Otherwise, your system should boot into a live USB-based Linux session. 

> Which Linux Distro? I prefer [Tails Linux](https://tails.boum.org/) for this type of thing. Since it's a USB-only distro, it's fast and does well on older hardware.


### 2. open a terminal

Simple enough. 

### 3. find out the name of the drive to be wiped

There are multiple ways to do this. I used the `fdisk` utility with its list flag: `fdisk -l`. This should show something like the following:

```
Disk /dev/sdb: 698.7 GiB, 750156374016 bytes, 1465149168 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x4d876080


Disk /dev/sda: 111.8 GiB, 120034123776 bytes, 234441648 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x000efe9d


Partition table entries are not in disk order.
```

The part we're interested in is on the initial line for each device, after "Disk," the `/dev/...` part, the device name. 

For this example, let's say the disk we're wanting to wipe is the first above: `/dev/sdb`

> *NOTE: You need root privileges for the above command to work (ie: append it with `sudo`). If you have trouble using sudo in the live USB session it should provide instructions on how to do so when the trouble arises.*

> FOR TAILS LINUX: If using Tails Linux, you setup a root password right at the beginning of the live USB session.

### 4. run a simple but powerful command

Now the fun part.

Though there are several command utilities that we could use, `dd` is the most commonly suggested.

Here's how to use it to write zeros to the drive (effectively deleting all of a drive's data):

```
dd if=/dev/zero of=/dev/sdb bs=1M
```

And here's how to use it to write random data, rather than zeros (which is likely more secure, but might take a little longer):

```
dd if=/dev/urandom of=/dev/sdb bs=1M
```

> *IMPORTANT: Replace `sdb` with the name of the drive you're wanting to wipe.*

> *NOTE: For more on the `dd` utility, check out [this wiki](http://en.wikipedia.org/wiki/Dd_(Unix)) - (it's worth it, `dd` can be used for a lot more, such as cloning/backing up drives, recovering data, benchmarking drive performance, and other low/disk level operations)*

#### Byte Size

Specifying the byte size (the `bs=1M` part) to 1 Megabyte is optional. The default is 512 bytes. Setting it to 1M speeds up the process without having any negative side effects. 

It's possible that there might be a better optimal byte size for your disk, but to find it you'll need to do a benchmark test or use a utility like [dd-opt](https://github.com/sampablokuper/dd-opt). 

## Lots of Other Uses for Linux Live USBs

In completely general terms without any concrete examples (those are still to come in later posts), there are tons of other resourceful and generally nifty ways to utilize Linux live USBs. 

The general (and beautifully powerful) concept is that the USB session virtually harnesses and has access to querying and manipulating your hardware - without installing a thing. In other words, you get an entire operating system (and it's tools), rather than limited and often clumsy BIOS like tools. 

Linux live USBs are powerful tools that no modern day codesteader should be without :)  

Now you know how to use one to wipe data from a drive. 

Happy spring computer cleaning.