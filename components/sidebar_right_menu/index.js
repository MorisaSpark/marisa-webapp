// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import {getConfig} from 'panguaxe-redux/selectors/entities/general';
import {getCurrentUserId} from 'panguaxe-redux/selectors/entities/users';
import {getCurrentTeam} from 'panguaxe-redux/selectors/entities/teams';
import {getInt} from 'panguaxe-redux/selectors/entities/preferences';

import {openMenu as openRhsMenu} from 'actions/views/rhs';
import {getIsRhsMenuOpen} from 'selectors/rhs';
import {Preferences, TutorialSteps} from 'utils/constants.jsx';
import {isMobile} from 'utils/utils.jsx';

import SidebarRightMenu from './sidebar_right_menu.jsx';

function mapStateToProps(state) {
    const config = getConfig(state);
    const currentTeam = getCurrentTeam(state);

    const enableTutorial = config.EnableTutorial === 'true';
    const tutorialStep = getInt(state, Preferences.TUTORIAL_STEP, getCurrentUserId(state), TutorialSteps.FINISHED);

    const siteName = config.SiteName;

    return {
        teamDisplayName: currentTeam.display_name,
        isOpen: getIsRhsMenuOpen(state),
        showTutorialTip: enableTutorial && isMobile() && tutorialStep === TutorialSteps.MENU_POPOVER,
        siteName,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators({
            openRhsMenu,
        }, dispatch),
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(SidebarRightMenu);
