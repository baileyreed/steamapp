import passport from 'passport';
import {Strategy as SteamStrategy} from 'passport-steam';

export function setup(User, config) {
  passport.use(new SteamStrategy({
      returnURL: 'http://localhost:9000/auth/steam/callback',
      realm: 'http://localhost:9000/',
      apiKey: 'your steam API key'
  },
  function(identifier, profile, done) {
    console.log("STEAM PROFILE", profile, identifier);
    User.findOne({'steam.id': profile.id}).exec()
      .then(user => {
        if (user) {
          return done(null, user);
        }

        user = new User({
          name: profile.displayName,
          email: profile.emails[0].value,
          role: 'user',
          username: profile.emails[0].value.split('@')[0],
          provider: 'steam',
          steam: profile
        });
        user.save()
          .then(user => done(null, user))
          .catch(err => done(err));
      })
      .catch(err => done(err));
  }));
}
