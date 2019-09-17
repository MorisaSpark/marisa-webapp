// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';

import Constants from 'utils/constants.jsx';
import GetVerifyCodeButton from '../get_verify_code_button';
import {isKeyPressed} from 'utils/utils';

import './change_phone_modal.scss'
import {Button, Form, Input, Menu, Upload, Radio, Checkbox, MessageBox, Dialog} from 'element-react';
import * as Utils from "../../utils/utils";

class ChangePhoneModal extends React.PureComponent {
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
         * Current team id.
         */
        modalId: PropTypes.string.isRequired,

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
            getMe: PropTypes.func.isRequired,
        }),
    };

    constructor(props) {
        super(props);
        this.state = {
            oldPhone: "",
            isCountDown: false,
            deadTime: 10,
            internal: 10,

            form: {
                newPhone: "",
                verifyCode: "",
            },
            rules: {},
            user: {
                email: "",
            },
            isShowErrorMessage: false,
            errorMessage: "",
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

    componentWillMount() {
        this.props.actions.getMe().then((res) => {
            if (res.data !== null) {
                this.setState({
                    user: res.data,
                })
            }
        })
    }

    onChange(key, value) {
        console.log(this.state.form);
        this.setState({
            form: Object.assign({}, this.state.form, {[key]: value})
        });
    }

    handleSubmit = () => {
        if (!Utils.isPhone(this.state.form.newPhone)) {
            let errMes = "手机号不合理";
            this.setState({
                isShowErrorMessage: true,
                errorMessage: errMes,
            });
            console.log(errMes);
            return;
        }
        if(this.state.form.newPhone === this.state.user.email){

            let errMes = "手机号为原手机号";
            this.setState({
                isShowErrorMessage: true,
                errorMessage: errMes,
            });
            console.log(errMes);
            return;

        }
        this.props.actions.changePhone(this.state.form).then((res) => {
            if (res.data) {
                console.log("修改手机号成功");
                this.props.onHide();
            }
        })
    };

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
                               {this.state.user.email}
                           </span>
                        </div>
                        <Form.Item label="新手机号" prop="newPhone" className={"newPhone"}>
                            <Input placeholder="请输入您的手机号" value={this.state.form.newPhone}
                                   onChange={this.onChange.bind(this, 'newPhone')}/>
                        </Form.Item>
                        <Form.Item label="验证码" prop="verifyCode" className={"verifyCode"}>
                            <Input placeholder="请输入验证码" value={this.state.form.verifyCode}
                                   onChange={this.onChange.bind(this, 'verifyCode')}/>
                            <GetVerifyCodeButton newPhone={this.state.form.newPhone}
                                                 typeM={Constants.VERIFICATION_CODE_TYPE.MESSAGE_CHANGE}/>
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

export default injectIntl(ChangePhoneModal);
