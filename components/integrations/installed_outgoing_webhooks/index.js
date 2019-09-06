// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Actions from 'panguaxe-redux/actions/integrations';
import {getOutgoingHooks} from 'panguaxe-redux/selectors/entities/integrations';
import {getCurrentTeamId} from 'panguaxe-redux/selectors/entities/teams';
import {getAllChannels} from 'panguaxe-redux/selectors/entities/channels';
import {getUsers} from 'panguaxe-redux/selectors/entities/users';
import {haveITeamPermission} from 'panguaxe-redux/selectors/entities/roles';
import {Permissions} from 'panguaxe-redux/constants';
import {getConfig} from 'panguaxe-redux/selectors/entities/general';

import {loadOutgoingHooksAndProfilesForTeam} from 'actions/integration_actions';

import InstalledOutgoingWebhook from './installed_outgoing_webhooks.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const teamId = getCurrentTeamId(state);
    const canManageOthersWebhooks = haveITeamPermission(state, {team: teamId, permission: Permissions.MANAGE_OTHERS_OUTGOING_WEBHOOKS});
    const outgoingHooks = getOutgoingHooks(state);
    const outgoingWebhooks = Object.keys(outgoingHooks).
        map((key) => outgoingHooks[key]).
        filter((outgoingWebhook) => outgoingWebhook.team_id === teamId);
    const enableOutgoingWebhooks = config.EnableOutgoingWebhooks === 'true';

    return {
        outgoingWebhooks,
        channels: getAllChannels(state),
        users: getUsers(state),
        teamId,
        canManageOthersWebhooks,
        enableOutgoingWebhooks,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            loadOutgoingHooksAndProfilesForTeam,
            removeOutgoingHook: Actions.removeOutgoingHook,
            regenOutgoingHookToken: Actions.regenOutgoingHookToken,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(InstalledOutgoingWebhook);
