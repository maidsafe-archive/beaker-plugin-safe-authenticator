import React, { Component, PropTypes } from 'react';
import { Translate } from 'react-redux-i18n';
import introWelcome from '../img/safe-auth-logo.svg';

export default class CreateAccountWelcome extends Component {
  static propTypes = {
    navPos: PropTypes.number,
    setNavPos: PropTypes.func
  };

  render() {
    return (
      <div>
        <h3 className="heading md"><Translate value="AppTitle" /></h3>
        <div className="intro">
          <div className="intro-media">
            <img src={introWelcome} alt="SAFE Authenticator" />
          </div>
          <div className="intro-cnt">
            <Translate value="AuthIntro.desc.welcome" />
          </div>
          <div className="intro-foot">
            <button className="btn intro-foot-rt" onClick={() => {this.props.setNavPos(this.props.navPos + 1)}}>Continue</button>
          </div>
        </div>
      </div>
    );
  }
}
