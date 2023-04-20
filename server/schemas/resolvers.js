// const { AuthenticationError } = require('apollo-server-express');
// const { User } = require('../models');
// const { signToken } = require('../utils/auth')

// //resolvers create functions, logic for mutations
// const resolvers = {
//     Query: {
//         me: async(parent, args, context) => {
//             if (context.user) {
//                 const userData = await User.findOne({_id: context.user._id})
//                     .select ('-__v -password');
//             return userData;
//             };
//             throw new AuthenticationError('Please login');
//         }
//     },
//     Mutation: {
//         addUser: async(parent, {username, email, password}) => {
//             try {
//                 const user = await User.create({username, email, password});
//                 const token = signToken(user);
                
//                 return {token, user};
//             } catch (err) {
//                 throw new Error ('Failed to add user');
//             }
//         },
//         login: async(parent,{email, password}) => {
//             try {
//             const user = await User.findOne({email});
//             if (!user) {
//                 throw new AuthenticationError('Incorrect email or password');
//             }
//             const passwordCheck = await user.isCorrectPassword(password);
//             if (!passwordCheck) {
//                 throw new AuthenticationError('Incorrect email or password');
//             }
//             const token = signToken(user);
//             return {token, user};
//         } catch (err) {
//             throw new AuthenticationError('Failed to login');
//         }
//     },
//     saveBook: async(parent, {input}, context) => {
//         try {
//             if (context.user) {
//                 const updatedUserData = await User.findByIdAndUpdate({_id: context.user._id}, {$addToSet: {savedBooks: input}}, {new: true, runValidators: true});
                
//                 return updatedUserData;
//             }
//             throw new AuthenticationError('Please log in to save book');
//         } catch (err) {
//             throw new Error ('Failed to save book');
//         }
//     },
//     removeBook: async(parent, {bookId}, context) => {
//         try {
//             if (context.user) {
//                 const  updatedUserData = await User.findOneAndUpdate({_id: context.user._id}, {$pull: {savedBooks: {bookId}}}, {new:true});
                
//                 return updatedUserData;
//             }
//             throw new AuthenticationError('Please log in to remove book');
//         } catch (err) {
//             throw new Error ('Failed to remove book');
//         }
//     }
// }
// };
// module.exports = resolvers;



const { AuthenticationError } = require('apollo-server-express');
const { User, Thought } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    users: async () => {
      return User.find().populate('thoughts');
    },
    user: async (parent, { username }) => {
      return User.findOne({ username }).populate('thoughts');
    },
    thoughts: async (parent, { username }) => {
      const params = username ? { username } : {};
      return Thought.find(params).sort({ createdAt: -1 });
    },
    thought: async (parent, { thoughtId }) => {
      return Thought.findOne({ _id: thoughtId });
    },
  },

  Mutation: {
    addUser: async (parent, { username, email, password }) => {
      // First we create the user
      const user = await User.create({ username, email, password });
      // To reduce friction for the user, we immediately sign a JSON Web Token and log the user in after they are created
      const token = signToken(user);
      // Return an `Auth` object that consists of the signed token and user's information
      return { token, user };
    },
    login: async (parent, { email, password }) => {
      // Look up the user by the provided email address. Since the `email` field is unique, we know that only one person will exist with that email
      const user = await User.findOne({ email });

      // If there is no user with that email address, return an Authentication error stating so
      if (!user) {
        throw new AuthenticationError('No user found with this email address');
      }

      // If there is a user found, execute the `isCorrectPassword` instance method and check if the correct password was provided
      const correctPw = await user.isCorrectPassword(password);

      // If the password is incorrect, return an Authentication error stating so
      if (!correctPw) {
        throw new AuthenticationError('Incorrect credentials');
      }

      // If email and password are correct, sign user into the application with a JWT
      const token = signToken(user);

      // Return an `Auth` object that consists of the signed token and user's information
      return { token, user };
    },
    addThought: async (parent, { thoughtText, thoughtAuthor }) => {
      const thought = await Thought.create({ thoughtText, thoughtAuthor });

      await User.findOneAndUpdate(
        { username: thoughtAuthor },
        { $addToSet: { thoughts: thought._id } }
      );

      return thought;
    },
    addComment: async (parent, { thoughtId, commentText, commentAuthor }) => {
      return Thought.findOneAndUpdate(
        { _id: thoughtId },
        {
          $addToSet: { comments: { commentText, commentAuthor } },
        },
        {
          new: true,
          runValidators: true,
        }
      );
    },
    removeThought: async (parent, { thoughtId }) => {
      return Thought.findOneAndDelete({ _id: thoughtId });
    },
    removeComment: async (parent, { thoughtId, commentId }) => {
      return Thought.findOneAndUpdate(
        { _id: thoughtId },
        { $pull: { comments: { _id: commentId } } },
        { new: true }
      );
    },
  },
};

module.exports = resolvers;