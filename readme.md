# Tikk
## A PBS ticket app for schools

#### Build Docker container for local testing on osx
- `docker build -t iankulin/tikk .`

#### Build Docker container for multi architecture
- Start Docker Desktop
- If buildx is not running, `docker buildx create --use`
- `docker buildx build --push --platform linux/arm64,linux/amd64 -t iankulin/tikk .`
