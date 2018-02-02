# Beaker Plugin SAFE Authenticator Change Log

## [0.4.3] - 2-2-2018
### Changed
- Upgrade system_uri to v0.4.0
- Remove `libwinpthread.dll` as a dependency

### SAFE libraries Dependencies
- safe_authenticator: v0.5.0
- system_uri: v0.4.0

## [0.4.2] - 20-12-2017
### Changed
- Upgrade safe_authenticator to v0.5.0

### SAFE libraries Dependencies
- safe_authenticator: v0.5.0
- system_uri: v0.3.0

## 0.4.1
- updates safe_authenticator lib to `57f3afb`

## 0.4.0
- Upgrade system_uri to v0.3.0
- Automated S3 deployment with Travis
- Adapt to changes in safe_client_libs API
- Support for setting additional config search path

## 0.3.2
- Adapt to the changes in safe_client_libs API post-v0.4.0
- Uses safe_authenticator lib 8aa35d4
- Automate deploy on S3 server upon git tag push

## 0.3.1
- uses safe_authenticator e9080ac

## 0.3.0

- MutableData Authroisation support
- UserMetadata struct updated
- UI/UX improvements
- uses safe_authenticator v0.4.0
- uses system_uri v0.2.0

## 0.1.0-dev.1

- Account info
- Pop up fixes
- Error popup doesn't close by clicking OK.
- Search icon on expanding push the app list down.
- Apps position keep changing on refresh. Sort apps by their names.
- Reduce header size
- The loading component overlay must have rounded edges
- Compatible with safe_authentocator 0.2.1
- Minor UI fixes
