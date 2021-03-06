let modalAddFriends = $("#addFriends .list-friends");

function friendModel(userId,userName,avatar,gender){
  return `
    <li class="list-friend-item"">
      <figure class="avatar">
          <img src="image/userImages/${avatar}" class="rounded-circle">
      </figure>
      <div class="users-list-body">
          <h5>${userName}</h5>
          <p>${gender}</p>
      </div>
      <button data-uid="${userId}" type="button" class="btn-add-friend btn btn-primary">Thêm</button>
    </li>`
}

function searchFriends(){
  modalAddFriends.empty();
  let userName = $("#search-friends").val();
  
  $.post("/search-friends",{userName: userName},function(data){
    let countFriends = 0;
    // loại bỏ những người có score = 0, prepend vào modal add friend
    data.forEach(function(friend){
        (member.gender === "Male") ? member.gender = "Nữ" : member.gender = "Nam";

        modalAddFriends.append(friendModel(friend._id, friend.username, friend.avatar, friend.gender));
        countFriends += 1;
    })

    addFriends();
    
  }).fail(function(error){
    modalAddFriends.append(`<li class="list-friend-item">Không có kết quả nào phù hợp</li> `);
  })
}

// gửi lời mời kết bạn làm tiếp ở phần sau
function addFriends(){
  $("#addFriends .btn-add-friend").on("click",function(){
    //console.log($(this).data("uid"));
    let srcAvatar = $(this).parent().find("img").attr("src");
    let targetName = $(this).parent().find("h5").text();
    let targetClass = $(this).parent().find("p").text();
    let targetId = $(this).parent().find("button").attr("data-uid");

    // model data to append
    let newReqContactSend = `
          <li class="list-group-item" data-uid="${targetId}">
              <div>
                  <figure class="avatar">
                      <img src="${srcAvatar}" class="rounded-circle">
                  </figure>
              </div>
              <div class="users-list-body">
                  <h5>${targetName}</h5>
                  <p>${targetClass}</p>
                  <div class="users-list-action action-toggle">
                      <div class="dropdown">
                          <a data-toggle="dropdown" href="#">
                              <i class="ti-more"></i>
                          </a>
                          <div class="dropdown-menu dropdown-menu-right">
                              <a href="#" data-uid="${targetId}" class="dropdown-item btn-cancel-req-contact">Hủy yêu cầu</a>
                              <a href="#" data-uid="${targetId}" data-navigation-target="contact-information" class="dropdown-item active">Xem hồ sơ</a>
                              <a href="#" data-uid="${targetId}" class="dropdown-item">Nhắn tin</a>
                          </div>
                      </div>
                  </div>
              </div>
          </li>`
    
    // them nguoi vừa gửỉ yêu cầu kết bạn vào danh sách lời mời đã gửi 
    $(this).parent().hide();
    $("#list-request-contacts-send .list-group").prepend(newReqContactSend);
    
    $.ajax({
      url: `/send-request-contact-${targetId}`,
      type: 'post',
      success: function(data){
         // send request add friend real time 
        let avatarToEmit = $("#userAvatar").attr("src");
        let userNameToEmit = $("#fullname").attr("placeholder");
        let classToEmit = $("#city").attr("placeholder");
        let senderIdToEmit = $("#editProfileModal").attr("data-uid");

        let dataToEmit = {
          notifId: data._id,
          senderId: senderIdToEmit,
          receiverId : targetId,
          avatar: avatarToEmit,
          username: userNameToEmit,
          class: classToEmit
        }

        socket.emit("sent-request-add-friend", dataToEmit);
      }
    });
    
    cancelReqContactSend();
    viewInformation();
    readMoreReqSend();
  })

  
}

$(document).ready(function(){
  $("#btn-search-friends").on("click",function(){
    searchFriends();
  })

  $("#addFriends").keypress(function(event){
    if(event.which == 13){
      searchFriends();
    }
  })

  // add friends
  addFriends();

  socket.on("receive-request-add-friend",data =>{
    let senderId  = data.senderId;
    let avatar = data.avatar;
    let username = data.username;
    let gender; (data.class === "Male") ? gender = "Nam" : gender = "Nữ";
    let notifId = data.notifId;

    // model data to append
    let newReqContactSend = `
          <li class="list-group-item" data-uid="${senderId}">
              <div>
                  <figure class="avatar">
                      <img src="${avatar}" class="rounded-circle">
                  </figure>
              </div>
              <div class="users-list-body">
                  <h5>${username}</h5>
                  <p>${gender}</p>
                  <div class="users-list-action action-toggle">
                      <div class="dropdown">
                          <a data-toggle="dropdown" href="#">
                              <i class="ti-more"></i>
                          </a>
                          <div class="dropdown-menu dropdown-menu-right">
                              <a href="#" data-uid="${senderId}" class="dropdown-item btn-accept-contact">Chấp nhận</a>
                              <a href="#" data-uid="${senderId}" data-navigation-target="contact-information" class="dropdown-item active">Xem hồ sơ</a>
                              <a href="#" data-uid="${senderId}" class="dropdown-item btn-remove-req-contact">Xóa</a>
                          </div>
                      </div>
                  </div>
              </div>
          </li>`;

    let newNotification = `
    <li class="list-group-item unread_notification" data-uid="${notifId}" data-senderId="${data.senderId}" >
                <div>
                    <figure class="avatar">
                        <img src="${avatar}" class="rounded-circle">
                    </figure>
                </div>
                <div class="users-list-body">
                    <h5 style="line-height: 22px !important; "><strong style="color: #3db16b;">${username}</strong> đã gửi cho bạn một lời mời kết bạn.</h5>
                    <p><i style="padding-right: 10px" class="fa fa-clock-o" aria-hidden="true"></i>Vừa xong </p>
                </div>
            </li> `;

    $("#list-request-contacts-received .list-group").prepend(newReqContactSend);

    $("#notification-modal .sidebar-body ul").prepend(newNotification);
    $("#btn-view-notification").addClass("notifiy_badge");

    $("#btn-view-request-contact-received").addClass("notifiy_badge");

    tickReadNotif();
    viewInformation();
    acceptContact();
    cancelReqContactSend();
    notAcceptMakeFriend();
    readMoreContactReceived();
    removeNotifWhenReceivedNewReqContact();
    removeNotifWhenAcceptContact();
    

  })

});