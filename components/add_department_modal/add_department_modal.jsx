// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import React from 'react';
import {Modal} from 'react-bootstrap';
import {injectIntl, intlShape} from 'react-intl';
import PropTypes from 'prop-types';

import './add_department_modal.scss'
import {Button, Form, Input, Select} from 'element-react';
import * as Utils from "../../utils/utils";

class AddDepartmentModal extends React.PureComponent {
    static propTypes = {

        currentUserId: PropTypes.string.isRequired,
        currentTeamId: PropTypes.string.isRequired,
        modalId: PropTypes.string.isRequired,
        onHide: PropTypes.func.isRequired,
        show: PropTypes.bool.isRequired,
        intl: intlShape.isRequired,
        actions: PropTypes.shape({
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
                wholeName: "",
                pId: 0,
                teamId: "",
            },
            isShowErrorMes: false,
            errorMes: "",
            departmentList: [],
            pName: "",
            isShowDepartmentList: false,
            teamName: "",
        }
    }

    componentWillMount() {
        this.props.actions.getAllDepartmentByTeamId({teamName: this.props.currentTeamId})
            .then((res) => {
                let result = res.result;
                if (result !== undefined) {
                    if (result.Flag) {
                        console.log("查询成功");
                        this.setState({
                            departmentList: result.Data.Rows.length === 0 ? [] : result.Data.Rows,
                        })
                    } else {
                        console.log("查询失败");
                        this.setState({
                            isShowErrorMes: true,
                            errorMes: result.Error,
                        })
                    }
                }
            });
        this.props.actions.getTeamById({teamId: this.props.currentTeamId})
            .then((res) => {
                if (res.result !== undefined) {
                    this.setState({
                        teamName: res.result.display_name,
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
        let form = this.state.form;
        console.log(this.state);
        if (form.wholeName === "") {
            let errorMes = "输入项为空";
            this.setState({
                isShowErrorMes: true,
                errorMes,
            });
            console.log(errorMes);
            return
        }
        let byteLength = Utils.getStringByteLength(form.wholeName);
        if (byteLength < 4 || byteLength > 32) {
            let errorMes = "输入长度不符合";
            this.setState({
                isShowErrorMes: true,
                errorMes,
            });
            console.log(errorMes);
            return
        }
        form.teamId = this.props.currentTeamId;
        console.log(form);
        this.props.actions.addDepartment(form)
            .then((res) => {
                if (res.result !== undefined) {
                    if (res.result.Flag) {
                        console.log("添加成功");
                        this.props.onHide();
                    } else {
                        console.log(res.result.error);
                    }
                }
            })
    };
    handleCancel = () => {
        this.props.onHide();
    };
    handleChange = (e) => {
        console.log(e);
        let form = this.state.form;
        form.pId = e;
        this.setState({
            form: form
        });
        console.log(this.state);
    };

    render() {
        return (
            <Modal
                dialogClassName='a11y__modal'
                className='add-department'
                show={this.props.show}
                onHide={this.props.onHide}
                id='addDepartmentModal'
                role='dialog'
                aria-labelledby='addDepartmentModalLabel'
            >
                <Form ref="form" model={this.state.form} rules={this.state.rules} labelWidth="64"
                      className="demo-ruleForm">
                    <Modal.Header closeButton={false}>
                        <Modal.Title
                            componentClass='div'
                            id='addDepartmentModalLabel'
                        >
                            添加部门
                        </Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Item label="名称" prop="wholeName" className={"wholeName"}>
                            <Input placeholder="部门名称，“-”分隔上下级部门" value={this.state.form.wholeName}
                                   onChange={this.onChange.bind(this, 'wholeName')}/>
                        </Form.Item>
                        <div className={"name-tips"}>
                            如“研发部-测试部”，将创建“研发部”及其下级部门“测试部”
                        </div>
                        <Form.Item label="上级部门" prop="pName" className={"pName"}>
                            <Select onChange={this.handleChange} filterable={true} placeholder={this.state.teamName}>
                                {
                                    this.state.departmentList.map(department => {
                                        return (
                                            <Select.Option key={department.id} label={department.name}
                                                           value={department.id}>
                                                <span>{department.name}</span>
                                            </Select.Option>
                                        )
                                    })
                                }
                            </Select>
                        </Form.Item>
                        <div className={"footer"}>
                            <button
                                type='button'
                                className='btn btn-danger'
                                onClick={this.handleCancel}
                                id='addDepartmentNo'
                            >
                                取消
                            </button>
                            <button
                                type='button'
                                className='btn btn-danger'
                                onClick={this.handleSubmit}
                                id='addDepartmentYes'
                            >
                                确认
                            </button>
                        </div>
                    </Modal.Body>
                </Form>
            </Modal>
        );
    }
}

export default injectIntl(AddDepartmentModal);
