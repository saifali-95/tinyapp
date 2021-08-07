//Finding user in the DataBase using email

const getUserByEmail = function(email, database) {

  for (const id in database) {
    if (database[id]['email'] === email) {
      const user = database[id];
      return user;
    }
  }
  return false;
};

module.exports = {getUserByEmail};
