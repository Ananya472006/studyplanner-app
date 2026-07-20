const packager = require('electron-packager');

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});

async function bundle() {
  try {
    console.log('Starting electron-packager build...');
    const appPaths = await packager({
      dir: '.',
      name: 'StudyQuest',
      platform: 'win32',
      arch: 'x64',
      out: 'dist/StudyQuestApp',
      overwrite: true,
      asar: false
    });
    console.log('Build completed successfully!');
    console.log('App paths created:', appPaths);
  } catch (err) {
    console.error('Build failed with error in catch block:', err);
  }
}

bundle();
