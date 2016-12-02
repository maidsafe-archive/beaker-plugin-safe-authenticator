import React, { Component } from 'react';
import { Translate } from 'react-redux-i18n';

export default class CreateAccountSecret extends Component {
  static propTypes = {
  };

  render() {
    return (
      <div>
        <h3 className="heading md"><Translate value="Account Secret" /></h3>
        <div className="intro">
          <div className="intro-cnt">
            <Translate value="AuthIntro.desc.secret" />
          </div>
          <div className="intro-cnt">
            <div className="form intro-form">
              <form>
                <div className="form-grp">
                  <input type="password" name="secret" required="required" />
                  <label htmlFor="secret"><Translate value="Account Secret" /></label>
                  <span className="msg">test message</span>
                  <span className="eye-opt">{' '}</span>
                </div>
                <div className="form-grp">
                  <input type="password" name="cSecret" required="required" />
                  <label htmlFor="cSecret"><Translate value="Confirm Account Secret" /></label>
                  <span className="eye-opt">{' '}</span>
                </div>
              </form>
            </div>
          </div>
          <div className="intro-foot">
            <button className="btn intro-foot-lt">Back</button>
            <button className="btn intro-foot-rt">Continue</button>
          </div>
        </div>
      </div>
    );
  }
}
