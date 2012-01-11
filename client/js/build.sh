#!/bin/bash
#Builds the current directory using r.js


if [[ -d 'release/' ]]; then
  rm -rf 'release/'
fi

node libs/r.js -o app.build.js