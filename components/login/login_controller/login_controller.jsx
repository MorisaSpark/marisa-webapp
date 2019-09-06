// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';
import {Link} from 'react-router-dom';

import {Client4} from 'panguaxe-redux/client';

import * as GlobalActions from 'actions/global_actions.jsx';
import LocalStorageStore from 'stores/local_storage_store';

import {browserHistory} from 'utils/browser_history';
import Constants from 'utils/constants.jsx';
import messageHtmlToComponent from 'utils/message_html_to_component';
import * as TextFormatting from 'utils/text_formatting.jsx';
import * as Utils from 'utils/utils.jsx';
import {showNotification} from 'utils/notifications.jsx';
import {t} from 'utils/i18n.jsx';

import logoImage from 'images/logo.png';

import SiteNameAndDescription from 'components/common/site_name_and_description';
import AnnouncementBar from 'components/announcement_bar';
import FormError from 'components/form_error.jsx';
import FormattedMarkdownMessage from 'components/formatted_markdown_message.jsx';
import BackButton from 'components/common/back_button.jsx';
import LoadingScreen from 'components/loading_screen.jsx';
import LoadingWrapper from 'components/widgets/loading/loading_wrapper.jsx';
import SuccessIcon from 'components/icon/success_icon';
import WarningIcon from 'components/icon/warning_icon';
import LocalizedInput from 'components/localized_input/localized_input';

import LoginMfa from '../login_mfa.jsx';

import './login_controller.scss';
import workThing from 'images/ithpower/login/work_is_thing.png';
import logoWords from 'images/ithpower/login/logo_words.png';
import eye from 'images/ithpower/login/eye.png';
import eyeOpen from 'images/ithpower/login/eye_open.png';
import {Checkbox, Alert} from 'element-react';

import 'element-theme-default';

class LoginController extends React.Component {
    static propTypes = {
        intl: intlShape.isRequired,

        location: PropTypes.object.isRequired,
        isLicensed: PropTypes.bool.isRequired,
        currentUser: PropTypes.object,
        customBrandText: PropTypes.string,
        customDescriptionText: PropTypes.string,
        enableCustomBrand: PropTypes.bool.isRequired,
        enableLdap: PropTypes.bool.isRequired,
        enableOpenServer: PropTypes.bool.isRequired,
        enableSaml: PropTypes.bool.isRequired,
        enableSignInWithEmail: PropTypes.bool.isRequired,
        enableSignInWithUsername: PropTypes.bool.isRequired,
        enableSignUpWithEmail: PropTypes.bool.isRequired,
        enableSignUpWithGitLab: PropTypes.bool.isRequired,
        enableSignUpWithGoogle: PropTypes.bool.isRequired,
        enableSignUpWithOffice365: PropTypes.bool.isRequired,
        experimentalPrimaryTeam: PropTypes.string,
        ldapLoginFieldName: PropTypes.string,
        samlLoginButtonText: PropTypes.string,
        siteName: PropTypes.string,
        initializing: PropTypes.bool,
        actions: PropTypes.shape({
            login: PropTypes.func.isRequired,
            addUserToTeamFromInvite: PropTypes.func.isRequired,
            sendSMS: PropTypes.func.isRequired,
        }).isRequired,
    }

    constructor(props) {
        super(props);

        let loginId = '';
        if ((new URLSearchParams(this.props.location.search)).get('extra') === Constants.SIGNIN_VERIFIED && (new URLSearchParams(this.props.location.search)).get('email')) {
            loginId = (new URLSearchParams(this.props.location.search)).get('email');
        }

        this.state = {
            ldapEnabled: this.props.isLicensed && this.props.enableLdap,
            usernameSigninEnabled: this.props.enableSignInWithUsername,
            emailSigninEnabled: this.props.enableSignInWithEmail,
            samlEnabled: this.props.isLicensed && this.props.enableSaml,
            loginId,
            password: '',
            signException: '',
            signExceptionFlag: false,
            signExceptionLoading: false,
            showMfa: false,
            loading: false,
            sessionExpired: false,
            brandImageError: false,
            isEyeOpen: false,
            isLoginOK: false,
            isShowMessage: false,
            rememberMe: true,
        };
    }

