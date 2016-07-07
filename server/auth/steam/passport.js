import passport from 'passport';
import {Strategy as SteamStrategy} from 'passport-steam';

export function setup(User, config) {
  passport.use(new SteamStrategy({
      returnURL: config.steam.callbackURL,
      realm: config.steam.realm,
      apiKey: config.steam.apiKey
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
          steam: profile,
          steamId: profile.id
        });
        user.save()
          .then(user => done(null, user))
          .catch(err => done(err));
      })
      .catch(err => done(err));
  }));
}
