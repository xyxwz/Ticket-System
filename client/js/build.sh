#!/bin/bash
#Builds the current directory using r.js


if [[ -d 'release/' ]]; then
  rm -rf 'release/'
fi


node libs/r.js -o app.build.js


if [[ $? == 0 ]]; then
	mv 'release/libs/require/require-jquery.js' 'release/'
	find release/* \( -iname "*" ! -iname "main.js" ! -iname "require-jquery.js" \) -delete
fi