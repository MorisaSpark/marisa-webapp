// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import * as Utils from 'utils/utils.jsx';

import {isEmail} from 'panguaxe-redux/utils/helpers';

import BackButton from 'components/common/back_button';
import LocalizedInput from 'components/localized_input/localized_input';

import {t} from 'utils/i18n.jsx';
import Constants from "../../utils/constants";

import './password_reset_send_link.scss'
import workThing from 'images/ithpower/login/work_is_thing.png'
import eye from 'images/ithpower/login/eye.png';
import eyeOpen from 'images/ithpower/login/eye_open.png';
import logoWords from 'images/ithpower/login/logo_words.png';
import phoneLogoWords from 'images/ithpower/login/phone_logo_words.png';
import {Alert} from 'antd'
import {browserHistory} from "../../utils/browser_history";
import * as GlobalActions from "../../actions/global_actions";
import LocalStorageStore from "../../stores/local_storage_store";
import {Statistic} from 'antd';

const {Countdown} = Statistic;
export default class PasswordResetSendLink extends React.PureComponent {
    static propTypes = {
        experimentalPrimaryTeam: PropTypes.string,

        actions: PropTypes.shape({
            login: PropTypes.func.isRequired,
            sendPasswordResetEmail: PropTypes.func.isRequired,
            sendSMS: PropTypes.func.isRequired,
            createUser: PropTypes.func.isRequired,
            checkPhoneIsSignUp: PropTypes.func.isRequired,
        }).isRequired,
    };

    state = {
        error: null,
        updateText: null,
        isSignUpPage: (window.location.href.split("/")[window.location.href.split("/").length - 1] === "sign_up"),
        isShowMessage: false,
        isClickOK: false,
        isEyeOpen: false,
        serverError: '無',

        isCountDown: false,
        deadTime: 10,
        internal: 10,

    };
    resetForm = React.createRef();
    emailInput = React.createRef();
    verificationCode = React.createRef();
    newPasswordInput = React.createRef();

    handlePasswordChange = (e) => {
        this.setState({
            isClickOK: (e.target.value !== "" && this.emailInput.current.value.trim() !== "" && this.verificationCode.current.value.trim() !== "")
        });
    };
    handleVerifyCodeChange = (e) => {
        this.setState({
            isClickOK: (e.target.value !== "" && this.emailInput.current.value.trim() !== "" && this.newPasswordInput.current.value.trim() !== "")
        });
    };
    handlePhoneChange = (e) => {
        this.setState({
            isClickOK: (e.target.value !== "" && this.newPasswordInput.current.value.trim() !== "" && this.verificationCode.current.value.trim() !== "")
        });
    };

    toggleEyeURL = (e) => {
        this.setState({
            isEyeOpen: !this.state.isEyeOpen,
        })
    };

    handleSendLink = async (e) => {
        e.preventDefault();
        const email = this.emailInput.current.value.trim().toLowerCase();
        if (!email || !Utils.isPhone(email)) {
            this.setState({
                isShowMessage: true,
                serverError: '请输入有效的手机号',
            });
            return;
        }
        const verificationCode = this.verificationCode.current.value.trim();
        if (!verificationCode || !Utils.isVerificationCode(verificationCode)) {
            this.setState({
                isShowMessage: true,
                serverError: '请输入有效的验证码',
            });
            return;
        }
        const newPassword = this.newPasswordInput.current.value.trim();
        // const retypePassword = this.retypePasswordInput.current.value.trim();
        if (!newPassword /*|| !retypePassword*/) {
            this.setState({
                isShowMessage: true,
                serverError: '请输入有效的密码',
            });
            return;
        }
        // End of error checking clear error
        this.setState({error: null});
        if (!this.state.isSignUpPage) {
            const {data, error} = await this.props.actions.sendPasswordResetEmail(email, newPassword, verificationCode);
            this.thenDo(data, email, newPassword, error);
        } else {
            const user = {
                email: email,
                password: newPassword,
                verificationCode: verificationCode
            };

            await this.props.actions.createUser(user, this.state.token, this.state.inviteId)
                .then((result) => {
                    console.log(result);
                    if (result.error === undefined) {
                        this.thenDo("", email, newPassword, "");
                    } else {
                        this.setState({
                            serverError: result.error.message,
                            isShowMessage: true,
                            isSubmitting: false,
                        });
                    }
                });
        }
    }

    thenDo(data, email, newPassword, error) {
        if (data || data === "") {
            this.setState({
                error: null,
                isShowMessage: true,
                serverError: '请尝试再次登录',
                updateText: (
                    <div
                        id='passwordResetEmailSent'
                        className='reset-form alert alert-success'
                    >
                        <FormattedMessage
                            id='password_send.resetSuccess'
                            defaultMessage='The following password of phone has been changed successfully: '
                        />
                        <div>
                            <b>{email}</b>
                        </div>
                        <br/>
                        <FormattedMessage
                            id='password_send.loginAgain'
                            defaultMessage='Please try to login again. '
                        />
                    </div>
                ),
            });
            this.doSignIn(email, newPassword)
        } else if (error) {
            this.setState({
                isShowMessage: true,
                error: error.message,
                serverError: error.message,
                update_text: null,
            });
        }
    }

