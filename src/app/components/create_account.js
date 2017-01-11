import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { Translate } from 'react-redux-i18n';
import classNames from 'classnames';
import CreateAccountWelcome from './create_account_welcome';
import CreateAccountSecret from './create_account_secret';
import CreateAccountPassword from './create_account_password';
import AuthLoader from './auth_loader';
import CONSTANTS from '../../constants.json';

export default class CreateAccount extends Component {
  static propTypes = {
    isAuthorised: PropTypes.bool,
    navPos: PropTypes.number,
    loading: PropTypes.bool,
    setCreateAccNavPos: PropTypes.func,
    clearAuthLoader: PropTypes.func,
    clearError: PropTypes.func,
    clearAccSecret: PropTypes.func,
    clearAccPassword: PropTypes.func,
    resetCreateAccNavPos: PropTypes.func
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor() {
    super();
    this.getContainer = this.getContainer.bind(this);
    this.reset = this.reset.bind(this);
  }

  componentWillMount() {
    if (this.props.isAuthorised) {
      return this.context.router.push('/');
    }
    this.reset();
  }

  componentWillUpdate(nextProps) {
    if (nextProps.isAuthorised) {
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

  reset() {
    this.props.clearError();
    this.props.clearAccSecret();
    this.props.clearAccPassword();
    this.props.resetCreateAccNavPos();
  }

  render() {
    const { navPos, loading, setCreateAccNavPos, clearAuthLoader } = this.props;
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
              <span className={classNames({ active: navPos === CONSTANTS.CREATE_ACC_NAV.WELCOME })} onClick={() => { setCreateAccNavPos(1); }}>{''}</span>
              <span className={classNames({ active: navPos === CONSTANTS.CREATE_ACC_NAV.SECRET_FORM })} onClick={() => { setCreateAccNavPos(2); }}>{''}</span>
              <span className={classNames({ active: navPos === CONSTANTS.CREATE_ACC_NAV.PASSWORD_FORM })} onClick={() => { setCreateAccNavPos(3); }}>{''}</span>
            </div>
          </div>
          <div className="auth-foot">
            <Translate value="Already have a account?" /> <Link to="/"><Translate value="Login" /></Link>
          </div>
        </div>
      </div>
    );
  }
}
