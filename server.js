const { GraphQLServer } = require('graphql-yoga'),
    { apiConfig } = require('./config'),
    { typeDefs, resolvers } = require('./api'),
    cors = require('cors'),
    Token = require('./core/token'),
    colors = require('colors');

const options = {
    port: process.env.PORT || apiConfig.port,
};

const makeContext = (req) => {
    let result = null;
    try {
        const token = Token.validate(req);
        if (!token) result = {};
        else result = { token };
    } catch (warn) {
        console.warn(colors.yellow(`JWT WARNING: `), warn.toString().split(': ')[1]);
    } finally {
        return result;
    }
}

const server = new GraphQLServer({
    typeDefs, resolvers,
    context: req => ({...makeContext(req.request)})
});

server.use(cors());

server.start(options)
    .then(() => {
        console.log(`Server 👌 at ${apiConfig.url}`)
    })
    .catch((error) => {
        console.log(colors.red('SERVER ERROR: '), error);
    })