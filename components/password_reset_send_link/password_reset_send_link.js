// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import PropTypes from 'prop-types';
import React from 'react';
import {FormattedMessage} from 'react-intl';
import * as Utils from 'utils/utils.jsx';

import {isEmail} from 'mattermost-redux/utils/helpers';

import BackButton from 'components/common/back_button';
import LocalizedInput from 'components/localized_input/localized_input';

import {t} from 'utils/i18n.jsx';
import Constants from "../../utils/constants";

export default class PasswordResetSendLink extends React.PureComponent {
    static propTypes = {
        actions: PropTypes.shape({
            sendPasswordResetEmail: PropTypes.func.isRequired,
            sendSMS: PropTypes.func.isRequired,
        }).isRequired,
    };

    state = {
        error: null,
        updateText: null,
    };
    resetForm = React.createRef();
    emailInput = React.createRef();
    verificationCode = React.createRef();
    newPasswordInput = React.createRef();
    retypePasswordInput = React.createRef();
    handleSendLink = async (e) => {
        e.preventDefault();

        const input = this.emailInput.current && this.emailInput.current.input.current;
        const email = input && input.value.trim().toLowerCase();
        if (!email || !Utils.isPhone(email)) {
            this.setState({
                error: (
                    <FormattedMessage
                        id={'password_send.error'}
                        defaultMessage={'Please enter a valid phone number.'}
                    />
                ),
            });
            return;
        }
        const verificationCode = this.verificationCode.current.value.trim();
        if (!verificationCode || !Utils.isVerificationCode(verificationCode)) {
            this.setState({
                error: (
                    <FormattedMessage
                        id={'password_send.verificationCodeError'}
                        defaultMessage={'Please enter a valid verification code. '}
                    />
                ),
            });
            return;
        }
        const newPassword = this.newPasswordInput.current.value.trim();
        const retypePassword = this.retypePasswordInput.current.value.trim();
        if (!newPassword||!retypePassword) {
            this.setState({
                error: (
                    <FormattedMessage
                        id={'password_send.passwordError'}
                        defaultMessage={'Please enter a valid verification password. '}
                    />
                ),
            });
            return;
        }
        if (newPassword!==retypePassword) {
            this.setState({
                error: (
                    <FormattedMessage
                        id={'password_send.passwordError'}
                        defaultMessage={'Please enter a valid verification password. '}
                    />
                ),
            });
            return;
        }

        // End of error checking clear error
        this.setState({error: null});

        const {data, error} = await this.props.actions.sendPasswordResetEmail(email, newPassword, verificationCode);
        if (data) {
            this.setState({
                error: null,
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
            if (this.resetForm.current) {
                this.resetForm.current.hidden = true;
            }
        } else if (error) {
            this.setState({
                error: error.message,
                update_text: null,
            });
        }
    }

    submitSendSMS = () => {
        const phone = this.emailInput.current.value.trim();
        const typeM = Constants.VERIFICATION_CODE_TYPE.PASSWORD_CHANGE;
        if(!Utils.isPhone(phone)){
            this.setState({
                error: (
                    <FormattedMessage
                        id={'password_send.error'}
                        defaultMessage={'Please enter a valid phone number.'}
                    />
                ),
            });
            return;再次
        }
        this.props.actions.sendSMS(phone, typeM).
        then(({data, error: err}) => {
            if (data["flag"]==="true") {
            } else if (err) {

            }
        });
    }

    render() {
        let error = null;
        let error1 = null;
        let error2 = null;
        let error3 = null;
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
        let formClass3 = 'form-group';
        if (error3) {
            formClass3 += ' has-error';
        }

        return (
            <div>
                <BackButton/>
                <div className='col-sm-12'>
                    <div className='signup-team__container'>
                        <h3>
                            <FormattedMessage
                                id='password_send.title'
                                defaultMessage='Password Reset'
                            />
                        </h3>
                        {this.state.updateText}
                        <form
                            onSubmit={this.handleSendLink}
                            ref={this.resetForm}
                        >
                            <p>
                                <FormattedMessage
                                    id='password_send.description'
                                    defaultMessage='To reset your password, enter the phone number you used to sign up'
                                />
                            </p>
                            <div className={formClass}>
                                <LocalizedInput
                                    id='passwordResetEmailInput'
                                    type='tel'
                                    className='form-control'
                                    name='email'
                                    placeholder={{id: t('password_send.phone'), defaultMessage: 'Phone'}}
                                    ref={this.emailInput}
                                    spellCheck='false'
                                    autoFocus={true}
                                />
                            </div>
                            <div className={formClass1}>
                                <LocalizedInput
                                    id='verificationCodeInput'
                                    type='text'
                                    className='form-control'
                                    name='verificationCode'
                                    placeholder={{id: t('password_send.verificationCode'), defaultMessage: 'Verification code'}}
                                    ref={this.verificationCode}
                                    spellCheck='false'
                                />
                                <button
                                    id='verificationCodeButton'
                                    type='button'
                                    className='btn btn-primary'
                                    onClick={this.submitSendSMS}
                                >
                                    <FormattedMessage
                                        id='password_send.getVerificationCode'
                                        defaultMessage='Get verification code'
                                    />
                                </button>
                            </div>
                            <div className={formClass2}>
                                <LocalizedInput
                                    id='newPassword'
                                    type='password'
                                    className='form-control'
                                    name='newPassword'
                                    placeholder={{id: t('password_send.newPassword'), defaultMessage: 'new password'}}
                                    ref={this.newPasswordInput}
                                    spellCheck='false'
                                />
                            </div>
                            <div className={formClass3}>
                                <LocalizedInput
                                    id='retypePassword'
                                    type='password'
                                    className='form-control'
                                    name='retypePassword'
                                    placeholder={{id: t('password_send.retypePassword'), defaultMessage: 'retype password'}}
                                    ref={this.retypePasswordInput}
                                    spellCheck='false'
                                />
                            </div>
                            {error}
                            <button
                                id='passwordResetButton'
                                type='submit'
                                className='btn btn-primary'
                            >
                                <FormattedMessage
                                    id='password_send.reset'
                                    defaultMessage='Reset my password'
                                />
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        );
    }
}
