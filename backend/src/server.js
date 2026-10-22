/**
 * Server Entry Point
 * Author: Monika PM (@Monikapm19)
 */
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`EduTrack Backend Server running on port ${PORT}`);
  console.log(`Auth endpoint: http://localhost:${PORT}/api/v1/auth/login`);
});
