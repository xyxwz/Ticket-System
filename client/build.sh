#!/bin/bash
#Builds the current directory using r.js

if [[ -d 'js/release/' ]]; then
  rm -rf js/release/
fi

echo "Building source with r.js"
cd js/ && node libs/r.js -o app.build.js &> /dev/null && cd ../

if [[ $? == 0 ]]; then
  # Update timestamp on manifest.appcache
  now="# `date +%s`"
  echo "Updating appcache with new timestamp -`echo $now | sed 's/#//'`"
  sed -i "2 s/# [0-9]*/$now/" manifest.appcache
fi

# compile less styles
if ! which lessc &> /dev/null; then
  echo "Less not found, you need less to compile a release"
else
  echo "Building less files into css/bundle.css"
  lessc --yui-compress css/less/main.less 1> css/bundle.css
fi

exit