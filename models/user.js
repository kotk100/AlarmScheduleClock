//TODO replace with bcrypt which is 2.7 times faster
var bcryptjs = require('bcryptjs');

//This object is stored in the session, so keep the object small
function User(id, password) {
    this.id = id;
    this.password = password;
}

//Load user data for entered username
User.prototype.findUser = function (user, callback){
    DBConnectionPool.query('SELECT idUser, Password FROM wakemeup.users WHERE (UserName like ? or Email like ?)', [user.username, user.username], function(err, rows, fields){
        //If no data is returned or an error is produced do not return a user
        if(err || rows.length < 1)
            callback(err, null);
        else
            callback(err, new User(rows[0].idUser, rows[0].Password));
    });
};

//Verify that the entered password is correct
User.prototype.verifyPassword = function (password, callback){
    //Compare the hashed user password from the DB with the entered password
    bcryptjs.compare(password, this.password, function(err, res){
       if(err)
        return callback(err);

        return callback(res);
    });
};

//Create user with specified username, password and email
//This function accepts 3 strings as parameters
User.prototype.createUser = function(username, password, email, callback){
    //Hash the password before writing it into the database
    bcryptjs.hash(password, 10, function(err, hashedPassword){
        if(err)
            return callback(err);

        //Save the user in database
        DBConnectionPool.query('INSERT INTO users (Username, Password, Email) VALUES (?, ?, ?)', [username, hashedPassword, email], function(err, rows, fields){
            //TODO check if a row was modified
            return callback(err);
        });
    });
};

module.exports = User;