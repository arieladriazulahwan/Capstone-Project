const db = require('./config/db');
db.query('SELECT user_id, onboarding_completed FROM student_profiles LIMIT 5;', (err, results) => {
  if (err) console.log(err);
  else console.log(results);
  process.exit(0);
});
