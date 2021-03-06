import addNewContact from './contactSocket/addNewContact';
import {userSocket} from './userSocket/userSocket';
import acceptContact from './contactSocket/acceptContact';
import cancelReqContactSend from './contactSocket/cancelReqContactSend';
import createNewGroup from './groupSocket/createNewGroup';
import sendMessageText from './messageSocket/sendMessageText';
import sendGroupMessageText from './messageSocket/sendGroupMessageText';
import messagePersionalViewed from './messageSocket/messagePersionalViewed';
import showWhoViewedMessGroup from './messageSocket/showWhoViewedMessGroup';
import leaveGroupChat from './groupSocket/leaveGroupChat';
import addMemberToGroupChat from './groupSocket/addMemberToGroupChat';

let initSocket = (io) => {
  addNewContact(io);
  userSocket(io);
  acceptContact(io);
  cancelReqContactSend(io);
  createNewGroup(io);
  sendMessageText(io);
  sendGroupMessageText(io);
  messagePersionalViewed(io);
  showWhoViewedMessGroup(io);
  leaveGroupChat(io);
  addMemberToGroupChat(io);
}

module.exports = initSocket;