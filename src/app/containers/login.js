import { connect } from 'react-redux';
import Login from '../components/login';
import { login, clearAuthLoader, clearError } from '../actions/auth';

const mapStateToProps = (state) => (
  {
    networkState: state.networkState.state,
    error: state.auth.error,
    loading: state.auth.loading
  }
);

const mapDispatchToProps = (dispatch) => (
  {
    login: (secret, password) => (dispatch(login(secret, password))),
    clearAuthLoader: () => (dispatch(clearAuthLoader())),
    clearError: () => (dispatch(clearError()))
  }
);

export default connect(mapStateToProps, mapDispatchToProps)(Login);
