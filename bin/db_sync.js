const auth = require('../core/models/auth'),
    questionnaire = require('../core/models/questionnaire'),
    user = require('../core/models/user');

async function sync () {
    await user.sync();
    await auth.sync();
    await questionnaire.sync();
}

sync()
    .then(() => {
        console.log('All tables synced');
    })
    .catch((error) => {
        console.error('SYNC ERROR', error);
    })
    .finally(() => process.exit(0));