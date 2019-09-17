// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';
import {getCurrentUserId} from 'panguaxe-redux/selectors/entities/users';
import {getCurrentTeamId} from 'panguaxe-redux/selectors/entities/teams';

import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';
import {getAllDepartmentsByTeamId, getTeamById} from 'panguaxe-redux/actions/teams';
import {getUser} from 'panguaxe-redux/actions/users';
import {getManagerByDepartmentId} from 'panguaxe-redux/actions/departments';
import {addStaff} from 'panguaxe-redux/actions/users';
import AddStaffModel from './add_staff_model.jsx';
import {closeModal} from 'actions/views/modals';
import {setGlobalItem} from 'actions/storage';
import {uploadFile} from 'actions/file_actions.jsx';

function mapStateToProps(state) {
    const modalId = ModalIdentifiers.ADD_STAFF;
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
            closeModal: () => closeModal(ModalIdentifiers.ADD_STAFF),
            getAllDepartmentsByTeamId,
            addStaff,
            getManagerByDepartmentId,
            getUser,
            getTeamById,
            uploadFile,
            setDraft: setGlobalItem,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(AddStaffModel));
