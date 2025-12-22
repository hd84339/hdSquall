import {User } from '../models/user.model.js';
import bcrypt, {hash} from 'bcrypt';
import httpStatus from 'http-status';

import crypto from 'crypto';

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(httpStatus.BAD_REQUEST).json({ message: 'Username and password are required' });
  }
    try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(httpStatus.UNAUTHORIZED).json({ message: 'Invalid username or password' });
    }
    if(bcrypt.compareSync(password, user.password)){
        let  token = crypto.randomBytes(16).toString('hex');
        user.token = token;
        await user.save();
        return res.status(httpStatus.OK).json({ token: token });
    }
} catch (error) {
    return res.status(500).json({ success: false, message: error.message, stack: error.stack });
  }
}




const register = async (req, res) => {
  // Registration logic here
  const { name, username, password } = req.body;

  try {
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(httpStatus.FOUND).json({ message: 'Username already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ 
        name: name,
        username: username,
        password: hashedPassword
     });
    await newUser.save();
    return res.status(httpStatus.CREATED).json({ message: 'User registered successfully' });
    
  } catch (error) {
    return res.status(httpStatus.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    
  }
}

export {login, register};