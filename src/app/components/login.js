import React, { Component, PropTypes } from 'react';
import { Link } from 'react-router';
import { Translate } from 'react-redux-i18n';
import AuthLoader from './auth_loader';

export default class Login extends Component {
  static propTypes = {
    isAuthorised: PropTypes.bool,
    loading: PropTypes.bool.isRequired,
    error: PropTypes.string,
    login: PropTypes.func,
    clearError: PropTypes.func,
    clearAuthLoader: PropTypes.func
  };

  static contextTypes = {
    router: PropTypes.object.isRequired
  };

  constructor() {
    super();
    this.togglePassword = this.togglePassword.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  componentWillMount() {
    if (this.props.isAuthorised) {
      return this.context.router.push('/');
    }
    this.props.clearError();
  }

  componentDidMount() {
    this.secretEle.focus();
  }

  componentWillUpdate(nextProps) {
    if (nextProps.isAuthorised) {
      return this.context.router.push('/');
    }
  }

  togglePassword(e) {
    let src = null;
    if (e.target.dataset.target === 'secret') {
      src = 'secretEle';
    } else if (e.target.dataset.target === 'password') {
      src = 'passwordEle';
    } else {
      return;
    }
    if (!this[src].value.trim()) {
      return;
    }
    if (this[src].getAttribute('type') === 'password') {
      e.target.classList.add('active');
      return this[src].setAttribute('type', 'text');
    }
    e.target.classList.remove('active');
    return this[src].setAttribute('type', 'password');
  }

  handleSubmit(e) {
    e.preventDefault();

    const { login, clearError } = this.props;

    clearError();

    const secret = this.secretEle.value.trim();
    const password = this.passwordEle.value.trim();

    if (!secret || !password) {
      return;
    }

    login(secret, password);
  }

  render() {
    const { loading, error, clearAuthLoader } = this.props;

    if (loading) {
      return <AuthLoader cancelAuthReq={clearAuthLoader} />;
    }

    return (
      <div className="auth">
        <div className="auth-b">
          <div className="card login">
            <h3 className="heading md">Login</h3>
            <div className="form">
              <form onSubmit={this.handleSubmit}>
                <div className="form-grp">
                  <input
                    type="password"
                    name="secret"
                    required="required"
                    ref={(c) => { this.secretEle = c; }}
                  />
                  <label htmlFor="secret"><Translate value="Account Secret" /></label>
                  <span className="msg error">
                    { error }
                  </span>
                  <button type="button" tabIndex="-1" className="eye-opt" onClick={this.togglePassword} data-target="secret">{' '}</button>
                </div>
                <div className="form-grp">
                  <input
                    type="password"
                    name="password"
                    required="required"
                    ref={(c) => { this.passwordEle = c; }}
                  />
                  <label htmlFor="password"><Translate value="Account Password" /></label>
                  <button type="button" tabIndex="-1" className="eye-opt" onClick={this.togglePassword} data-target="password">{' '}</button>
                </div>
                <div className="form-grp">
                  <button type="submit" className="btn flat primary"><Translate value="Login" /></button>
                </div>
              </form>
            </div>
          </div>
          <div className="auth-foot">
            <Translate value="Don't have a account?" /> <Link to="create-account"><Translate value="Create account" /></Link>
          </div>
        </div>
      </div>
    );
  }
}
