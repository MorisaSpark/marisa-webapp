// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

import {getTeams} from 'panguaxe-redux/actions/teams';
import {getTeamsWithInviteByTelPhone, updateInviteReply} from 'panguaxe-redux/actions/invites';
import {getCodeListByPCode, getAllPCodeList, getIndustriesByNameLike, getAllTCodeList} from 'panguaxe-redux/actions/industries';
import {saveFillInTheMessage} from 'panguaxe-redux/actions/enterprises';
import {loadRolesIfNeeded} from 'panguaxe-redux/actions/roles';
import {getConfig} from 'panguaxe-redux/selectors/entities/general';
import {Permissions} from 'panguaxe-redux/constants';
import {haveISystemPermission} from 'panguaxe-redux/selectors/entities/roles';
import {getSortedListableTeams, getTeamMemberships} from 'panguaxe-redux/selectors/entities/teams';
import {getCurrentUser} from 'panguaxe-redux/selectors/entities/users';
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
