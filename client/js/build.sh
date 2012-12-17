#!/bin/bash
#Builds the current directory using r.js


if [[ -d 'release/' ]]; then
  rm -rf 'release/'
fi

echo "Building source with r.js"
node libs/r.js -o app.build.js &> /dev/null


if [[ $? == 0 ]]; then
  # Update timestamp on manifest.appcache
  now="# `date +%s`"
  echo "Updating appcache with new timestamp -`echo $now | sed 's/#//'`"
  sed -i "2 s/# [0-9]*/$now/" ../manifest.appcache

  # Move require, and remove all unneeded files
  echo "Removing unnecessary files from ./release"
  mv 'release/libs/require/require-jquery.js' 'release/'
  find release/* \( -iname "*" ! -iname "main.js" ! -iname "require-jquery.js" \) -delete
fi
