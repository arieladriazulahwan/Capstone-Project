const db = require('./config/db');
db.query('ALTER TABLE student_profiles ADD COLUMN onboarding_completed BOOLEAN DEFAULT FALSE;', (err) => {
  if (err) {
    if (err.code === 'ER_DUP_FIELDNAME') {
      console.log('Column already exists.');
    } else {
      console.log('Error: ' + err.message);
    }
  } else {
    console.log('Success');
  }
  process.exit(0);
});
