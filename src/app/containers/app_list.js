import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import AppList from '../components/app_list';
import { getAuthorisedApps, revokeApp } from '../actions/app';

const mapStateToProps = (state) => (
  {
    isAuthorised: state.auth.isAuthorised,
    fetchingApps: state.app.fetchingApps,
    authorisedApps: state.app.authorisedApps
  }
);

const mapDispatchToProps = (dispatch) => (
  bindActionCreators({ getAuthorisedApps, revokeApp }, dispatch)
);

export default connect(mapStateToProps, mapDispatchToProps)(AppList);
