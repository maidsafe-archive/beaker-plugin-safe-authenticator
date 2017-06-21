import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import AppList from '../components/app_list';
import { getAuthorisedApps, revokeApp, clearAppError } from '../actions/app';

const mapStateToProps = (state) => (
  {
    isAuthorised: state.auth.isAuthorised,
    fetchingApps: state.app.fetchingApps,
    authorisedApps: state.app.authorisedApps,
    loading: state.app.loading,
    error: state.app.error
  }
);

const mapDispatchToProps = (dispatch) => (
  bindActionCreators({ getAuthorisedApps, revokeApp, clearAppError }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(AppList);
