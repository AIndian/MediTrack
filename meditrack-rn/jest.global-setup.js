// Run tests in Eastern time so local-vs-UTC bugs actually show up
module.exports = async () => {
  process.env.TZ = 'America/New_York';
};
