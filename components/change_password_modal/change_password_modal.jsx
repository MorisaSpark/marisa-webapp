// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {FormattedMessage, injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';

import {isValidPassword} from 'panguaxe-redux/utils/helpers';
import * as Utils from 'utils/utils.jsx';
import eye from 'images/ithpower/login/eye.png';
import eyeOpen from 'images/ithpower/login/eye_open.png';
import './change_password_modal.scss'
import {Button, Form, Input} from 'element-react';

class ChangePasswordModal extends React.PureComponent {
    static propTypes = {

        currentUserId: PropTypes.string.isRequired,
        currentTeamId: PropTypes.string.isRequired,
        modalId: PropTypes.string.isRequired,
        onHide: PropTypes.func.isRequired,
        show: PropTypes.bool.isRequired,
        intl: intlShape.isRequired,
        actions: PropTypes.shape({
            changePassword: PropTypes.func.isRequired,
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
            isShowErrorMes: false,
            errorMes: " 您输入的原密码错误，请重新输入。",
        }
    }


    onChange(key, value) {
        console.log(this.state.form);
        this.setState({
            form: Object.assign({}, this.state.form, {[key]: value})
        });
    }

    handleCancel = () => {
        this.props.onHide();
    };

    handleSubmit = () => {
        let newPassword = this.state.form.newPassword;
        let oldPassword = this.state.form.oldPassword;
        if (newPassword === "" || oldPassword === "") {
            let errorMes = "输入值为空";
            this.setState({
                isShowErrorMes: true,
                errorMes: errorMes,
            });
            console.log(errorMes);
            return;
        }
        if (!Utils.isValidPasswordNew(newPassword) || !Utils.isValidPasswordNew(oldPassword)) {
            let errorMes = "输入密码不合理";
            this.setState({
                isShowErrorMes: true,
                errorMes: errorMes,
            });
            console.log(errorMes);
            return;
        }
        this.props.actions.changePassword(this.state.form)
            .then((res) => {
                if (res.result !== undefined && res.result.Flag) {
                    console.log("修改密码成功");
                    this.props.onHide();
                } else {
                    console.log(res.result.Error);
                    console.log('输入的原密码错误，请重新输入');
                }
            })
    };

    onClickToggleEye = () => {
        this.setState({
            isEyeOpen: !this.state.isEyeOpen
        })
    };

    render() {
        return (
            <Modal
                dialogClassName='change-password'
                show={this.props.show}
                onHide={this.props.onHide}
                id='changePasswordModal'
                role='dialog'
                aria-labelledby='changePasswordModalLabel'
                className='change-password'
            >
                <Form ref="form" model={this.state.form} rules={this.state.rules} labelWidth="64"
                      className="demo-ruleForm">
                    <Modal.Header closeButton={false}>
                        <Modal.Title
                            componentClass='div'
                            id='changePasswordModalLabel'
                        >
                            修改密码
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className={this.state.isShowErrorMes ? "tips" : "disNone"}>
                            <i className="el-icon-circle-close"/>
                            {this.state.errorMes}
                        </div>
                        <div className={"form-inputs"}>
                            <Form.Item label="原密码" prop="oldPassword" className={"oldPassword"}>
                                <Input placeholder="请输入原密码" value={this.state.form.oldPassword}
                                       type={"password"} onChange={this.onChange.bind(this, 'oldPassword')}/>
                            </Form.Item>
                            <Form.Item label="新密码" prop="newPassword" className={"newPassword"}>
                                <Input placeholder="请输入新密码" value={this.state.form.newPassword}
                                       type={this.state.isEyeOpen ? "text" : "password"}
                                       onChange={this.onChange.bind(this, 'newPassword')}/>
                                <div className={"img-div"} onClick={this.onClickToggleEye}>
                                    <img src={this.state.isEyeOpen ? eyeOpen : eye}
                                         alt={this.state.isEyeOpen ? "開" : "関"}/>
                                </div>
                            </Form.Item>
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
                            id='changePasswordYes'
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
