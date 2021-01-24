module.exports = (shipit) => {
  require('shipit-deploy')(shipit);

  shipit.initConfig({
    default: {
      deployTo: '/var/apps/congregate-backend',
      repositoryUrl: 'git@github.com:TypingKoala/congregate-backend.git',
      key: '~/.ssh/id_rsa',
      branch: 'main',
    },
    production: {
      servers: 'root@104.236.20.117',
    },
  });

  shipit.blTask('copy-env', async () => {
    await shipit.copyToRemote('.env', '/var/apps/congregate-backend');
  });

  shipit.blTask('npm-install', async () => {
    shipit.remote(`cd ${shipit.releasePath} && npm install`);
  });

  shipit.blTask('build', async () => {
    shipit.remote(`npm run build`);
  });

  shipit.blTask('pm2-server', async () => {
    const env = shipit.environment;
    const processName = 'congregate-backend';

    await shipit.remote(`pm2 delete -s ${appName} || :`);
    await shipit.remote(
      `NODE_ENV=${env} pm2 start lib/index.js --name ${processName}`
    );
  });

  shipit.on('updated', async () => {
    shipit.start('npm-install', 'copy-env', 'build');
  });

  shipit.on('published', async () => {
    shipit.start('pm2-server');
  });
};
