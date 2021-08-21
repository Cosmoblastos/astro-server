const { GraphQLServer } = require('graphql-yoga'),
    { apiConfig } = require('./config'),
    { typeDefs, resolvers } = require('./api');

const options = {
    port: process.env.PORT || apiConfig.port,
};
const server = new GraphQLServer({ typeDefs, resolvers });
server
    .start(options)
    .then(() => {
        console.log(`Server ready 👌 at ${apiConfig.url}`)
    })
    .catch((error) => {
        console.log('SERVER ERROR:', error);
    })