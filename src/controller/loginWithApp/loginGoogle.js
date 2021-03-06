import passport from "passport";
import strategy from "passport-google-oauth";
import UserModel from "../../models/userModel";

const GoogleStrategy = strategy.OAuth2Strategy;

let initPassportGoogle = () =>{
  passport.serializeUser(function(user, done) {
    done(null, user);
  });

  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_ID,
    clientSecret: process.env.GOOGLE_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL
    },
    async function(accessToken, refreshToken, profile, done) {
      let result = await UserModel.findByGoogleId(profile.id);

      if(result === null) {
        let dataToCreateUser = {
          username: profile._json.name,
          local: {
            isActive : true,
            veryfyToken: null
          },
          google: {
            uid: profile.id,
            email: profile._json.email
          }
        }

        let createUser = await UserModel.createNew(dataToCreateUser); 
      }

      result = await UserModel.findByGoogleId(profile.id);
      
      let userSession = {
          userId: result._id
        }
        

      done(null, userSession);
    }
  
  ));
}

module.exports = initPassportGoogle;