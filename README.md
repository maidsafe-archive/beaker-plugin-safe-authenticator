# beaker-plugin-safe-authenticator

**Maintainer:** Krishna Kumar (krishna.kumar@maidsafe.net)

SAFE Authenticator plugin for SAFE Browser.

|Linux/OS X|Windows|
|:---:|:--------:|
|[![Build Status](https://travis-ci.org/maidsafe/beaker-plugin-safe-authenticator.svg?branch=master)](https://travis-ci.org/maidsafe/beaker-plugin-safe-authenticator)|[![Build status](https://ci.appveyor.com/api/projects/status/04100mp7gtjnr3c1/branch/master?svg=true)](https://ci.appveyor.com/project/MaidSafe-QA/beaker-plugin-safe-authenticator/branch/master)|

## Dependency

This project depends on [safe_client_libs](https://github.com/maidsafe/safe_client_libs) and [system_uri](https://github.com/maidsafe/system_uri). The dependencies are specified as git submodule.

## Development

### Prerequisites

  * Node.js 6.5.0 (we recommend installing it via [nvm](https://github.com/creationix/nvm))
  * [Git](https://git-scm.com/)

1. Clone the project
    ```bash
    $ git clone https://github.com/maidsafe/beaker-plugin-safe-authenticator.git
    ```

2. Install the Node.js dependencies.
    ```bash
    $ npm i
    ```

3. Build the native modules
   
   ```
   $ npm run build-libs
   ``` 
   > Add `--` before using following options.
   * If you specify `--features=mock-routing` binary will use mock routing or else actual routing will be used.
   * If you specify `--clean`, will clean all the cargo dependencies installed and do a fresh build. To manually clean the dependencies run `npm run clean-libs`.
   
4. `npm run build` will build the project to the `dist` folder.

# License

This SAFE Network library is licensed under the General Public License (GPL), version 3 ([LICENSE](LICENSE) http://www.gnu.org/licenses/gpl-3.0.en.html).

# Contribution

Unless you explicitly state otherwise, any contribution intentionally submitted for inclusion in the
work by you, as defined in the MaidSafe Contributor Agreement, version 1.1 ([CONTRIBUTOR]
(CONTRIBUTOR)), shall be dual licensed as above, and you agree to be bound by the terms of the
MaidSafe Contributor Agreement, version 1.1.