const { assert } = require('chai');

const { getUserByEmail } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    const expectedOutput = testUsers.userRandomID;
    // Write your assert statement here
    assert.deepEqual(user, expectedOutput);
  });

  it('should return false for the user not in the database', function() {
    const user = getUserByEmail("abc@example.com", testUsers);
    const expectedOutput = false;
    // Write your assert statement here
    assert.deepEqual(user, expectedOutput);
  });
});