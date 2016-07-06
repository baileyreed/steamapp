import passport from 'passport';
import {Strategy as SteamStrategy} from 'passport-steam';

export function setup(User, config) {
  passport.use(new SteamStrategy({
      returnURL: 'http://localhost:9000/auth/steam/callback',
      realm: 'http://localhost:9000/',
      apiKey: 'D93991D6DF3EA0044F99AFAA9FF9A45B'
  },
  function(identifier, profile, done) {
    User.findOne({'steam.id': profile.id}).exec()
      .then(user => {
        if (user) {
          user.steam = profile;
          return user.save()
            .then(user => done(null, user))
            .catch(err => done(err));
        }

        user = new User({
          name: profile.displayName,
          role: 'user',
          username: profile.displayName,
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
