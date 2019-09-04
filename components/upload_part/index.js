// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

import {getTeams} from 'mattermost-redux/actions/teams';
import {getTeamsWithInviteByTelPhone, updateInviteReply} from 'mattermost-redux/actions/invites';
import {getCodeListByPCode, getAllPCodeList, getIndustriesByNameLike, getAllTCodeList} from 'mattermost-redux/actions/industries';
import {saveFillInTheMessage} from 'mattermost-redux/actions/enterprises';
import {loadRolesIfNeeded} from 'mattermost-redux/actions/roles';
import {getConfig} from 'mattermost-redux/selectors/entities/general';
import {Permissions} from 'mattermost-redux/constants';
import {haveISystemPermission} from 'mattermost-redux/selectors/entities/roles';
import {getSortedListableTeams, getTeamMemberships} from 'mattermost-redux/selectors/entities/teams';
import {getCurrentUser} from 'mattermost-redux/selectors/entities/users';
import {setGlobalItem} from 'actions/storage';

import {addUserToTeam} from 'actions/team_actions';
import {isGuest} from 'utils/utils';

import UploadPart from './upload_part.jsx';

function mapStateToProps(state) {
    return {
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(UploadPart));
