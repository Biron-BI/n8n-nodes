TAG=$(git describe --tags --abbrev=0)

echo VERSION=$TAG

npm run build

docker build -f docker/Dockerfile -t europe-docker.pkg.dev/artifact-registry-412407/docker-image/n8n:$TAG .

docker push europe-docker.pkg.dev/artifact-registry-412407/docker-image/n8n:$TAG