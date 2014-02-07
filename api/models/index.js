/**
 * Module dependencies
 */

var Sequelize = require('sequelize');

/**
 * Locals for db and env
 */

var user, password,
    database, sequelize,
    env = process.env.NODE_ENV || 'development';

/**
 * Base options for sequelize
 */

var options = {
  define: {
    charset: 'utf8',
    timestamps: true,
    underscored: true
  }
};

/**
 * Load sequelize and models
 */

if(env == 'production') {
  user = process.env.DB_USER;
  password = process.env.DB_PASSWORD;
  database = 'tickets_production';

  options.dialect = 'postgres';
  options.host = process.env.DB_HOST || 'localhost';
} else {
  user = 'root';
  password = '';
  database = 'tickets_development';

  options.dialect = 'sqlite';
  options.storage = '/tmp/database.sqlite';
}

sequelize = new Sequelize(database, user, password, options);

/**
 * Export our models
 */

var models = module.exports = {
  Tag: sequelize.import(__dirname + '/tag'),
  User: sequelize.import(__dirname + '/user'),
  Ticket: sequelize.import(__dirname + '/ticket'),
  Comment: sequelize.import(__dirname + '/comment'),
  Project: sequelize.import(__dirname + '/project'),
  Setting: sequelize.import(__dirname + '/setting'),
  Notification: sequelize.import(__dirname + '/notification')
};

/**
 * Define associations
 */

models.Tag
  .hasOne(models.User)
  .hasMany(models.Ticket);

models.User
  .hasMany(models.Tag)
  .hasMany(models.Ticket)
  .hasMany(models.Setting)
  .hasMany(models.Notification)
  .hasMany(models.Ticket, { as: 'Watching' });

models.Ticket
  .hasMany(models.Comment)
  .hasMany(models.Project)
  .hasOne(models.User, { as: 'Author' })
  .hasMany(models.User, { as: 'Watcher' });

models.Comment
  .hasOne(models.Ticket)
  .hasOne(models.User, { as: 'Author' });

models.Project
  .hasOne(models.User)
  .hasMany(models.Ticket);

models.Setting
  .hasMany(models.User);

models.Notification
  .hasMany(models.User);