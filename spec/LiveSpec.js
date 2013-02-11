/* You'll need to have MySQL running and your Node server running
 * for these tests to pass. */

var mysql = require('mysql');
var request = require("request");
var $ = require('jquery');

describe("Persistent Node Chat Server", function() {
  var dbConnection;
  beforeEach(function() {
    dbConnection = mysql.createConnection({
      host: 'localhost',
      user: "bacon",
      password: "pass",
      database: "chat_db"
    });

    dbConnection.connect();

    /* Empty the db table before each test so that multiple tests
     * (or repeated runs of the tests) won't screw each other up: */
    var tablename = "messages";
    dbConnection.query("DELETE FROM " + tablename);
  });

  afterEach(function() {
    dbConnection.end();
  });
             
  it("Should insert posted messages to the DB", function(done) {
    // Post a message to the node chat server:
    var formHold = JSON.stringify({user_name: "Valjean",
          text: "In mercy's name, three days is all I need.",
          room_name: 'cool kids club'
         });
    $.ajax({url: "http://127.0.0.1:9000/1/classes/messages",
            type: 'POST',
            data: formHold,
            success: function(error, response) {
              var queryString = "select * from messages";
              dbConnection.query( queryString,
                function(err, results, fields) {
                  console.log(results);
                  expect(results.length).toEqual(1);
                  expect(results[0].user_name).toEqual("Valjean");
                  expect(results[0].text).toEqual("In mercy's name, three days is all I need.");

                  done();
              });
            }
    });
  });

  xit("Should output all messages from the DB", function(done) {
    var queryString = "";
    var queryArgs = ["Javert", "Men like you can never change!"];

    dbConnection.query( queryString, queryArgs,
      function(err, results, fields) {
        /* Now query the Node chat server and see if it returns
         * the message we just inserted: */
        request("http://127.0.0.1:9000/1/classes/messages",
          function(error, response, body) {
            var messageLog = JSON.parse(body);
            expect(messageLog[0].user_name).toEqual("Javert");
            expect(messageLog[0].text).toEqual("Men like you can never change!");
            done();
          });
      });
  });  
});
