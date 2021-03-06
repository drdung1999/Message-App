const socket = io({reconnection: false});

let loadingModal = $(".loading-modal");

function sendUserIdBySocketToServer() {
  // send user id to server
  let userId = $("#editProfileModal").attr("data-uid");
  socket.emit('userId', {userId : userId });
  
}

function notAcceptMakeFriend(){
  $(".btn-remove-req-contact").on("click", function(){
    let senderReqId = $(this).attr("data-uid");
    let receiverReqId = $("#editProfileModal").attr("data-uid");

    $.ajax({
      url: `/do-not-accept-make-friend-${senderReqId}-${receiverReqId}`,
      type: "put"
    })

    $(this).parents("li").remove();

  });
}

function removeAllNotifications(){
  $("#remove_all_notifications").on("click", function(){
    let targetId = $("#editProfileModal").attr("data-uid");
    
    $.ajax({
      url: `/remove-all-notifications-${targetId}`,
      type: "put",
    });

    // để nó không load thêm thông báo khi ấn nút xóa
    $("#notification-modal .sidebar-body").unbind("scroll");

    // xóa
    $("#notification-modal .sidebar-body ul").empty();
  });
}

function changeDisplayOnMobile(){
  // ẩn slide-bar khi khi ấn vào một chức năng bên trong của nó 
  // VD: ấn vào 1 bạn trong ds bạn bè thì ẩn slide-bar bb đi để cho người dùng xem tin nhắn hoặc nhắn tin
  $(document).on('click', '.layout .content .sidebar-group .sidebar .list-group-item', function () {
      if (jQuery.browser.mobile) {
          $(this).closest('.sidebar-group').removeClass('mobile-open');
      }
  });

  // show list acction
  if(jQuery.browser.mobile){
    $(".users-list-action").show();
  }
}

function autoClickFirstMessage(){
  let firstMess = document.querySelectorAll("#chats .sidebar-body ul li");
  
  setTimeout(function(){
    firstMess[0].click();
  },1);
}

// click vào tin nhắn nào ở phần chat thì thêm cạnh màu xanh ở bên trái vào
function tickMessActive(conversation){
    let messages = document.querySelectorAll("#chats .sidebar-body ul li");
    messages.forEach( message =>{
      message.classList.remove("open-chat");
    });
    
    conversation.addClass("open-chat");
}

// những cái này để xóa hiển thị số những tin nhắn chưa đọc của user khi submit modal chát của user đó 
function removeAmountMessNotRead(){
  $(".layout .content .chat .chat-footer form").on("submit",function(){
    let idModalChatToRemoveMessCount = $("#modal-chat").attr("data-uid");
    removeNewMessCount(idModalChatToRemoveMessCount);
  });

  // sau này làm tính năng hiển thị tùy chọn cho group khác với tùy chọn của user ở đây
}

function tickReadNotif(){
  $("#btn-view-notification").unbind('click').on('click', function(){
    let className = $(this).attr('class');

    // bỏ nền xanh ra khỏi thông báo
    if(className === "active" || className === "active notifiy_badge" || className === ""){
      let listNotif = document.querySelectorAll("#notification-modal .sidebar-body ul li.unread_notification");
      let listNotifUnread = [];
   
      listNotif.forEach(function(notif){
        notif.classList.remove("unread_notification");
        listNotifUnread.push(notif.dataset.uid);
      });

      // tick isRead : true in server 
      $.ajax({
        url: "/list-notification-viewed",
        type: "post",
        data: {listNotifUnread : listNotifUnread}
      })

    }

    // bỏ chấm đỏ khỏi biểu tượng thông báo
    if(className === "active" || className === "notifiy_badge" || className === "" || className === "notifiy_badge active" || className=== "active notifiy_badge"){ 
      $(this).removeClass("notifiy_badge");
    }

  })
}

function removeNotifiAcceptContact(){
  // xóa chấm đỏ thông báo  có người chấp nhận lời mời kết bạn khi click  biểu tượng bạn bè 
  $("#btn-view-list-friends").on("click", function(){
    let className = $(this).attr("class");
    
    if(className === "active" || className === "notifiy_badge" || className === "" || className === "notifiy_badge active" || className=== "active notifiy_badge"){ 
      $(this).removeClass("notifiy_badge");
    }
  });
}

function removeNotifWhenReceivedNewReqContact(){
  // xóa chấm đỏ thông báo  có người chấp nhận lời mời kết bạn khi click  biểu tượng bạn bè 
  $("#btn-view-request-contact-received").on("click", function(){
    let className = $(this).attr("class");
    
    if(className === "active" || className === "notifiy_badge" || className === "" || className === "notifiy_badge active" || className=== "active notifiy_badge"){ 
      $(this).removeClass("notifiy_badge");
    }
  });
}

// khi chấp nhận lời mời kết bạn thì xóa chấm đỏ ở lời mời kết bạn và ở trong thông báo đi 
function removeNotifWhenAcceptContact(){
  $("#list-request-contacts-received .dropdown-menu >a").on("click", function(){
    $("#btn-view-request-contact-received").removeClass("notifiy_badge");

    let targetId = $(this).attr("data-uid");
    let numberOfNotifUnread = $("#notification-modal .sidebar-body ul li.unread_notification");
    let notifId = numberOfNotifUnread.attr("data-senderId");

    if(notifId === targetId && numberOfNotifUnread.length === 1) {
      $("#btn-view-notification").removeClass("notifiy_badge");

      // đánh dấu thông báo đã xem 
      let listNotif = document.querySelectorAll("#notification-modal .sidebar-body ul li.unread_notification");
      let listNotifUnread = [];
   
      listNotif.forEach(function(notif){
        notif.classList.remove("unread_notification");
        listNotifUnread.push(notif.dataset.uid);
      });

      // tick isRead : true in server 
      $.ajax({
        url: "/list-notification-viewed",
        type: "post",
        data: {listNotifUnread : listNotifUnread}
      })
    }
    
  })
}

// hiển chấm đỏ ở biểu tượng tin nhẵn khi server render ra có tin nhắn mới
function handleShowHaveNewMessage(){
  let isThereNewMessage = $("#chats .sidebar-body ul li").find(".new-message-count");
  if(isThereNewMessage.length > 0){
    $("#btn-view-list-chat").addClass("notifiy_badge");
  }
}


$(document).ready(function(){
  loadingModal.hide();

  $("#list-messages").find("li:first").addClass("open-chat");

  sendUserIdBySocketToServer();

  viewInformation();

  removeAllNotifications();

  notAcceptMakeFriend();
 
  changeDisplayOnMobile();

  autoClickFirstMessage();

  removeAmountMessNotRead();

  tickReadNotif();
  
  removeNotifWhenAcceptContact();

  handleShowHaveNewMessage();
  
})