    doSignIn(email, newPassword) {
        this.props.actions.login(email, newPassword, "", "").then(async ({error}) => {
            if (error) {
                if (error.server_error_id === 'api.user.login.not_verified.app_error') {
                    browserHistory.push('/should_verify_email?&email=' + encodeURIComponent(email));
                } else if (error.server_error_id === 'store.sql_user.get_for_login.app_error' ||
                    error.server_error_id === 'ent.ldap.do_login.user_not_registered.app_error') {
                    this.setState({
                        showMfa: false,
                        loading: false,
                        isShowMessage: true,
                        serverError: (
                            <FormattedMessage
                                id='login.userNotFound'
                                defaultMessage="We couldn't find an account matching your login credentials."
                            />
                        ),
                    });
                } else if (error.server_error_id === 'api.user.check_user_password.invalid.app_error' || error.server_error_id === 'ent.ldap.do_login.invalid_password.app_error') {
                    this.setState({
                        showMfa: false,
                        loading: false,
                        isShowMessage: true,
                        serverError: (
                            <FormattedMessage
                                id='login.invalidPassword'
                                defaultMessage='Your password is incorrect.'
                            />
                        ),
                    });
                } else if (!this.state.showMfa && error.server_error_id === 'mfa.validate_token.authenticate.app_error') {
                    this.setState({showMfa: true});
                } else if (!this.state.showMfa && error.server_error_id === 'api.user.login.guest_accounts.disabled.error') {
                    this.setState({
                        showMfa: false,
                        loading: false,
                        signExceptionFlag: true,
                        isShowMessage: true,
                        serverError: (
                            <FormattedMessage
                                id='login.signExceptionForCode'
                                defaultMessage="Remote login needs to check the phone with message. "
                            />
                        ),
                    });
                } else {
                    this.setState({showMfa: false, isShowMessage: true, serverError: error.message, loading: false});
                }

                return;
            }

            // check for query params brought over from signup_user_complete
            const params = new URLSearchParams(this.props.location.search);
            const inviteToken = params.get('t') || '';
            const inviteId = params.get('id') || '';

            if (inviteId || inviteToken) {
                const {data: team} = await this.props.actions.addUserToTeamFromInvite(inviteToken, inviteId);
                if (team) {
                    this.finishSignin(team);
                } else {
                    // there's not really a good way to deal with this, so just let the user log in like normal
                    this.finishSignin();
                }
            } else {
                this.finishSignin();
            }
        });
    }

    finishSignin = (team) => {
        const experimentalPrimaryTeam = this.props.experimentalPrimaryTeam;
        const query = new URLSearchParams(this.props.location.search);
        const redirectTo = query.get('redirect_to');

        Utils.setCSRFFromCookie();

        // Record a successful login to local storage. If an unintentional logout occurs, e.g.
        // via session expiration, this bit won't get reset and we can notify the user as such.
        LocalStorageStore.setWasLoggedIn(true);
        if (redirectTo && redirectTo.match(/^\/([^/]|$)/)) {
            browserHistory.push(redirectTo);
        } else if (team) {
            browserHistory.push(`/${team.name}`);
        } else if (experimentalPrimaryTeam) {
            browserHistory.push(`/${experimentalPrimaryTeam}`);
        } else {
            GlobalActions.redirectUserToDefaultTeam();
        }
    }
    //倒计60s
    count = () => {
        let deadTime = this.state.internal;
        let isCountDown = true;
        let timer1 =  setInterval(() => {
            console.log(deadTime);
            console.log(isCountDown);
            deadTime--;
            if (deadTime <= 0) {
                isCountDown = false;
                window.clearInterval(timer1)
            }
            this.setState({deadTime: deadTime, isCountDown: isCountDown})
        }, 1000);
    };

    submitSendSMS = () => {
        if (this.state.isCountDown) {
            return;
        }
        const phone = this.emailInput.current.value.trim();
        const typeM = (this.state.isSignUpPage ? Constants.VERIFICATION_CODE_TYPE.SIGN_UP : Constants.VERIFICATION_CODE_TYPE.PASSWORD_CHANGE);
        if (!Utils.isPhone(phone)) {
            this.setState({
                isShowMessage: true,
                serverError: '请输入有效的手机号',
                error: (
                    <FormattedMessage
                        id={'password_send.error'}
                        defaultMessage={'Please enter a valid phone number.'}
                    />
                ),
            });
            return;
        } else {
            this.setState({
                isShowMessage: false,
            })
        }
        console.log("kaman rider");
        this.props.actions.sendSMS(phone, typeM)
            .then((data) => {
                if (data["data"] === true) {
                    console.log(data);
                    let deadTime = this.state.internal;
                    this.count();
                    this.setState({
                        deadTime: deadTime,
                        isCountDown: true
                    })
                } else {

                }
            });
    }

