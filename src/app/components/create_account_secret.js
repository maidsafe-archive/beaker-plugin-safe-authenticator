import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { Translate, I18n } from 'react-redux-i18n';
import zxcvbn from 'zxcvbn';
import CONSTANTS from '../constants.json';
import FieldStrength from './field_strength';
import { getStrengthMsg } from '../utils';

export default class CreateAccountSecret extends Component {
  static propTypes = {
    navPos: PropTypes.number,
    setNavPos: PropTypes.func
  };

  constructor() {
    super();
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.togglePassword = this.togglePassword.bind(this);
  }

  componentDidMount() {
    if (this.props.userSecret) {
      this.secretEle.value = this.props.userSecret;
      this.confirmSecretEle.value = this.props.userSecret;
    }
    this.secretEle.focus();
  }

  clearFieldMsg() {
    this.confirmSecretMsgEle.textContent = "";
    this.props.clearError();
  }

  togglePassword(e) {
    let src = null;
    if (e.target.dataset.target === 'secret') {
      src = 'secretEle';
    } else if (e.target.dataset.target === 'confirmSecret') {
      src = 'confirmSecretEle';
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

  handleSubmit(e) {
    e.preventDefault();

    this.clearFieldMsg();

    const secret = this.secretEle.value.trim();
    const confirmSecret = this.confirmSecretEle.value.trim();
    if (!secret || !confirmSecret) {
      return;
    }
    if (this.props.secretStrength < CONSTANTS.PASSPHRASE_STRENGTH.WEAK) {
      this.props.setError(I18n.t('messages.need_to_be_stronger', { name: I18n.t('Account Secret') }));
      return;
    }
    if (secret !== confirmSecret) {
      this.confirmSecretMsgEle.textContent = I18n.t('entries_mismatch');
      return;
    }
    this.props.setSecret(secret);
    this.props.setNavPos(this.props.navPos + 1);
  }

  handleInputChange(e) {
    if (e.keyCode === 13) {
      return;
    }

    this.clearFieldMsg();

    const ele = this.secretEle;
    const value = ele.value.trim();
    this.props.setSecretStrength(zxcvbn(value).guesses_log10);
  }

  render() {
    const { secretStrength } = this.props;
    return (
      <div>
        <h3 className="heading md"><Translate value="Account Secret"/></h3>
        <div className="intro">
          <div className="intro-cnt">
            <Translate value="AuthIntro.desc.secret"/>
          </div>
          <div className="intro-cnt">
            <div className="form intro-form">
              <form id="AccSecretForm" onSubmit={this.handleSubmit}>
                <div className="form-grp">
                  <input
                    type="password"
                    name="secret"
                    required="required"
                    ref={(c) => {
                      this.secretEle = c;
                    }}
                    onKeyUp={this.handleInputChange}
                  />
                  <label htmlFor="secret"><Translate value="Account Secret" /></label>
                  <span
                    className={classNames(
                      'msg',
                      {
                        error: this.props.error
                      }
                      )
                    }
                  >
                    {this.props.error || getStrengthMsg(secretStrength)}
                  </span>
                  <FieldStrength strength={secretStrength} />
                  <button type="button" tabIndex="-1" className="eye-opt" onClick={this.togglePassword} data-target="secret">{' '}</button>
                  <span className="min">{''}</span>
                </div>
                <div className="form-grp">
                  <input
                    type="password"
                    name="cSecret"
                    required="required"
                    ref={(c) => {this.confirmSecretEle = c;}}
                  />
                  <label htmlFor="cSecret"><Translate value="Confirm Account Secret"/></label>
                  <span
                    className="msg error"
                    ref={(c) => {
                      this.confirmSecretMsgEle = c;
                    }}
                  >{''}</span>
                  <button type="button" tabIndex="-1" className="eye-opt" onClick={this.togglePassword} data-target="confirmSecret">{' '}</button>
                </div>
              </form>
            </div>
          </div>
          <div className="intro-foot">
            <button className="btn intro-foot-lt" onClick={() => {
              this.props.setNavPos(this.props.navPos - 1)
            }}>Back
            </button>
            <button type="submit" form="AccSecretForm" className="btn intro-foot-rt">Continue</button>
          </div>
        </div>
      </div>
    );
  }
}
