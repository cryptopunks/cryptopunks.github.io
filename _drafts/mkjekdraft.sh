#!/bin/sh

# Name: mkjekdraft
# License: BSD
# Page: https://github.com/soko1/mkjekdraft

# Create drafts for jekyll (http://jekyllrb.com) 

# (C) 2014 Sakalou Aliaksei <nullbsd@gmail.com>

editor=vim

echo "Type the URL for this article:"
read url 
url=`echo $url | sed s/' '/'+'/g`
DATE=`date +%F`
FILENAME=$DATE-$url.markdown
cp template $FILENAME
sed -i s/__DATE__/$DATE/ $FILENAME
$editor $FILENAME
echo "$FILENAME - your filename"