    handleOnBlur = () => {
        if (this.state.isSignUpPage) {
            let phone = this.emailInput.current.value.trim();
            this.props.actions.checkPhoneIsSignUp(phone)
                .then((res) => {
                    console.log(res);
                    if (res.data.Flag) {
                        this.setState({
                            isShowMessage: true,
                            serverError: '该手机号已被注册',
                            error: (
                                <FormattedMessage
                                    id={'password_send.error'}
                                    defaultMessage={'Please enter a valid phone number.'}
                                />
                            ),
                        });

                    }
                })
        }
    };

    render() {
        let error = null;
        let error1 = null;
        let error2 = null;
        if (this.state.error) {
            error = (
                <div className='form-group has-error'>
                    <label className='control-label'>{this.state.error}</label>
                </div>
            );
        }

        let formClass = 'form-group';
        if (error) {
            formClass += ' has-error';
        }
        let formClass1 = 'form-group';
        if (error1) {
            formClass1 += ' has-error';
        }
        let formClass2 = 'form-group';
        if (error2) {
            formClass2 += ' has-error';
        }

        return (
            <div>
                <div className='col-sm-12'>
                    <div className='middle_part_reset signup-team__container'>
                        <div className='work_thing_password'><img src={workThing} alt="group picture"/></div>
                        <div className='password_find_form'>
                            <React.Fragment>
                                <img className='phoneLogoWords' src={phoneLogoWords} alt="tu"/>
                            </React.Fragment>

                            {this.state.updateText}
                            <form
                                onSubmit={this.handleSendLink}
                                ref={this.resetForm}
                                className='login_box'
                            >
                                <div className={this.state.isShowMessage ? "show-message-is" : "show-message-not"}>
                                    <Alert message={this.state.serverError} type="error" showIcon/>
                                </div>
                                <div className={formClass}>
                                    <input
                                        id='passwordResetEmailInput'
                                        type='tel'
                                        className='form-control input-username'
                                        name='email'
                                        placeholder={"请输入手机号码"}
                                        ref={this.emailInput}
                                        spellCheck='false'
                                        autoFocus={true}
                                        onChange={this.handlePhoneChange}
                                        onBlur={this.handleOnBlur}
                                    />
                                    <hr/>
                                </div>
                                <div className={formClass1}>
                                    <div className='input-verify-code'>
                                        <input
                                            id='verificationCodeInput'
                                            type='text'
                                            className='form-control'
                                            name='verificationCode'
                                            placeholder={"请输入验证码"}
                                            ref={this.verificationCode}
                                            spellCheck='false'
                                            onChange={this.handleVerifyCodeChange}
                                        />
                                        <button
                                            id='verificationCodeButton'
                                            type='button'
                                            className={'btn btn-primary btn-send-sms '+ (this.state.isCountDown?"css-ban-click":"")}
                                            onClick={this.submitSendSMS}
                                        >
                                            {this.state.isCountDown?(this.state.deadTime + " 秒"):("获取验证码")}
                                        </button>
                                    </div>
                                    <hr/>
                                </div>
                                <div className={formClass2}>
                                    <input
                                        id='newPassword'
                                        type={this.state.isEyeOpen ? "text" : "password"}
                                        className="input-password"
                                        name='newPassword'
                                        placeholder={this.state.isSignUpPage ? "请输入密码" : "请输入新密码"}
                                        ref={this.newPasswordInput}
                                        onChange={this.handlePasswordChange}
                                        spellCheck='false'
                                    />
                                    <div className="heaven-eye" onClick={this.toggleEyeURL}>
                                        <img src={this.state.isEyeOpen ? eyeOpen : eye} alt=""/>
                                    </div>
                                    <hr/>
                                </div>
                                <div className="tips-mes">
                                    <div>*</div>
                                    <div>密码必须至少8个字符，而且同时包含字母和数字。</div>
                                </div>

                                <button
                                    id='passwordResetButton'
                                    type='submit'
                                    className={'btn btn-primary btn-submit' + (this.state.isClickOK ? '-ok' : '')}
                                >
                                    {this.state.isSignUpPage ? "立即注册" : '立即登录'}
                                </button>
                                <BackButton/>
                            </form>
                            <div
                                id='login_forgot'
                                key='forgotPassword'
                                className='login_forgot form-group'
                            >
                                <img src={logoWords} alt=""/>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
