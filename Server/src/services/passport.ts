import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

passport.use(
  new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await prisma.user.findUnique({ where: { email } });
      if (!user || !user.password) {
        return done(null, false, { message: "Credenciales inválidas" });
      }
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return done(null, false, { message: "Credenciales inválidas" });
      }
      return done(null, { id: user.id, email: user.email, role: user.role, name: user.name, avatar: user.avatar });
    } catch (error) {
      return done(error);
    }
  })
);

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL || "http://localhost:4000"}/api/auth/google/callback`,
      },
      async (_accessToken, _refreshToken, profile, done) => {
        try {
          const email = profile.emails?.[0]?.value;
          if (!email) return done(new Error("No email found"));

          const user = {
            id: profile.id,
            email,
            name: profile.displayName,
            avatar: profile.photos?.[0]?.value,
          };

          done(null, user);
        } catch (error) {
          done(error);
        }
      }
    )
  );
}

export default passport;
