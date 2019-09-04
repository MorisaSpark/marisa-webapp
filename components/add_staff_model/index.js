// Copyright (c) 2015-present Mattermost, Inc. All Rights Reserved.
// See LICENSE.txt for license information.

import {connect} from 'react-redux';

import {ModalIdentifiers} from 'utils/constants';
import {isModalOpen} from 'selectors/views/modals';

import AddStaffModel from './add_staff_model.jsx';

function mapStateToProps(state) {
    const modalId = ModalIdentifiers.ADD_STAFF;
    return {
        show: isModalOpen(state, modalId),
    };
}

export default connect(mapStateToProps)(AddStaffModel);
