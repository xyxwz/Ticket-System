#!/bin/bash
#Builds the current directory using r.js

if [[ -d 'release/' ]]; then
  rm -rf js/release/
fi

echo "Building source with r.js"
cd js/ && node libs/r.js -o app.build.js &> /dev/null && cd ../

if [[ $? == 0 ]]; then
  # Update timestamp on manifest.appcache
  now="# `date +%s`"
  echo "Updating appcache with new timestamp -`echo $now | sed 's/#//'`"
  sed -i "2 s/# [0-9]*/$now/" manifest.appcache

  # Move require, and remove all unneeded files
  echo "Removing unnecessary files from js/release"
  mv js/release/libs/require/require-jquery.js js/release/
  find js/release/* \( -iname "*" ! -iname "main.js" ! -iname "require-jquery.js" \) -delete
fi

# compile less styles
if ! which lessc &> /dev/null; then
  echo "Less not found, you need less to compile a release"
else
  echo "Building less files into css/bundle.css"
  lessc --yui-compress css/less/main.less 1> css/bundle.css
fi

exit