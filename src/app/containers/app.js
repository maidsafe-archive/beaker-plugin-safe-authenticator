import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import App from '../components/app';
import { logout } from '../actions/auth';

const mapStateToProps = (state) => (
  {
    networkState: state.networkState.state,
    isAuthorised: state.auth.isAuthorised
  }
);

const mapDispatchToProps = (dispatch) => (
  bindActionCreators({ logout }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(App);
