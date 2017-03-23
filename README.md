# beaker-plugin-safe-authenticator

**Maintainer:** Krishna Kumar (krishna.kumar@maidsafe.net)

SAFE Authenticator plugin for SAFE Browser.

|Linux/OS X|Windows|
|:---:|:--------:|
|[![Build Status](https://travis-ci.org/maidsafe/beaker-plugin-safe-authenticator.svg?branch=master)](https://travis-ci.org/maidsafe/beaker-plugin-safe-authenticator)|[![Build status](https://ci.appveyor.com/api/projects/status/04100mp7gtjnr3c1/branch/master?svg=true)](https://ci.appveyor.com/project/MaidSafe-QA/beaker-plugin-safe-authenticator/branch/master)|


## Dependency

This project depends on [safe_client_libs](https://github.com/maidsafe/safe_client_libs). The dependency is specified as a git submodule.

## Development

Rust and Node.js are required for development.

1. Clone the project
2. Run `git submodule update --init --recursive --remote`
3. Run `npm install` to install the Node.js dependencies
4. Build the native modules
   
   **Actual routing**
   ```
   $ npm run build-libs
   ``` 
   
   **Mock routing**
   ```
   $ npm run build-libs features="mock-routing"
   ```
   
5. `npm run build` will build the project to the `dist` folder

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