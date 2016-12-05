import { connect } from 'react-redux';
import CreateAccount from '../components/create_account';
import {
  setCreateAccNavPos,
  setSecretStrength,
  setPasswordStrength,
  setError,
  clearError,
  setAccSecret,
  setAccPassword,
  setAuthLoader,
  clearAuthLoader,
  createAccount
} from '../actions/auth';

const mapStateToProps = (state) => (
  {
    isAuthorised: state.auth.isAuthorised,
    networkStatus: state.networkState.state,
    navPos: state.auth.createAccNavPos,
    secretStrength: state.auth.secretStrength,
    passwordStrength: state.auth.passwordStrength,
    error: state.auth.error,
    userSecret: state.auth.userSecret,
    userPassword: state.auth.userPassword,
    loading: state.auth.loading
  }
);
const mapDispatchToProps = (dispatch) => (
  {
    setNavPos: (pos) => (dispatch(setCreateAccNavPos(pos))),
    setSecretStrength: (val) => (dispatch(setSecretStrength(val))),
    setPasswordStrength: (val) => (dispatch(setPasswordStrength(val))),
    setError: (err) => (dispatch(setError(err))),
    clearError: () => (dispatch(clearError())),
    setSecret: (secret) => (dispatch(setAccSecret(secret))),
    setPassword: (password) => (dispatch(setAccPassword(password))),
    setAuthLoader: () => (dispatch(setAuthLoader())),
    clearAuthLoader: () => (dispatch(clearAuthLoader())),
    createAccount: (secret, password) => (dispatch(createAccount(secret, password)))
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(CreateAccount);
