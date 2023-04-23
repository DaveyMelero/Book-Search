const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth')

//resolvers create functions, logic for mutations
const resolvers = {
    Query: {
        me: async(parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({_id: context.user._id})
                    .select ('-__v -password');
            return userData;
            };
            throw new AuthenticationError('Please login');
        }
    },
    Mutation: {
        addUser: async(parent, {username, email, password}) => {
            try {
                const user = await User.create({username, email, password});
                const token = signToken(user);
                
                return {token, user};
            } catch (err) {
                throw new Error ('Failed to add user');
            }
        },
        login: async(parent,{email, password}) => {
            try {
            const user = await User.findOne({email});
            if (!user) {
                throw new AuthenticationError('Incorrect email or password');
            }
            const passwordCheck = await user.isCorrectPassword(password);
            if (!passwordCheck) {
                throw new AuthenticationError('Incorrect email or password');
            }
            const token = signToken(user);
            return {token, user};
        } catch (err) {
            throw new AuthenticationError('Failed to login');
        }
    },
    saveBook: async(parent, {input}, context) => {
        try {
            if (context.user) {
                const updatedUserData = await User.findByIdAndUpdate({_id: context.user._id}, {$addToSet: {savedBooks: input}}, {new: true, runValidators: true});
                
                return updatedUserData;
            }
            throw new AuthenticationError('Please log in to save book');
        } catch (err) {
            throw new Error ('Failed to save book');
        }
    },
    removeBook: async(parent, {bookId}, context) => {
        try {
            if (context.user) {
                const  updatedUserData = await User.findOneAndUpdate({_id: context.user._id}, {$pull: {savedBooks: {bookId}}}, {new:true});
                
                return updatedUserData;
            }
            throw new AuthenticationError('Please log in to remove book');
        } catch (err) {
            throw new Error ('Failed to remove book');
        }
    }
}
};
module.exports = resolvers;