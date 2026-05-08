import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    default: 'System'
  },
  lastName: {
    type: String,
    default: 'Administrator'
  },
  bio: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin', 'writer'],
    default: 'writer'
  }
}, { timestamps: true });

// hashing the password
userSchema.pre('save', async () => {
    if (!this.isModified('password')) return;

    // adding random strings before hashing
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('user', userSchema);
export default User;
