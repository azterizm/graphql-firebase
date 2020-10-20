const functions = require('firebase-functions');
const express = require('express');
const admin = require('firebase-admin');
const { gql, ApolloServer } = require('apollo-server-express');

const app = express();
admin.initializeApp();

const typeDefs = gql`
  type Query {
    names: [Name]
  }

  type Mutation {
    addName(name: String!): Name
  }

  type Name {
    name: String!
  }
`;

const resolvers = {
  Query: {
    names: async () => {
      const data = await admin.firestore().collection('names').get();
      return data.docs.map((doc) => doc.data());
    },
  },
  Mutation: {
    addName: async (_, { name }) => {
      await admin.firestore().collection('names').add({ name });
      return { name };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.applyMiddleware({ app, path: '/', cors: true });

exports.api = functions.https.onRequest(app);
