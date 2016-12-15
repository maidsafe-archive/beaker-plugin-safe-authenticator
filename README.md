# beaker-plugin-safe-authenticator

**Maintainer:** Krishna Kumar (krishna.kumar@maidsafe.net)

SAFE Authenticator plugin for SAFE Browser.

|Linux/OS X|Windows|
|:---:|:--------:|
|[![Build Status](https://travis-ci.org/maidsafe/beaker-plugin-safe-authenticator.svg?branch=master)](https://travis-ci.org/maidsafe/beaker-plugin-safe-authenticator)|[![Build status](https://ci.appveyor.com/api/projects/status/04100mp7gtjnr3c1/branch/master?svg=true)](https://ci.appveyor.com/project/MaidSafe-QA/beaker-plugin-safe-authenticator/branch/master)|


# Structure

- `src`: application source code
    + `app`: the frontend Javascript code - cross-platform
    + `auth`: the backend Rust library code - cross-platform
    + `beaker`: beaker specific integration code
    + `cordova`: the cordova integration code / our library
    + `lib.rs`: backend library entry point
- `config`:
    + `cordova`: cordova build configuration files
    + `webpack`: javascript webpack build configurations
- `locales`: i18n for JS app
- `test`: cross platform (integration) tests (each individual part may have their own tests inside their src folders)

Further, through the build system the following will be created or used:

- `dist`: javascript distribution build
- `target`: rust library builds

The following are needed for cordova build:
- `hooks`: links to `config/cordova/hooks`, allows for configuration of build hooks in the cordova process
- `platform`: cordova build infrastructure
- `plugins`: if you install further plugins, this is where they'll land
- `www`: links to `config/cordova/www`, the entry point for the cordova app

# Build

You need NodeJS and Rust (stable) minimally. If you want to do cordova builds, you will also require a cordova setup (see below). The binary library will be build for development right when you run `npm install` and can be updated through that or by directly running `cargo build` in the root directory.


## Cordova

TBD

## Release build

You will need the entire cross-platform chain setup in order to build a release version. Run `npm run release` and see the universe being compiled into neat little bundles!

# License

Licensed under either of

* the MaidSafe.net Commercial License, version 1.0 or later ([LICENSE](LICENSE))
* the General Public License (GPL), version 3 ([COPYING](COPYING) or http://www.gnu.org/licenses/gpl-3.0.en.html)

at your option.

# Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the
work by you, as defined in the MaidSafe Contributor Agreement, version 1.1 ([CONTRIBUTOR]
(CONTRIBUTOR)), shall be dual licensed as above, and you agree to be bound by the terms of the
MaidSafe Contributor Agreement, version 1.1.
