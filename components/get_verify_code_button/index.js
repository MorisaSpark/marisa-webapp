// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';
import {getAllDepartmentsByTeamId} from 'panguaxe-redux/actions/teams';
import {addStaff} from 'panguaxe-redux/actions/users';
import GetVerifyCodeButton from './get_verify_code_button.jsx';
import {closeModal} from 'actions/views/modals';
import {sendSMS} from 'panguaxe-redux/actions/users';

function mapStateToProps(state) {
    const modalId = ModalIdentifiers.ADD_STAFF;
    return {
        show: isModalOpen(state, modalId),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            closeModal: () => closeModal(ModalIdentifiers.ADD_STAFF),
            getAllDepartmentsByTeamId,
            addStaff,
            sendSMS,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(GetVerifyCodeButton));
