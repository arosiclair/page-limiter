version=$(jq -r '.version' package.json)
mkdir -p packages
zip -j packages/page-limiter-$version.zip dist/*