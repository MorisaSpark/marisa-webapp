// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {bindActionCreators} from 'redux';
import {connect} from 'react-redux';
import {deleteChannel} from 'panguaxe-redux/actions/channels';
import {getCurrentTeam} from 'panguaxe-redux/selectors/entities/teams';
import {getConfig} from 'panguaxe-redux/selectors/entities/general';

import DeleteChannelModal from './delete_channel_modal.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);

    return {
        canViewArchivedChannels: config.ExperimentalViewArchivedChannels === 'true',
        currentTeamDetails: getCurrentTeam(state),
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            deleteChannel,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(DeleteChannelModal);
