// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {withRouter} from 'react-router-dom';

import {loadProfilesForDirect} from 'panguaxe-redux/actions/users';
import {fetchMyChannelsAndMembers, markChannelAsRead, viewChannel} from 'panguaxe-redux/actions/channels';
import {getMyTeamUnreads, getTeamByName, selectTeam} from 'panguaxe-redux/actions/teams';
import {getTheme} from 'panguaxe-redux/selectors/entities/preferences';
import {getLicense, getConfig} from 'panguaxe-redux/selectors/entities/general';
import {getCurrentUser} from 'panguaxe-redux/selectors/entities/users';
import {getCurrentTeamId, getMyTeams} from 'panguaxe-redux/selectors/entities/teams';
import {getCurrentChannelId} from 'panguaxe-redux/selectors/entities/channels';

import {loadStatusesForChannelAndSidebar} from 'actions/status_actions';
import {setPreviousTeamId} from 'actions/local_storage';
import {addUserToTeam} from 'actions/team_actions';
import {checkIfMFARequired} from 'utils/route';

import NeedsTeam from './needs_team.jsx';

function mapStateToProps(state, ownProps) {
    const license = getLicense(state);
    const config = getConfig(state);
    const currentUser = getCurrentUser(state);

    return {
        theme: getTheme(state),
        mfaRequired: checkIfMFARequired(currentUser, license, config, ownProps.match.url),
        currentUser,
        currentTeamId: getCurrentTeamId(state),
        teamsList: getMyTeams(state),
        currentChannelId: getCurrentChannelId(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            fetchMyChannelsAndMembers,
            getMyTeamUnreads,
            viewChannel,
            markChannelAsRead,
            getTeamByName,
            addUserToTeam,
            setPreviousTeamId,
            selectTeam,
            loadStatusesForChannelAndSidebar,
            loadProfilesForDirect,
        }, dispatch),
    };
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(NeedsTeam));
