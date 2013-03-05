#!/bin/bash
# Builds the client application and css

if [[ -d 'js/release/' ]]; then
  rm -rf js/release/
fi

# Minify js source
echo "Building source with r.js"
cd js/ && node libs/r.js -o app.build.js &> /dev/null && cd ../

# compile less source
if ! which lessc &> /dev/null; then
  echo "Less not found, you need less to compile a release"
else
  echo "Building less files into css/bundle.css"
  lessc --yui-compress css/less/main.less 1> css/bundle.css
fi

if [[ $? == 0 ]]; then
  echo "Adding timestamp to bundles"
  echo "/* `date -u` */" > /tmp/stamp.txt
  cp js/release/bundle.js /tmp/bundle.js
  cp css/bundle.css /tmp/bundle.css
  cat /tmp/stamp.txt /tmp/bundle.js > js/release/bundle.js
  cat /tmp/stamp.txt /tmp/bundle.css > css/bundle.css
  rm -f /tmp/stamp.txt /tmp/bundle.css /tmp/bundle.js
fi

exit