VERSION ?= 0.4.0
CLI_VERSION_PKG := github.com/miransas/binboi/internal/cli
LDFLAGS := -s -w -X $(CLI_VERSION_PKG).Version=$(VERSION)
CLI_PLATFORMS := darwin/amd64 darwin/arm64 linux/amd64 linux/arm64

.PHONY: build-cli build-server release-cli sync-manifests clean

sync-manifests:
	bash ./scripts/sync-project-manifests.sh

build-cli:
	mkdir -p dist
	CGO_ENABLED=0 go build -trimpath -ldflags "$(LDFLAGS)" -o dist/binboi ./cmd/binboi-client

build-server:
	mkdir -p dist
	CGO_ENABLED=1 go build -trimpath -o dist/binboi-server ./cmd/binboi-server

release-cli: sync-manifests
	mkdir -p dist/release
	for target in $(CLI_PLATFORMS); do \
		GOOS=$${target%/*}; \
		GOARCH=$${target#*/}; \
		ARTIFACT="binboi_$(VERSION)_$${GOOS}_$${GOARCH}"; \
		rm -rf dist/release/$$ARTIFACT; \
		mkdir -p dist/release/$$ARTIFACT; \
		CGO_ENABLED=0 GOOS=$$GOOS GOARCH=$$GOARCH go build -trimpath -ldflags "$(LDFLAGS)" -o dist/release/$$ARTIFACT/binboi ./cmd/binboi-client; \
		tar -C dist/release -czf dist/$$ARTIFACT.tar.gz $$ARTIFACT; \
	done

clean:
	rm -rf dist
