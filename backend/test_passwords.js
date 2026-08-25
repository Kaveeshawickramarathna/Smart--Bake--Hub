const mysql = require('mysql2');

const passwords = ['', 'root', 'password', '1234', '123456', 'admin'];
let success = false;

async function testPassword(pwd) {
  return new Promise((resolve) => {
    const connection = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: pwd,
      port: 3306
    });

    connection.connect((err) => {
      if (!err) {
        success = true;
        console.log('SUCCESS with password:', pwd);
        connection.destroy();
        resolve(true);
      } else {
        connection.destroy();
        resolve(false);
      }
    });
  });
}

async function run() {
  for (const pwd of passwords) {
    await testPassword(pwd);
    if (success) break;
  }
  if (!success) {
    console.log('None of the common passwords worked.');
  }
  process.exit(0);
}

run();
