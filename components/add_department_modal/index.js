// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getCurrentUserId} from 'panguaxe-redux/selectors/entities/users';
import {getCurrentTeamId} from 'panguaxe-redux/selectors/entities/teams';
import {addDepartment, getAllDepartmentByTeamId} from 'panguaxe-redux/actions/departments';
import {getTeamById} from 'panguaxe-redux/actions/teams';

import {ModalIdentifiers} from 'utils/constants';

import {isModalOpen} from 'selectors/views/modals';

import AddDepartmentModal from './add_department_modal.jsx';

function mapStateToProps(state) {
    const modalId = ModalIdentifiers.ADD_DEPARTMENT;
    const currentUserId = getCurrentUserId(state);
    const currentTeamId = getCurrentTeamId(state);
    const show = isModalOpen(state, modalId);
    return {
        currentUserId,
        currentTeamId,
        show,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            addDepartment,
            getAllDepartmentByTeamId,
            getTeamById,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(AddDepartmentModal);
