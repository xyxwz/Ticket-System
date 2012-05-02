#!/bin/bash
#Builds the current directory using r.js


if [[ -d 'release/' ]]; then
  rm -rf 'release/'
fi


node libs/r.js -o app.build.js

# Update timestamp on manifest.appcache
a="# "
b=`date +%s`
now=$a$b

sed "2 s/# [0-9]*/$now/" ../manifest.appcache > tmp.appcache;mv tmp.appcache ../manifest.appcache


if [[ $? == 0 ]]; then
	mv 'release/libs/require/require-jquery.js' 'release/'
	find release/* \( -iname "*" ! -iname "main.js" ! -iname "require-jquery.js" \) -delete
fi