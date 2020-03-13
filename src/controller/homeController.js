import {home,contact,auth} from '../services/index';

let homeController = async (req, res) => {
  // go home page
  if(req.session.user || req.session.passport){
    // đặt lại session thành chuẩn chung thay cho session passport
    if(req.session.passport){
      let userSession = {
        userId: req.session.passport.user.userId
      }
      req.session.user = userSession;
    }

    let userInfo = await auth.inforUser(req.session.user.userId);
    let listReqContactSend = await contact.getListReqContactSend(req.session.user.userId);

    return res.render("main/layout/home",{
      user : userInfo,
      listReqContactSend: listReqContactSend
    });
  }

  // go login page
  res.redirect("/login");
}


module.exports.homeController = homeController;