    componentDidMount() {
        this.configureTitle();

        if (this.props.currentUser) {
            GlobalActions.redirectUserToDefaultTeam();
            return;
        }

        const search = new URLSearchParams(this.props.location.search);
        const extra = search.get('extra');
        const email = search.get('email');

        if (extra === Constants.SIGNIN_VERIFIED && email) {
            this.refs.password.focus();
        }

        // Determine if the user was unexpectedly logged out.
        if (LocalStorageStore.getWasLoggedIn()) {
            if (extra === Constants.SIGNIN_CHANGE) {
                // Assume that if the user triggered a sign in change, it was intended to logout.
                // We can't preflight this, since in some flows it's the server that invalidates
                // our session after we use it to complete the sign in change.
                LocalStorageStore.setWasLoggedIn(false);
            } else {
                // Although the authority remains the local sessionExpired bit on the state, set this
                // extra field in the querystring to signal the desktop app. And although eslint
                // complains about this, it is allowed: https://reactjs.org/docs/react-component.html#componentdidmount.
                // eslint-disable-next-line react/no-did-mount-set-state
                this.setState({sessionExpired: true});
                search.set('extra', Constants.SESSION_EXPIRED);
                browserHistory.replace(`${this.props.location.pathname}?${search}`);
            }
        }

        this.showSessionExpiredNotificationIfNeeded();
    }

    componentDidUpdate() {
        this.configureTitle();
        this.showSessionExpiredNotificationIfNeeded();
    }

    componentWillUnmount() {
        if (this.closeSessionExpiredNotification) {
            this.closeSessionExpiredNotification();
            this.closeSessionExpiredNotification = null;
        }
    }

    configureTitle = () => {
        if (this.state.sessionExpired) {
            document.title = this.props.intl.formatMessage({
                id: 'login.session_expired.title',
                defaultMessage: '* {siteName} - Session Expired',
            }, {
                siteName: this.props.siteName,
            });
        } else {
            document.title = this.props.siteName;
        }
    }

    toggleEyeURL = (e) =>{
        this.setState({
            isEyeOpen: !this.state.isEyeOpen,
        })
    };

    showSessionExpiredNotificationIfNeeded = () => {
        if (this.state.sessionExpired && !this.closeSessionExpiredNotification) {
            showNotification({
                title: this.props.siteName,
                body: Utils.localizeMessage(
                    'login.session_expired.notification',
                    'Session Expired: Please sign in to continue receiving notifications.'
                ),
                requireInteraction: true,
                silent: false,
                onClick: () => {
                    window.focus();
                    if (this.closeSessionExpiredNotification()) {
                        this.closeSessionExpiredNotification();
                        this.closeSessionExpiredNotification = null;
                    }
                },
            }).then((closeNotification) => {
                this.closeSessionExpiredNotification = closeNotification;
            }).catch(() => {
                // Ignore the failure to display the notification.
            });
        } else if (!this.state.sessionExpired && this.closeSessionExpiredNotification) {
            this.closeSessionExpiredNotification();
            this.closeSessionExpiredNotification = null;
        }
    }

    preSubmit = (e) => {
        e.preventDefault();

        // Discard any session expiry notice once the user interacts with the login page.
        this.onDismissSessionExpired();

        const {location} = this.props;
        const newQuery = location.search.replace(/(extra=password_change)&?/i, '');
        if (newQuery !== location.search) {
            browserHistory.replace(`${location.pathname}${newQuery}${location.hash}`);
        }

        // password managers don't always call onInput handlers for form fields so it's possible
        // for the state to get out of sync with what the user sees in the browser
        let loginId = this.state.loginId;
        if (this.refs.loginId) {
            loginId = this.refs.loginId.value;
            if (loginId !== this.state.loginId) {
                this.setState({loginId});
            }
        }

        let password = this.state.password;
        if (this.refs.password) {
            password = this.refs.password.value;
            if (password !== this.state.password) {
                this.setState({password});
            }
        }

        // don't trim the password since we support spaces in passwords
        loginId = loginId.trim().toLowerCase();

        if (!loginId) {
            t('login.noPhone');
            t('login.noPhoneLdapUsername');
            t('login.noPhoneUsername');
            t('login.noPhoneUsernameLdapUsername');
            t('login.noLdapUsername');
            t('login.noUsername');
            t('login.noUsernameLdapUsername');

            // it's slightly weird to be constructing the message ID, but it's a bit nicer than triply nested if statements
            let msgId = 'login.no';
            if (this.state.emailSigninEnabled) {
                msgId += 'Email';
            }
            if (this.state.usernameSigninEnabled) {
                msgId += 'Username';
            }
            if (this.state.ldapEnabled) {
                msgId += 'LdapUsername';
            }

            this.setState({
                isShowMessage:true,
                serverError: (
                    <FormattedMessage
                        id={msgId}
                        values={{
                            ldapUsername: this.props.ldapLoginFieldName || Utils.localizeMessage('login.ldapUsernameLower', 'AD/LDAP username'),
                        }}
                    />
                ),
            });
            return;
        }

        if (!password) {
            this.setState({
                isShowMessage:true,
                serverError: (
                    <FormattedMessage
                        id='login.noPassword'
                        defaultMessage='Please enter your password'
                    />
                ),
            });
            return;
        }

        let verificationCode = this.state.signException;
        if (!verificationCode && this.state.signExceptionFlag === true) {
            this.setState({
                isShowMessage:true,
                serverError: (
                    <FormattedMessage
                        id='login.verificationCodeError'
                        defaultMessage='Wrong verification code input. '
                    />
                ),
            });
        }

        this.submit(loginId, password, '', verificationCode);
    }

