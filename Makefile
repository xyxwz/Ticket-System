REPORTER = spec

test: test-api

test-api: test-api-unit test-api-functional

test-api-unit:
	@NODE_ENV=test
	@./node_modules/.bin/mocha \
			--reporter $(REPORTER) \
			api/test/unit/*.test.js

test-api-functional:
	@NODE_ENV=test
	@./node_modules/.bin/mocha \
			--reporter $(REPORTER) \
			api/test/functional/*.test.js


.PHONY: test test-api test-api-unit test-api-functional