version=$(jq -r '.version' package.json)
mkdir -p packages
cd dist
zip -r ../packages/page-limiter-$version.zip *