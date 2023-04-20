const { gql } = require('apollo-server-express');

// typeDefs set the types that can be used by client
const typeDefs = gql`
    
    input savedBook {
        authors:[String]
        description: String
        title: String
        bookId: String
        image: String
        link: String
    },
    type Query {
        me: User
    },
    
    type User {
        _id: ID!
        username: String
        email: String
        bookCount: Int
        savedBooks: [Book]
    },
    type Book {
        _id: ID!
        bookId: String
        authors: [String]
        description: String
        title: String
        image: String
        link: String
    },
    type Auth {
        token: ID!
        user: User
    },
    type Mutation {
        login(email: String!, password: String!): Auth
        addUser(username: String!, email: String!, password: String!): Auth
        saveBook(input: savedBook): User
        removeBook(bookId: ID!): User
    },
`;

module.exports = typeDefs;