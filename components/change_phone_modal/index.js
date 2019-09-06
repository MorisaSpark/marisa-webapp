// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getCurrentUserId} from 'panguaxe-redux/selectors/entities/users';
import {getCurrentTeamId} from 'panguaxe-redux/selectors/entities/teams';
import {removeUserFromTeam as leaveTeam} from 'panguaxe-redux/actions/teams';
import {getMe, sendSMS, changePhone} from 'panguaxe-redux/actions/users';

import {toggleSideBarRightMenuAction} from 'actions/global_actions.jsx';
import {ModalIdentifiers} from 'utils/constants';

import {isModalOpen} from 'selectors/views/modals';

import ChangePhoneModal from './change_phone_modal.jsx';

function mapStateToProps(state) {
    const modalId = ModalIdentifiers.CHANGE_PHONE;
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
            leaveTeam,
            toggleSideBarRightMenu: toggleSideBarRightMenuAction,
            getMe,
            sendSMS,
            changePhone,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(ChangePhoneModal);
