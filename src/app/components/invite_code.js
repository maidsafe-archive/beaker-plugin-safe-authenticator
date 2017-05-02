import React, { Component, PropTypes } from 'react';
import classNames from 'classnames';
import { Translate } from 'react-redux-i18n';

export default class InviteCode extends Component {
  static propTypes = {
    navPos: PropTypes.number,
    inviteCode: PropTypes.string,
    error: PropTypes.string,
    setInviteCode: PropTypes.func,
    toggleInvitePopup: PropTypes.func,
    showPopupWindow: PropTypes.func,
    setCreateAccNavPos: PropTypes.func,
    clearError: PropTypes.func
  };

  constructor() {
    super();
    this.handleSubmit = this.handleSubmit.bind(this);
    this.setInviteCode = this.setInviteCode.bind(this);
  }

  componentDidMount() {
    this.setInviteCode();
    this.inviteCode.focus();
  }

  componentDidUpdate() {
    this.setInviteCode();
  }

  setInviteCode() {
    if (this.props.inviteCode) {
      this.inviteCode.value = this.props.inviteCode;
    }
  }

  handleSubmit(e) {
    e.preventDefault();
    this.props.clearError();

    const inviteCode = this.inviteCode.value.trim();
    if (!inviteCode) {
      return;
    }
    this.props.setInviteCode(inviteCode);
    this.props.setCreateAccNavPos(this.props.navPos + 1);
  }

  render() {
    return (
      <div className="iframe-cnt">
        <h3 className="heading md"><Translate value="Invite Code" /></h3>
        <div className="intro">
          <div className="intro-cnt">
            <Translate value="AuthIntro.desc.inviteCode" />
          </div>
          <div className="intro-cnt invite-cnt">
            <div className="form intro-form">
              <form id="InviteCodeForm" onSubmit={this.handleSubmit}>
                <div className="form-grp">
                  <input
                    type="text"
                    name="inviteCode"
                    required="required"
                    ref={(c) => {
                      this.inviteCode = c;
                    }}
                  />
                  <label htmlFor="secret"><Translate value="Invite Code" /></label>
                  <span
                    className={classNames(
                      'msg',
                      {
                        error: this.props.error
                      }
                    )
                    }
                  >
                    {this.props.error}
                  </span>
                </div>
              </form>
            </div>
            <div className="inviteClaimBtn">
              <div className="separator">Or</div>
              <button
                type="button"
                className="btn flat primary"
                disabled="disabled"
                onClick={(e) => {
                  e.preventDefault();
                  this.props.toggleInvitePopup();
                }}
              >Claim an invitation</button>
            </div>
          </div>
          <div className="intro-foot">
            <button
              className="btn intro-foot-lt"
              onClick={() => {
                this.props.setCreateAccNavPos(this.props.navPos - 1);
              }}
            ><Translate value="Back" />
            </button>
            <button type="submit" form="InviteCodeForm" className="btn intro-foot-rt"><Translate value="Continue" /></button>
          </div>
        </div>
        <div
          className={classNames(
            'iframe-b',
            { show: this.props.showPopupWindow }
          )}
        >
          <iframe src="#" frameBorder="0">{''}</iframe>
          <button
            type="button"
            className="frame-close"
            onClick={(e) => {
              e.preventDefault();
              this.props.toggleInvitePopup();
            }}
          >Close</button>
        </div>
      </div>
    );
  }
}
