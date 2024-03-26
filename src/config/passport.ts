import passport from "passport";
import { Strategy, Profile, VerifyCallback } from "passport-google-oauth20";
import User from "../models/users";
// import { config } from "dotenv";

// config();

export default function configurePassport() {
  try {
    const callbackURL =
      process.env.NODE_ENV === "development"
        ? `http://localhost:${process.env.PORT}/oauth2/redirect/google`
        : `${process.env.SERVER_URL}/oauth2/redirect/google`;

    const options = {
      clientID: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      callbackURL,
    };
    passport.use(new Strategy(options, verify));

    // passport.serializeUser((user, done) => done(null, user.id));
    passport.serializeUser((user, done) => done(null, user));

    passport.deserializeUser((id, done) =>
      User.findById(id).then((user) => done(null, user)),
    );

    console.log("passport setup complete");
  } catch (error: any) {
    console.error("Error setting up passport", error.message);
  }

  async function verify(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    // extract info from google profile
    console.log(profile);
    const { sub, name, email } = profile._json;

    // check if user already exists in our db with the given email
    let user = await User.findOne({ email });
    if (!user) {
      // create an account for user with info from google profile
      user = new User({
        email,
        ssoId: sub,
        ssoProvider: "Google",
        fullname: name,
        verifiedEmail: true,
      });
      await user.save();
    }
    return done(null, user);
  }
}
