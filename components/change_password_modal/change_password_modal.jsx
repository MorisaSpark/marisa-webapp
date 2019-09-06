// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';

import Constants from 'utils/constants.jsx';
import {isKeyPressed} from 'utils/utils';

import eye from 'images/ithpower/login/eye.png';
import eyeOpen from 'images/ithpower/login/eye_open.png';
import './change_password_modal.scss'
import {Button, Form, Input, Menu, Upload, Radio, Checkbox, MessageBox, Dialog} from 'element-react';

class ChangePasswordModal extends React.PureComponent {
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
            form: {
                newPassword: "",
                oldPassword: "",
            },
            isEyeOpen: false,

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
        this.props.actions.changePassword(this.state.form)
            .then((res) => {
                if (res.data.Flag != undefined && res.data.Flag) {
                    this.props.onHide();
                }else{

                }
            })
    };

    onChange(key, value) {
        this.setState({
            form: Object.assign(this.state.form, {[key]: value})
        });
    }

    render() {
        return (
            <Modal
                dialogClassName='change-password'
                show={this.props.show}
                onHide={this.props.onHide}
                id='changePhoneModal'
                role='dialog'
                aria-labelledby='changePhoneModalLabel'
            >
                <Form ref="form" model={this.state.form} rules={this.state.rules} labelWidth="50"
                      className="demo-ruleForm">
                    <Modal.Header closeButton={false}>
                        <Modal.Title
                            componentClass='div'
                            id='changePhoneModalLabel'
                        >
                            修改密码
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className={"tips"}>
                            <i className="el-icon-circle-close"/>
                            您输入的原密码错误，请重新输入。
                        </div>
                        <div className={"form-inputs"}>
                            <Form.Item label="原密码" prop="oldPassword" className={"oldPassword"}>
                                <Input placeholder="请输入原密码" value={this.state.form.oldPassword}
                                       onChange={this.onChange.bind(this, 'oldPassword')}/>
                            </Form.Item>
                            <Form.Item label="新密码" prop="newPassword" className={"newPassword"}>
                                <Input placeholder="请输入新密码" value={this.state.form.newPassword}
                                       onChange={this.onChange.bind(this, 'newPassword')}/>
                                <div className={"img-div"}>
                                    <img src={this.state.isEyeOpen ? eyeOpen : eye}
                                         alt={this.state.isEyeOpen ? "開" : "関"}/>
                                </div>
                            </Form.Item>
                            <hr/>
                            <div className={"usage-tip"}>
                                密码必须至少8个字符，而且同时包含字母和数字
                            </div>
                        </div>
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

export default injectIntl(ChangePasswordModal);
