import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt'
import { use } from 'react';

// generating jsonwebtoken
 const Token = (id) => {
    return jwt.sign({id}, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
 };
 

//  User Registration 
export const registerUser = async (req, res) => {
    try{
        const {email, password, firstName, lastName, role} = req.body;
        
// checking if the user already exists
        const userExists = await User.findOne({ email });

        if(userExists) {
            return res.status(400).json({message : 'User already exists'});
        }

        const user = await User.create({
            email,
            password,
            firstName: firstName || 'Content',
            lastName: lastName || 'Creator',
            role: role || 'writer'
        });

        if(user) {
          res.status(201).json({
            _id: user._id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role:user.bio,
            token: generateToken(user._id)
          });
        } else {
            res.status(400).json({message: 'Invalid user data'});
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// user authentication

export const authenticateUser = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({email});

        if(user && (await user.comparePassword(password))) {
            res.json({
                _id: user._id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                bio: user.bio,
                token: generateToken(user._id)
            })
        } else {
            res.status(401).json({message: 'invalid email or password'});
        }
    } catch (error) {
        res.status(500).json({message: error.message});
    }
};

// getting the current logged in users information 

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// updating the profile 

export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.firstName = req.body.firstName !== undefined ? req.body.firstName : user.firstName;
      user.lastName = req.body.lastName !== undefined ? req.body.lastName : user.lastName;
      if (req.body.role && req.user.role === 'admin') {
        user.role = req.body.role;
      }
      user.bio = req.body.bio !== undefined ? req.body.bio : user.bio;
      
      if (req.body.password && req.body.currentPassword) {
    
        // Verify current password
        const isMatch = await user.comparePassword(req.body.currentPassword);
        if (!isMatch) {
          return res.status(400).json({ message: 'Current password is incorrect' });
        }
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      res.json({
        _id: updatedUser._id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        bio: updatedUser.bio,
        token: generateToken(updatedUser._id)
      });
    } else {
      res.status(404).json({ message: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
