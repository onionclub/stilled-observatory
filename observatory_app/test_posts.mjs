import GhostAdminAPI from '@tryghost/admin-api';

const api = new GhostAdminAPI({
  url: 'http://localhost:2368',
  key: '69aa2e0e2deb9b0001a5fde8:9985e93a3583c112d38a3d37eb60d0580b9a0b2efa786e91d8444af30fc4eb63',
  version: 'v5.0'
});

api.posts.browse({limit: 5})
  .then((posts) => {
    console.log(`Found ${posts.length} posts.`);
    posts.forEach(p => console.log(`- ${p.title} (${p.status})`));
  })
  .catch(err => console.error(err));
