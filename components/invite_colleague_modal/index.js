// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getCurrentUserId} from 'panguaxe-redux/selectors/entities/users';
import {getCurrentTeamId} from 'panguaxe-redux/selectors/entities/teams';
import {inviteColleagues} from 'panguaxe-redux/actions/invites';
import {ModalIdentifiers} from 'utils/constants';

import {isModalOpen} from 'selectors/views/modals';

import InviteColleagueModal from './invite_colleague_modal.jsx';

function mapStateToProps(state) {
    const modalId = ModalIdentifiers.INVITE_COLLEAGUE;
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
            inviteColleagues,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InviteColleagueModal);
