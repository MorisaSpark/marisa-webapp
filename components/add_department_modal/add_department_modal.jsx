// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';

import Constants from 'utils/constants.jsx';
import {isKeyPressed} from 'utils/utils';

import './add_department_modal.scss'
import {Button, Form, Input, Menu, Upload, Radio, Checkbox, MessageBox, Dialog} from 'element-react';

class AddDepartmentModal extends React.PureComponent {
    static propTypes = {

        /**
         * Current user id.
         */
        currentUserId: PropTypes.string.isRequired,

        /**
         * Current team id.
         */
        currentTeamId: PropTypes.string.isRequired,

        /**
         * hide action
         */

        onHide: PropTypes.func.isRequired,

        /**
         * show or hide modal
         */

        show: PropTypes.bool.isRequired,

        intl: intlShape.isRequired,

        actions: PropTypes.shape({

            /**
             * An action to remove user from team
             */

            leaveTeam: PropTypes.func.isRequired,

            /**
             * An action to toggle the right menu
             */

            toggleSideBarRightMenu: PropTypes.func.isRequired,
        }),
    };

    constructor(props) {
        super(props);
        this.state = {
            isCountDown: false,
            deadTime: 10,
            internal: 10,

            form: {
                newPhone: "",
                verifyCode: "",
            }
        }
    }

    count = () => {
        let deadTime = this.state.internal;
        let isCountDown = true;
        let timer1 = setInterval(() => {
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

    componentDidMount() {
        if (this.props.show) {
            document.addEventListener('keypress', this.handleKeyPress);
        }
    }

    componentWillUnmount() {
        document.removeEventListener('keypress', this.handleKeyPress);
    }

    handleKeyPress = (e) => {
        if (isKeyPressed(e, Constants.KeyCodes.ENTER)) {
            this.handleSubmit(e);
        }
    };

    handleSubmit = () => {
        this.props.onHide();
        // this.props.actions.leaveTeam(this.props.currentTeamId, this.props.currentUserId);
        // this.props.actions.toggleSideBarRightMenu();
    };

    onChange(key, value) {
        this.setState({
            form: Object.assign(this.state.form, {[key]: value})
        });
    }

    render() {
        return (
            <Modal
                dialogClassName='a11y__modal'
                className='change-phone'
                show={this.props.show}
                onHide={this.props.onHide}
                id='changePhoneModal'
                role='dialog'
                aria-labelledby='changePhoneModalLabel'
            >
                <Form ref="form" model={this.state.form} rules={this.state.rules} labelWidth="64"
                      className="demo-ruleForm">
                    <Modal.Header closeButton={false}>
                        <Modal.Title
                            componentClass='div'
                            id='changePhoneModalLabel'
                        >
                            更换手机号
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className={"tips"}>
                            手机号更换后，下次登录请使用新手机号登录。
                        </div>
                        <div className={"now-phone"}>
                           <span>
                               当前手机号
                           </span>
                           <span>
                                150 0000 0000
                           </span>
                        </div>
                        <Form.Item label="新手机号" prop="newPhone" className={"newPhone"}>
                            <Input placeholder="请输入您的手机号" value={this.state.form.newPhone}
                                   onChange={this.onChange.bind(this, 'newPhone')}/>
                        </Form.Item>
                        <Form.Item label="验证码" prop="verifyCode" className={"verifyCode"}>
                            <Input placeholder="请输入验证码" value={this.state.form.verifyCode}
                                   onChange={this.onChange.bind(this, 'verifyCode')}/>
                            <button
                                id='verificationCodeButton'
                                type='button'
                                className={'btn btn-primary btn-send-sms ' + (this.state.isCountDown ? "css-ban-click" : "")}
                                onClick={this.submitSendSMS}
                            >
                                {this.state.isCountDown ? (this.state.deadTime + " 秒") : ("获取验证码")}
                            </button>
                        </Form.Item>
                    </Modal.Body>
                    <Modal.Footer>
                        <button
                            type='button'
                            className='btn btn-danger'
                            onClick={this.handleSubmit}
                            id='changePhoneYes'
                        >
                            确认
                        </button>
                    </Modal.Footer>
                </Form>
            </Modal>
        );
    }
}

export default injectIntl(AddDepartmentModal);
