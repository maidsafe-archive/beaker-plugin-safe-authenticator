import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import classNames from 'classnames';
import CreateAccountWelcome from './create_account_welcome';
import CreateAccountSecret from './create_account_secret';
import CreateAccountPassword from './create_account_password';
import AuthLoader from './auth_loader';
import CONSTANTS from '../constants.json';

export default class CreateAccount extends Component {
  static propTypes = {
    navPos: PropTypes.number,
    isAuthorised: PropTypes.bool,
    loading: PropTypes.bool,
    setNavPos: PropTypes.func,
    clearAuthLoader: PropTypes.func,
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor() {
    super();
    this.getContainer = this.getContainer.bind(this);
  }

  componentWillMount() {
    if (this.props.isAuthorised) {
      return this.context.router.push('/');
    }
  }

  getContainer() {
    switch (this.props.navPos) {
      case CONSTANTS.CREATE_ACC_NAV.WELCOME:
        return <CreateAccountWelcome {...this.props} />;
      case CONSTANTS.CREATE_ACC_NAV.SECRET_FORM:
        return <CreateAccountSecret {...this.props} />;
      case CONSTANTS.CREATE_ACC_NAV.PASSWORD_FORM:
        return <CreateAccountPassword {...this.props} />;
      default:
        return (
          <div>Oops!!</div>
        );
    }
  }

  render() {
    const { navPos, loading, setNavPos, clearAuthLoader } = this.props;
    if (loading) {
      return <AuthLoader cancelAuthReq={clearAuthLoader} />;
    }
    const container = this.getContainer();

    return (
      <div className="auth">
        <div className="auth-b">
          <div className="card create-acc">
            {container}
            <div className="intro-nav">
              <span className={classNames({ active: navPos === CONSTANTS.CREATE_ACC_NAV.WELCOME })} onClick={() => { setNavPos(1); }}>{''}</span>
              <span className={classNames({ active: navPos === CONSTANTS.CREATE_ACC_NAV.SECRET_FORM })} onClick={() => { setNavPos(2); }}>{''}</span>
              <span className={classNames({ active: navPos === CONSTANTS.CREATE_ACC_NAV.PASSWORD_FORM })} onClick={() => { setNavPos(3); }}>{''}</span>
            </div>
          </div>
          <div className="auth-foot">
            Already have a account? <Link to="/">Login</Link>
          </div>
        </div>
      </div>
    );
  }
}
