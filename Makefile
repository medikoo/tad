SHELL = bash

install:
	npm install

test:
	./bin/tad lib

.PHONY: install test
