import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
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
  bindActionCreators({ login, clearAuthLoader, clearError }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(Login);
