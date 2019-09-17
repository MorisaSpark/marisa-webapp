// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getCurrentUserId} from 'panguaxe-redux/selectors/entities/users';
import {getCurrentTeamId} from 'panguaxe-redux/selectors/entities/teams';
import {changePassword} from 'panguaxe-redux/actions/users';


import {ModalIdentifiers} from 'utils/constants';

import {isModalOpen} from 'selectors/views/modals';

import ChangePasswordModal from './change_password_modal.jsx';

function mapStateToProps(state) {
    const modalId = ModalIdentifiers.CHANGE_PASSWORD;
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
            changePassword,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangePasswordModal);