    submit = (loginId, password, token, verificationCode) => {
        this.setState({serverError: null, loading: true});

        this.props.actions.login(loginId, password, token, verificationCode).then(async ({error}) => {
            if (error) {
                if (error.server_error_id === 'api.user.login.not_verified.app_error') {
                    browserHistory.push('/should_verify_email?&email=' + encodeURIComponent(loginId));
                } else if (error.server_error_id === 'store.sql_user.get_for_login.app_error' ||
                    error.server_error_id === 'ent.ldap.do_login.user_not_registered.app_error') {
                    this.setState({
                        showMfa: false,
                        loading: false,
                        isShowMessage:true,
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
                        isShowMessage:true,
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
                        isShowMessage:true,
                        serverError: (
                            <FormattedMessage
                                id='login.signExceptionForCode'
                                defaultMessage="Remote login needs to check the phone with message. "
                            />
                        ),
                    });
                } else {
                    this.setState({showMfa: false, isShowMessage:true, serverError: error.message, loading: false});
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
        LocalStorageStore.setWasLoggedIn(this.state.rememberMe);
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

    handleLoginIdChange = (e) => {
        this.setState({
            loginId: e.target.value,
            isLoginOK: (e.target.value!==""&&this.state.password!==""), // 信息都填入时按钮变蓝
        });
    }

    handlePasswordChange = (e) => {
        this.setState({
            password: e.target.value,
            isLoginOK: (e.target.value!==""&&this.state.loginId!==""),
        });
    }

    handleSignExceptionChange = (e) => {
        this.setState({
            signException: e.target.value,
        });
    }

    handleBrandImageError = () => {
        this.setState({brandImageError: true});
    }

    createCustomLogin = () => {
        if (this.props.enableCustomBrand) {
            const text = this.props.customBrandText || '';
            const formattedText = TextFormatting.formatText(text);
            const brandImageUrl = Client4.getBrandImageUrl(0);
            const brandImageStyle = this.state.brandImageError ? {display: 'none'} : {};

            return (
                <div>
                    <img
                        alt={'brand image'}
                        src={brandImageUrl}
                        onError={this.handleBrandImageError}
                        style={brandImageStyle}
                    />
                    <div>
                        {messageHtmlToComponent(formattedText, false, {mentions: false, imagesMetadata: null})}
                    </div>
                </div>
            );
        }

        return null;
    }

    createLoginPlaceholder = () => {
        const ldapEnabled = this.state.ldapEnabled;
        const usernameSigninEnabled = this.state.usernameSigninEnabled;
        const emailSigninEnabled = this.state.emailSigninEnabled;

        const loginPlaceholders = [];
        if (emailSigninEnabled) {
            loginPlaceholders.push(Utils.localizeMessage('login.phone', 'Phone'));
        }

        if (usernameSigninEnabled) {
            loginPlaceholders.push(Utils.localizeMessage('login.username', 'Username'));
        }

        if (ldapEnabled) {
            if (this.props.ldapLoginFieldName) {
                loginPlaceholders.push(this.props.ldapLoginFieldName);
            } else {
                loginPlaceholders.push(Utils.localizeMessage('login.ldapUsername', 'AD/LDAP Username'));
            }
        }

        if (loginPlaceholders.length >= 2) {
            return loginPlaceholders.slice(0, loginPlaceholders.length - 1).join(', ') +
                Utils.localizeMessage('login.placeholderOr', ' or ') +
                loginPlaceholders[loginPlaceholders.length - 1];
        } else if (loginPlaceholders.length === 1) {
            return loginPlaceholders[0];
        }

        return '';
    }

    checkSignUpEnabled = () => {
        return this.props.enableSignUpWithEmail ||
            this.props.enableSignUpWithGitLab ||
            this.props.enableSignUpWithOffice365 ||
            this.props.enableSignUpWithGoogle ||
            this.props.enableLdap ||
            this.props.enableSaml;
    }

    onDismissSessionExpired = () => {
        LocalStorageStore.setWasLoggedIn(false);
        this.setState({sessionExpired: false});
    }

    handleRememberMe = () => {
        this.setState({
            rememberMe:!this.state.rememberMe
        })
    }

    submitSendSMS = () => {
        const phone = this.state.loginId;
        const typeM = Constants.VERIFICATION_CODE_TYPE.SIGN_EXCEPTION;
        if (!Utils.isPhone(phone)) {
            this.setState({
                showMfa: false,
                loading: false,
                serverError: (
                    <FormattedMessage
                        id='login.invalidPassword'
                        defaultMessage='Only support phone message for getting verification code. '
                    />
                ),
            });
        }
        this.props.actions.sendSMS(phone, typeM).then(({data, error: err}) => {
            if (data["flag"] === "true") {
            } else if (err) {

            }
        });
    }

    createExtraText = () => {
        const extraParam = (new URLSearchParams(this.props.location.search)).get('extra');

        if (this.state.sessionExpired) {
            return (
                <div className='alert alert-warning'>
                    <WarningIcon/>
                    {' '}
                    <FormattedMessage
                        id='login.session_expired'
                        defaultMessage='Your session has expired. Please log in again.'
                    />
                    {' '}
                    <Link
                        className='btn-close'
                        to='/login'
                        onClick={this.onDismissSessionExpired}
                    >
                        <span>
                            {'×'}
                        </span>
                    </Link>
                </div>
            );
        }

        if (extraParam === Constants.GET_TERMS_ERROR) {
            return (
                <div className='alert has-error no-padding'>
                    <label className='control-label'>
                        <FormattedMessage
                            id='login.get_terms_error'
                            defaultMessage='Unable to load terms of service. If this issue persists, contact your System Administrator.'
                        />
                    </label>
                </div>
            );
        } else if (extraParam === Constants.TERMS_REJECTED) {
            return (
                <div className='alert alert-warning'>
                    <WarningIcon/>
                    <FormattedMarkdownMessage
                        id='login.terms_rejected'
                        defaultMessage='You must agree to the terms of service before accessing {siteName}. Please contact your System Administrator for more details.'
                        values={{
                            siteName: this.props.siteName,
                        }}
                    />
                </div>
            );
        } else if (extraParam === Constants.SIGNIN_CHANGE) {
            return (
                <div className='alert alert-success'>
                    <SuccessIcon/>
                    <FormattedMessage
                        id='login.changed'
                        defaultMessage=' Sign-in method changed successfully'
                    />
                </div>
            );
        } else if (extraParam === Constants.SIGNIN_VERIFIED) {
            return (
                <div className='alert alert-success'>
                    <SuccessIcon/>
                    <FormattedMessage
                        id='login.verified'
                        defaultMessage=' Email Verified'
                    />
                </div>
            );
        } else if (extraParam === Constants.PASSWORD_CHANGE) {
            return (
                <div
                    id='passwordUpdatedSuccess'
                    className='alert alert-success'
                >
                    <SuccessIcon/>
                    <FormattedMessage
                        id='login.passwordChanged'
                        defaultMessage=' Password updated successfully'
                    />
                </div>
            );
        } else if (extraParam === Constants.CREATE_LDAP) {
            return (
                <div className='alert alert-grey'>
                    <FormattedMessage
                        id='login.ldapCreate'
                        defaultMessage=' Enter your AD/LDAP username and password to create an account.'
                    />
                </div>
            );
        }

        return null;
    }

    createLoginOptions = () => {
        const loginControls = [];

        const ldapEnabled = this.state.ldapEnabled;
        const gitlabSigninEnabled = this.props.enableSignUpWithGitLab;
        const googleSigninEnabled = this.props.enableSignUpWithGoogle;
        const office365SigninEnabled = this.props.enableSignUpWithOffice365;
        const samlSigninEnabled = this.state.samlEnabled;
        const usernameSigninEnabled = this.state.usernameSigninEnabled;
        const emailSigninEnabled = this.state.emailSigninEnabled;

        if (emailSigninEnabled || usernameSigninEnabled || ldapEnabled) {
            let errorClass = '';
            if (this.state.serverError) {
                errorClass = ' has-error';
            }

            loginControls.push(
                <form
                    key='loginBoxes'
                    onSubmit={this.preSubmit}
                    className='login_box'
                >
                    <div className='signup__email-container'>
                        <Alert className={(this.state.isShowMessage?"account-alert-show":"account-alert")} closable={false} title={this.state.serverError}  type="error" showIcon={true} />

                        <div className={'form-group' + errorClass}>
                            <input
                                id='loginId'
                                className='form-control input-username'
                                ref='loginId'
                                name='loginId'
                                value={this.state.loginId}
                                onChange={this.handleLoginIdChange}
                                placeholder={"请输入手机号码"}
                                spellCheck='false'
                                autoCapitalize='off'
                                autoFocus={true}
                            />
                            <hr/>
                        </div>
                        <div className={'form-group' + errorClass}>
                            <input
                                id='loginPassword'
                                type={this.state.isEyeOpen?"text":'password'}
                                className={'form-control input-password'}
                                ref='password'
                                name='password'
                                value={this.state.password}
                                onChange={this.handlePasswordChange}
                                placeholder={"请输入密码"}
                                spellCheck='false'
                            />
                            <div className="heaven-eye" onClick={this.toggleEyeURL}>
                                <img src={this.state.isEyeOpen?eyeOpen:eye} alt="" />
                            </div>
                            <hr/>
                        </div>
                        <div className='form-etc'>
                            <div className='auto-login'>
                                <Checkbox checked={this.state.rememberMe}  onChange={this.handleRememberMe}>自动登录</Checkbox>
                            </div>
                            <div className='get-help'>
                                <Link to={'/reset_password'} >忘记密码</Link>
                                |
                                <Link to={'/sign_up'}>新用户注册</Link>
                            </div>
                        </div>
                        <div className={'form-group' + errorClass}
                             style={{display: this.state.signExceptionFlag ? 'block' : 'none'}}>
                            <LocalizedInput
                                id='signException'
                                type='text'
                                className='form-control'
                                ref='signException'
                                name='signException'
                                value={this.state.signException}
                                onChange={this.handleSignExceptionChange}
                                placeholder={{id: t('login.signException'), defaultMessage: 'Verification Code'}}
                                spellCheck='false'
                            />
                            <button
                                id='getCodeButton'
                                className='btn btn-primary'
                                type='button'
                                onClick={this.submitSendSMS}
                            >
                                <LoadingWrapper
                                    id='verify_button_signing'
                                    loading={this.state.signExceptionLoading}
                                    text={Utils.localizeMessage('login.getVerificationCodeLoading', 'Getting Verification Code...')}
                                >
                                    <FormattedMessage
                                        id='login.getVerificationCode'
                                        defaultMessage='Get Verification Code'
                                    />
                                </LoadingWrapper>
                            </button>
                        </div>
                        <div className='form-group'>
                            <button
                                id='loginButton'
                                type='submit'
                                className={'btn btn-primary btn-login'+(this.state.isLoginOK?"-ok":"")}
                            >
                                <LoadingWrapper
                                    id='login_button_signing'
                                    loading={this.state.loading}
                                    text={Utils.localizeMessage('login.signInLoading', 'Signing in...')}
                                >
                                    <FormattedMessage
                                        id='login.signIn'
                                        defaultMessage='Sign in'
                                    />
                                </LoadingWrapper>
                            </button>
                        </div>
                    </div>
                </form>
            );
        }

        if (1===0&&this.props.enableOpenServer && this.checkSignUpEnabled()) {
            loginControls.push(
                <div
                    className='form-group'
                    key='signup'
                >
                    <span>
                        <FormattedMessage
                            id='login.noAccount'
                            defaultMessage="Don't have an account? "
                        />
                        <Link
                            id='signup'
                            to={'/signup_user_complete' + this.props.location.search}
                            className='signup-team-login'
                        >
                            <FormattedMessage
                                id='login.create'
                                defaultMessage='Create one now'
                            />
                        </Link>
                    </span>
                </div>
            );
        }

        if (usernameSigninEnabled || emailSigninEnabled) {
            loginControls.push(
                <div
                    id='login_forgot'
                    key='forgotPassword'
                    className='login_forgot form-group'
                >
                    <img src={logoWords} alt=""/>
                </div>
            );
        }

        if ((emailSigninEnabled || usernameSigninEnabled || ldapEnabled) && (gitlabSigninEnabled || googleSigninEnabled || samlSigninEnabled || office365SigninEnabled)) {
            loginControls.push(
                <div
                    key='divider'
                    className='or__container'
                >
                    <FormattedMessage
                        id='login.or'
                        defaultMessage='or'
                    />
                </div>
            );

            loginControls.push(
                <h5 key='oauthHeader'>
                    <FormattedMessage
                        id='login.signInWith'
                        defaultMessage='Sign in with:'
                    />
                </h5>
            );
        }

        if (gitlabSigninEnabled) {
            loginControls.push(
                <a
                    className='btn btn-custom-login gitlab'
                    key='gitlab'
                    href={Client4.getOAuthRoute() + '/gitlab/login' + this.props.location.search}
                >
                    <span>
                        <span className='icon'/>
                        <span>
                            <FormattedMessage
                                id='login.gitlab'
                                defaultMessage='GitLab'
                            />
                        </span>
                    </span>
                </a>
            );
        }

        if (googleSigninEnabled) {
            loginControls.push(
                <a
                    className='btn btn-custom-login google'
                    key='google'
                    href={Client4.getOAuthRoute() + '/google/login' + this.props.location.search}
                >
                    <span>
                        <span className='icon'/>
                        <span>
                            <FormattedMessage
                                id='login.google'
                                defaultMessage='Google Apps'
                            />
                        </span>
                    </span>
                </a>
            );
        }

        if (office365SigninEnabled) {
            loginControls.push(
                <a
                    className='btn btn-custom-login office365'
                    key='office365'
                    href={Client4.getOAuthRoute() + '/office365/login' + this.props.location.search}
                >
                    <span>
                        <span className='icon'/>
                        <span>
                            <FormattedMessage
                                id='login.office365'
                                defaultMessage='Office 365'
                            />
                        </span>
                    </span>
                </a>
            );
        }

        if (samlSigninEnabled) {
            loginControls.push(
                <a
                    className='btn btn-custom-login saml'
                    key='saml'
                    href={Client4.getUrl() + '/login/sso/saml' + this.props.location.search}
                >
                    <span>
                        <span
                            className='icon fa fa-lock fa--margin-top'
                            title='Saml icon'
                        />
                        <span>
                            {this.props.samlLoginButtonText}
                        </span>
                    </span>
                </a>
            );
        }

        if (loginControls.length === 0) {
            loginControls.push(
                <FormError
                    key='noMethods'
                    error={
                        <FormattedMessage
                            id='login.noMethods'
                            defaultMessage='No sign-in methods are enabled. Please contact your System Administrator.'
                        />
                    }
                    margin={true}
                />
            );
        }

        return (
            <div>
                {this.createExtraText()}
                {loginControls}
            </div>
        );
    }

    hideMfa = () => {
        this.setState({showMfa: false});
    }

    render() {
        const {
            customDescriptionText,
            siteName,
            initializing,
        } = this.props;

        if (initializing) {
            return (<LoadingScreen/>);
        }

        let content;
        let customContent;
        let customClass;
        let backButton;
        if (this.state.showMfa) {
            content = (
                <LoginMfa
                    loginId={this.state.loginId}
                    password={this.state.password}
                    submit={this.submit}
                />
            );
            backButton = (<BackButton onClick={this.hideMfa}/>);
        } else {
            content = this.createLoginOptions();
            customContent = this.createCustomLogin();
            if (customContent) {
                customClass = 'branded';
            }
        }

        return (
            <div>
                <AnnouncementBar/>
                {backButton}
                <div
                    id='login_section'
                    className='col-sm-12'
                >
                    <div className={'middle_part signup-team__container ' + customClass}>
                        <div className='work_thing'><img src={workThing} alt="group picture"/></div>
                        <div className='signup__content account_form'>
                            <SiteNameAndDescription
                                customDescriptionText={customDescriptionText}
                                siteName={siteName}
                            />
                            {content}
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default injectIntl(LoginController);
