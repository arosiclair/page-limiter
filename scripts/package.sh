version=$(jq -r '.version' package.json)
if [ -n "$BETA" ]; then
    name="page-limiter-beta-$version"
else
    name="page-limiter-$version"
fi
mkdir -p packages
cd dist
zip -r ../packages/$name.zip *