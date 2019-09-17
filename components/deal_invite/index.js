// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

import {getTeam, getTeams, getTeamsByUserId} from 'panguaxe-redux/actions/teams';
import {getTeamsWithInviteByTelPhone, updateInviteReply} from 'panguaxe-redux/actions/invites';
import {
    getAllPCodeList,
    getAllTCodeList,
    getCodeListByPCode,
    getIndustriesByNameLike
} from 'panguaxe-redux/actions/industries';
import {saveFillInTheMessage} from 'panguaxe-redux/actions/enterprises';
import {loadRolesIfNeeded} from 'panguaxe-redux/actions/roles';
import {getConfig} from 'panguaxe-redux/selectors/entities/general';
import {Permissions} from 'panguaxe-redux/constants';
import {haveISystemPermission} from 'panguaxe-redux/selectors/entities/roles';
import {getSortedListableTeams, getTeamMemberships} from 'panguaxe-redux/selectors/entities/teams';
import {getCurrentUser} from 'panguaxe-redux/selectors/entities/users';
import {setGlobalItem} from 'actions/storage';
import {uploadFile} from 'actions/file_actions.jsx';

import {addUserToTeam} from 'actions/team_actions';
import {isGuest} from 'utils/utils';

import DealInvite from './deal_invite.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const currentUser = getCurrentUser(state);
    const myTeamMemberships = Object.values(getTeamMemberships(state));

    return {
        currentUserId: currentUser.id,
        currentUserRoles: currentUser.roles || '',
        currentUserIsGuest: isGuest(currentUser),
        customDescriptionText: config.CustomDescriptionText,
        isMemberOfTeam: myTeamMemberships && myTeamMemberships.length > 0,
        listableTeams: getSortedListableTeams(state, currentUser.locale),
        siteName: config.SiteName,
        canCreateTeams: haveISystemPermission(state, {permission: Permissions.CREATE_TEAM}),
        canManageSystem: haveISystemPermission(state, {permission: Permissions.MANAGE_SYSTEM}),
        canJoinPublicTeams: haveISystemPermission(state, {permission: Permissions.JOIN_PUBLIC_TEAMS}),
        canJoinPrivateTeams: haveISystemPermission(state, {permission: Permissions.JOIN_PRIVATE_TEAMS}),
        siteURL: config.SiteURL,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            getTeams,
            getTeam,
            loadRolesIfNeeded,
            addUserToTeam,
            getTeamsWithInviteByTelPhone,
            updateInviteReply,
            getCodeListByPCode,
            getAllPCodeList,
            getIndustriesByNameLike,
            getAllTCodeList,
            saveFillInTheMessage,
            setDraft: setGlobalItem,
            uploadFile,
            getTeamsByUserId,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(DealInvite));
