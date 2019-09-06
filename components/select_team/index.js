// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

import {getTeams} from 'panguaxe-redux/actions/teams';
import {loadRolesIfNeeded} from 'panguaxe-redux/actions/roles';
import {getConfig} from 'panguaxe-redux/selectors/entities/general';
import {Permissions} from 'panguaxe-redux/constants';
import {haveISystemPermission} from 'panguaxe-redux/selectors/entities/roles';
import {getSortedListableTeams, getTeamMemberships} from 'panguaxe-redux/selectors/entities/teams';
import {getCurrentUser} from 'panguaxe-redux/selectors/entities/users';

import {addUserToTeam} from 'actions/team_actions';
import {isGuest} from 'utils/utils';

import SelectTeam from './select_team.jsx';

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
            loadRolesIfNeeded,
            addUserToTeam,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(SelectTeam));
