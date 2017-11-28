import AppDispatcher from '../Dispatcher/AppDispatcher';
import AppConstants from '../Constants/AppConstants';
import PyroApi from 'API/PyroApi';

const AppActions = {

  addItem(item) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.ADD_ITEM,
      data: item
    });
  },
  initialiseStore() {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.APP_INITIALIZED
    })
  },
  getPatient(item) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.App_GetPatient,
      data: item
    })
  },
  setPatient(item) {
    AppDispatcher.handleViewAction({
      actionType: AppConstants.App_SetPatient,
      data: item
    })
  }
};

export default AppActions;  