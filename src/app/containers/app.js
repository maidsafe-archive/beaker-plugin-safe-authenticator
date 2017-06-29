import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import App from '../components/app';
import { logout } from '../actions/auth';
import { setNetworkConnecting } from '../actions/network_state';

const mapStateToProps = (state) => (
  {
    networkState: state.networkState.state,
    isAuthorised: state.auth.isAuthorised,
    loading: state.app.loading
  }
);

const mapDispatchToProps = (dispatch) => (
  bindActionCreators({ logout, setNetworkConnecting }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(App);
