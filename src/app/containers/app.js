import { connect } from 'react-redux';
import App from '../components/app';

const mapStateToProps = state => (
  {
    networkState: state.networkState.state
  }
);
/* eslint-disable no-unused-vars */
const mapDispatchToProps = dispatch => (
  /* eslint-enable no-unused-vars */
  {}
);

export default connect(mapStateToProps, mapDispatchToProps)(App);
