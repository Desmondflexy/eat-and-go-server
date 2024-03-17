/* eslint-disable @typescript-eslint/no-explicit-any */
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/users";
import { config } from "dotenv";

config();

export default function passportSetup() {
  try {
    const callbackURL =
      process.env.NODE_ENV === "development"
        ? `http://localhost:${process.env.PORT}/auth/google/redirect`
        : process.env.GOOGLE_REDIRECT_URL;

    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID as string,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
          callbackURL,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          // extract info from google profile
          const { sub, name, email } = profile._json;

          // check if user already exists in our db with the given email
          let user = await User.findOne({ email });
          if (user) {
            return done(null, user);
          }

          // create an account for user with info from google profile
          user = new User({
            email,
            ssoId: sub,
            ssoProvider: "Google",
            fullname: name,
            verifiedEmail: true,
          });
          await user.save();
          return done(null, user);
        },
      ),
    );

    passport.serializeUser((user: any, done) => {
      done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
      User.findById(id).then((user) => {
        done(null, user);
      });
    });

    console.log("passport setup complete");
  } catch (error: any) {
    console.error("Error setting up passport", error.message);
  }
}
