# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [3.1.0](https://github.com/medikoo/tad/compare/v3.0.1...v3.1.0) (2021-10-15)

### Features

- Ignore `*.config.js` files when auto-indexing ([1d9ddf2](https://github.com/medikoo/tad/commit/1d9ddf288e8998dc75235647acf046d9e7ea7650))

### Maintenance Improvements

- Upgrade `cli-color` to v2 ([a087ea0](https://github.com/medikoo/tad/commit/a087ea0e89d47b912d99990e6b7e0b56891f7b0e))
- Upgrade `ncjsm` to v4 ([6beead0](https://github.com/medikoo/tad/commit/6beead03f33f5008d27d7f9a58a16dc92be4d563))

### [3.0.1](https://github.com/medikoo/tad/compare/v3.0.0...v3.0.1) (2019-08-30)

### Bug Fixes

- Catch orphaned assertions and expose them as errors ([987e692](https://github.com/medikoo/tad/commit/987e692))
- Let process to gracefully exit ([aa28832](https://github.com/medikoo/tad/commit/aa28832))

## [3.0.0](https://github.com/medikoo/tad/compare/v2.0.1...v3.0.0) (2019-08-30)

### Bug Fixes

- Recognize signatures of async and arrow functions ([7817b0a](https://github.com/medikoo/tad/commit/7817b0a))

### Features

- Ensure to expose unhandled rejections as crashes ([619dfab](https://github.com/medikoo/tad/commit/619dfab))
- Support thenable test returns ([ad83077](https://github.com/medikoo/tad/commit/ad83077))

### BREAKING CHANGES

- Drop support for Node.js versions lower than v0.11.8
- Due to implied thenable support. Objects which have `then`
  method, and are result of test functions, are no longer processed
  further as test dictionaries but instead are processed as promises

## [2.0.1](https://github.com/medikoo/tad/compare/v2.0.0...v2.0.1) (2019-04-30)

### Bug Fixes

- ensure ncjsm as normal dependency ([01913b9](https://github.com/medikoo/tad/commit/01913b9))

# [2.0.0](https://github.com/medikoo/tad/compare/v1.0.0...v2.0.0) (2019-04-30)

### Bug Fixes

- Ensure Node.js v12 support ([eabc639](https://github.com/medikoo/tad/commit/eabc639))

### chore

- bump dependencies ([36e44d1](https://github.com/medikoo/tad/commit/36e44d1))

### Features

- remove outdated 'next' dependency ([88da6ff](https://github.com/medikoo/tad/commit/88da6ff))

### BREAKING CHANGES

- Drop support for Node.js v0.10.16 and below

# [1.0.0](https://github.com/medikoo/tad/compare/v0.2.8...v1.0.0) (2019-02-22)

### chore

- rename binary file to tad.js ([5289439](https://github.com/medikoo/tad/commit/5289439))

### Features

- skip js files starting with '.' in automatic testing ([cce5af6](https://github.com/medikoo/tad/commit/cce5af6))

### BREAKING CHANGES

- Binary file direct name was renamed from bin/tad into bin/tad.js
- JS files starting with '.' are not considered as modules to be tested

<a name="0.2.8"></a>

## [0.2.8](https://github.com/medikoo/tad/compare/v0.2.7...v0.2.8) (2018-09-14)

### Bug Fixes

- support for Node.js version prior v0.12 ([4267dbf](https://github.com/medikoo/tad/commit/4267dbf))
