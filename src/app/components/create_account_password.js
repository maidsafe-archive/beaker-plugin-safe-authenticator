import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { Translate, I18n } from 'react-redux-i18n';
import zxcvbn from 'zxcvbn';
import CONSTANTS from '../constants.json';
import FieldStrength from './field_strength';
import { getStrengthMsg } from '../utils';


export default class CreateAccountPassword extends Component {
  static propTypes = {
    navPos: PropTypes.number,
    error: PropTypes.string,
    networkStatus: PropTypes.number,
    passwordStrength: PropTypes.number,
    userSecret: PropTypes.string,
    userPassword: PropTypes.string,
    setCreateAccNavPos: PropTypes.func,
    clearError: PropTypes.func,
    setAccPassword: PropTypes.func,
    createAccount: PropTypes.func,
    setPasswordStrength: PropTypes.func,
    setError: PropTypes.func,
  };

  constructor() {
    super();
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.togglePassword = this.togglePassword.bind(this);
  }

  componentDidMount() {
    if (this.props.userPassword) {
      this.passwordEle.value = this.props.userPassword;
      this.confirmPasswordEle.value = this.props.userPassword;
    }
    this.passwordEle.focus();
  }

  clearFieldMsg() {
    this.confirmPasswordMsgEle.textContent = '';
    this.props.clearError();
  }

  handleInputChange(e) {
    if (e.keyCode === 13) {
      return;
    }

    this.clearFieldMsg();

    const ele = this.passwordEle;
    const value = ele.value.trim();
    this.props.setPasswordStrength(zxcvbn(value).guesses_log10);
  }

  handleSubmit(e) {
    e.preventDefault();

    this.clearFieldMsg();

    const password = this.passwordEle.value.trim();
    const confirmPassword = this.confirmPasswordEle.value.trim();
    if (!password || !confirmPassword) {
      return;
    }
    if (this.props.passwordStrength < CONSTANTS.PASSPHRASE_STRENGTH.SOMEWHAT_SECURE) {
      this.props.setError(I18n.t('messages.need_to_be_stronger', { name: I18n.t('Account Password') }));
      return;
    }
    if (password !== confirmPassword) {
      this.confirmPasswordMsgEle.textContent = I18n.t('entries_mismatch');
      return;
    }
    this.props.setAccPassword(password);

    if (this.props.networkStatus !== CONSTANTS.NETWORK_STATUS.CONNECTED) {
      // TODO popup network not connected error
      return;
    }

    this.props.createAccount(this.props.userSecret, this.props.userPassword);
  }

  togglePassword(e) {
    let src = null;
    if (e.target.dataset.target === 'password') {
      src = 'passwordEle';
    } else if (e.target.dataset.target === 'confirmPassword') {
      src = 'confirmPasswordEle';
    } else {
      return;
    }
    if (!this[src].value.trim()) {
      return;
    }
    if (this[src].getAttribute('type') === 'password') {
      return this[src].setAttribute('type', 'text');
    }
    return this[src].setAttribute('type', 'password');
  }

  render() {
    const { passwordStrength } = this.props;

    return (
      <div>
        <h3 className="heading md"><Translate value="Account Password" /></h3>
        <div className="intro">
          <div className="intro-cnt">
            <Translate value="AuthIntro.desc.password" />
          </div>
          <div className="intro-cnt">
            <div className="form intro-form">
              <form id="AccPasswordForm" onSubmit={this.handleSubmit}>
                <div className="form-grp">
                  <input
                    type="password"
                    name="password"
                    required="required"
                    ref={(c) => { this.passwordEle = c; }}
                    onKeyUp={this.handleInputChange}
                  />
                  <label htmlFor="password"><Translate value="Account Password" /></label>
                  <span
                    className={classNames(
                      'msg',
                      {
                        error: this.props.error
                      }
                    )
                    }
                  >
                    {this.props.error || getStrengthMsg(passwordStrength)}
                  </span>
                  <FieldStrength strength={passwordStrength} />
                  <button type="button" tabIndex="-1" className="eye-opt" onClick={this.togglePassword} data-target="password">{' '}</button>
                  <span className="min extended">{''}</span>
                </div>
                <div className="form-grp">
                  <input
                    type="password"
                    name="cPassword"
                    required="required"
                    ref={(c) => { this.confirmPasswordEle = c; }}
                  />
                  <label htmlFor="cPassword"><Translate value="Confirm Account Password" /></label>
                  <span
                    className="msg error"
                    ref={(c) => {
                      this.confirmPasswordMsgEle = c;
                    }}
                  >{''}</span>
                  <button type="button" tabIndex="-1" className="eye-opt" onClick={this.togglePassword} data-target="confirmPassword">{' '}</button>
                </div>
              </form>
            </div>
          </div>
          <div className="intro-foot">
            <button className="btn intro-foot-lt" onClick={() => { this.props.setCreateAccNavPos(this.props.navPos - 1); }}>Back</button>
            <button type="submit" form="AccPasswordForm" className="btn intro-foot-rt">Create Account</button>
          </div>
        </div>
      </div>
    );
  }
}
