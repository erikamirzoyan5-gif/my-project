import express from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// ✅ Ստեղծեք uploads directory եթե չկա
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('✅ Created uploads directory');
}

// ✅ Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'post-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// Configure multer for avatar uploads
const avatarStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/avatars/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = 'avatar-' + Date.now() + path.extname(file.originalname).toLowerCase();
    cb(null, uniqueSuffix);
  }
});

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const mimetype = filetypes.test(file.mimetype);
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  
  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error('Only image files are allowed (jpeg, jpg, png, gif, webp)'));
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: fileFilter
});

const uploadAvatar = multer({ 
  storage: avatarStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit for avatars
  fileFilter: fileFilter
}).single('avatar');

// ✅ Load environment variables
dotenv.config();

console.log('🚀 Starting Greenwich Server...');
console.log('🔧 Environment Check:');
console.log('PORT:', process.env.PORT || 5000);
console.log('JWT_SECRET:', process.env.JWT_SECRET ? 'Set' : 'Not Set');
console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'Set' : 'Not Set');

// ✅ Ensure JWT secret exists
if (!process.env.JWT_SECRET) {
  console.warn('⚠️  JWT_SECRET not set, using fallback');
  process.env.JWT_SECRET = 'greenwich_fallback_secret_2024_change_in_production';
}

const app = express();

// ✅ Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Create avatars directory if it doesn't exist
const avatarsDir = path.join(__dirname, 'uploads', 'avatars');
if (!fs.existsSync(avatarsDir)) {
  fs.mkdirSync(avatarsDir, { recursive: true });
  console.log('✅ Created avatars directory');
}

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ CORS Configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.options('*', cors());

// ✅ In-memory storage (fallback when MongoDB is not available)
let memoryStorage = {
  users: [],
  posts: [],
  notifications: [],
  postCounter: 1,
  notificationCounter: 1
};

// ✅ MongoDB Connection with better error handling
const connectDB = async () => {
  try {
    if (process.env.MONGODB_URI) {
      console.log('🔗 Connecting to MongoDB...');
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 30000
      });
      console.log('✅ MongoDB connected successfully');
      return true;
    } else {
      console.log('ℹ️  No MONGODB_URI provided, using memory storage');
      return false;
    }
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('💡 Using memory storage instead');
    return false;
  }
};

// ✅ Schemas (for when MongoDB is available)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, default: "" },
  surname: { type: String, default: "" },
  profileImage: { type: String, default: "" },
  organizationName: { type: String, default: "Default Organization" },
  organizationType: { type: [String], default: ["Other"] },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isApproved: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' }
}, { timestamps: true });

const postSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  image: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  comments: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: String,
    createdAt: { type: Date, default: Date.now }
  }],
  deleted: { type: Boolean, default: false }
}, { timestamps: true });

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['like', 'comment', 'follow', 'system'], required: true },
  fromUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
  content: String,
  read: { type: Boolean, default: false },
  readAt: Date
}, { timestamps: true });

const User = mongoose.model('User', userSchema);
const Post = mongoose.model('Post', postSchema);
const Notification = mongoose.model('Notification', notificationSchema);

// ✅ Auth Middleware (works with both DB and memory)
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        error: 'No token provided. Please authenticate.' 
      });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    let user;
    if (mongoose.connection.readyState === 1) {
      // Find in database
      user = await User.findById(decoded.id).select('-password');
    } else {
      // Find in memory
      user = memoryStorage.users.find(u => u.id === decoded.id);
    }
    
    if (!user) {
      return res.status(401).json({ 
        success: false, 
        error: 'User not found. Please authenticate.' 
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, error: 'Invalid token' });
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, error: 'Token expired' });
    }
    
    res.status(401).json({ success: false, error: 'Authentication failed' });
  }
};

// ✅ Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }
  next();
};

// ✅ Create default admin
const createDefaultAdmin = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      const existingAdmin = await User.findOne({ email: 'admin@greenwich.com' });
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('Admin123!', 10);
        
        const admin = new User({
          username: 'admin',
          name: 'System',
          surname: 'Administrator',
          email: 'admin@greenwich.com',
          password: hashedPassword,
          role: 'admin',
          isApproved: 'approved',
          organizationName: 'Greenwich Platform'
        });
        
        await admin.save();
        console.log('✅ Default admin created: admin@greenwich.com / Admin123!');
      }
    } else {
      // Create admin in memory
      const existingAdmin = memoryStorage.users.find(u => u.email === 'admin@greenwich.com');
      if (!existingAdmin) {
        const hashedPassword = await bcrypt.hash('Admin123!', 10);
        
        const admin = {
          id: 'admin-001',
          username: 'admin',
          name: 'System',
          surname: 'Administrator',
          email: 'admin@greenwich.com',
          password: hashedPassword,
          role: 'admin',
          isApproved: 'approved',
          organizationName: 'Greenwich Platform',
          profileImage: '',
          createdAt: new Date()
        };
        
        memoryStorage.users.push(admin);
        console.log('✅ Default admin created in memory: admin@greenwich.com / Admin123!');
      }
    }
  } catch (error) {
    console.error('Error creating admin:', error.message);
  }
};

// ✅ Helper function to create notifications
const createNotification = async (userId, type, fromUserId, postId, content) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const notification = new Notification({
        userId,
        type,
        fromUserId,
        postId,
        content
      });
      await notification.save();
    } else {
      const notification = {
        id: 'notif-' + memoryStorage.notificationCounter++,
        userId,
        type,
        fromUserId,
        postId,
        content,
        read: false,
        createdAt: new Date()
      };
      memoryStorage.notifications.push(notification);
    }
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};

// ✅ Routes

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'memory';
    
    res.json({ 
      success: true, 
      message: 'Greenwich Server is running',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ✅ NOTIFICATIONS ENDPOINT
app.get('/api/notifications', auth, async (req, res) => {
  try {
    let notifications = [];
    let unreadCount = 0;

    if (mongoose.connection.readyState === 1) {
      notifications = await Notification.find({ userId: req.user._id })
        .populate('fromUserId', 'name surname profileImage username')
        .populate('postId')
        .sort({ createdAt: -1 })
        .limit(50);
      
      unreadCount = await Notification.countDocuments({ 
        userId: req.user._id, 
        read: false 
      });
    } else {
      notifications = memoryStorage.notifications
        .filter(notif => notif.userId === req.user.id)
        .map(notif => ({
          ...notif,
          fromUserId: memoryStorage.users.find(u => u.id === notif.fromUserId) || { id: notif.fromUserId }
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 50);
      
      unreadCount = notifications.filter(notif => !notif.read).length;
    }
    
    res.json({ 
      success: true, 
      notifications,
      unreadCount
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({ success: false, error: 'Server error fetching notifications' });
  }
});

// ✅ Mark notification as read
app.put('/api/notifications/:id/read', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      const notification = await Notification.findOneAndUpdate(
        { _id: req.params.id, userId: req.user._id },
        { read: true, readAt: new Date() },
        { new: true }
      );
      
      if (!notification) {
        return res.status(404).json({ success: false, error: 'Notification not found' });
      }
      
      res.json({ success: true, notification });
    } else {
      const notification = memoryStorage.notifications.find(
        n => n.id === req.params.id && n.userId === req.user.id
      );
      
      if (!notification) {
        return res.status(404).json({ success: false, error: 'Notification not found' });
      }
      
      notification.read = true;
      notification.readAt = new Date();
      
      res.json({ success: true, notification });
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({ success: false, error: 'Server error updating notification' });
  }
});

// ✅ Mark all notifications as read
app.put('/api/notifications/read-all', auth, async (req, res) => {
  try {
    if (mongoose.connection.readyState === 1) {
      await Notification.updateMany(
        { userId: req.user._id, read: false },
        { read: true, readAt: new Date() }
      );
    } else {
      memoryStorage.notifications
        .filter(notif => notif.userId === req.user.id && !notif.read)
        .forEach(notif => {
          notif.read = true;
          notif.readAt = new Date();
        });
    }
    
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({ success: false, error: 'Server error updating notifications' });
  }
});

// Register
app.post('/api/register', async (req, res) => {
  try {
    const { username, email, password, organizationName = "Default Organization" } = req.body;
    
    if (!username || !email || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username, email and password are required' 
      });
    }
    
    let existingUser;
    if (mongoose.connection.readyState === 1) {
      existingUser = await User.findOne({ $or: [{ email }, { username }] });
    } else {
      existingUser = memoryStorage.users.find(u => u.email === email || u.username === username);
    }
    
    if (existingUser) {
      return res.status(400).json({ 
        success: false, 
        error: 'User already exists with this email or username' 
      });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    if (mongoose.connection.readyState === 1) {
      const user = new User({
        username,
        email,
        password: hashedPassword,
        organizationName,
        role: 'user',
        isApproved: 'pending'
      });
      
      await user.save();
      
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
      
      res.status(201).json({
        success: true,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          organizationName: user.organizationName,
          role: user.role,
          isApproved: user.isApproved
        },
        token
      });
    } else {
      const user = {
        id: 'user-' + Date.now(),
        username,
        email,
        password: hashedPassword,
        organizationName,
        role: 'user',
        isApproved: 'pending',
        profileImage: '',
        createdAt: new Date()
      };
      
      memoryStorage.users.push(user);
      
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      
      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          organizationName: user.organizationName,
          role: user.role,
          isApproved: user.isApproved
        },
        token
      });
    }
    
  } catch (error) {
    console.error('Registration error:', error);
    
    if (error.code === 11000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Username or email already exists' 
      });
    }
    
    res.status(500).json({ success: false, error: 'Server error during registration' });
  }
});

// Login
app.post('/api/login', async (req, res) => {
  try {
    const { email, username, password } = req.body;
    
    if ((!email && !username) || !password) {
      return res.status(400).json({ 
        success: false, 
        error: 'Email/username and password are required' 
      });
    }
    
    let user;
    if (mongoose.connection.readyState === 1) {
      user = await User.findOne({
        $or: [{ email: email || '' }, { username: username || '' }]
      });
    } else {
      user = memoryStorage.users.find(u => 
        u.email === (email || '') || u.username === (username || '')
      );
    }
    
    if (!user) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ success: false, error: 'Invalid credentials' });
    }
    
    const token = jwt.sign({ id: user._id || user.id }, process.env.JWT_SECRET);
    
    res.json({
      success: true,
      user: {
        id: user._id || user.id,
        username: user.username,
        email: user.email,
        organizationName: user.organizationName,
        role: user.role,
        isApproved: user.isApproved,
        profileImage: user.profileImage || ''
      },
      token
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: 'Server error during login' });
  }
});

// Get user profile
app.get('/api/user/profile', auth, async (req, res) => {
  try {
    res.json({ success: true, user: req.user });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Server error fetching profile' });
  }
});

// ✅ Update user profile
app.put('/api/user/profile', auth, async (req, res) => {
  try {
    const { name, surname, organizationName, organizationType } = req.body;
    
    if (mongoose.connection.readyState === 1) {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { name, surname, organizationName, organizationType },
        { new: true }
      ).select('-password');
      
      res.json({ 
        success: true, 
        user,
        message: 'Profile updated successfully' 
      });
    } else {
      const userIndex = memoryStorage.users.findIndex(u => u.id === req.user.id);
      if (userIndex !== -1) {
        memoryStorage.users[userIndex] = {
          ...memoryStorage.users[userIndex],
          name: name || memoryStorage.users[userIndex].name,
          surname: surname || memoryStorage.users[userIndex].surname,
          organizationName: organizationName || memoryStorage.users[userIndex].organizationName,
          organizationType: organizationType || memoryStorage.users[userIndex].organizationType
        };
        
        const { password, ...userWithoutPassword } = memoryStorage.users[userIndex];
        
        res.json({ 
          success: true, 
          user: userWithoutPassword,
          message: 'Profile updated successfully' 
        });
      } else {
        res.status(404).json({ success: false, error: 'User not found' });
      }
    }
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ success: false, error: 'Server error updating profile' });
  }
});

// ✅ FIXED: Create post with image upload
app.post('/api/posts', auth, upload.single('image'), async (req, res) => {
  try {
    console.log('📮 Creating post for user:', req.user.email || req.user.username);
    console.log('Request body:', req.body);
    console.log('Uploaded file:', req.file);

    const { content } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '';
    
    // Validation
    if (!content?.trim() && !imagePath) {
      return res.status(400).json({ 
        success: false, 
        error: 'Post must have content or image' 
      });
    }

    if (mongoose.connection.readyState === 1) {
      // Save to MongoDB
      const post = new Post({
        userId: req.user._id,
        content: content?.trim() || '',
        image: imagePath || ''
      });
      
      await post.save();
      console.log('✅ Post saved to MongoDB, ID:', post._id);

      // Populate user data
      const populatedPost = await Post.findById(post._id)
        .populate('userId', 'name surname profileImage organizationName username isApproved');
      
      res.status(201).json({ 
        success: true, 
        post: populatedPost,
        message: 'Post created successfully'
      });
    } else {
      // Save to memory storage
      const post = {
        id: 'post-' + memoryStorage.postCounter++,
        userId: req.user.id,
        content: content?.trim() || '',
        image: imagePath || '',
        likes: [],
        comments: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      memoryStorage.posts.push(post);
      console.log('✅ Post saved to memory, ID:', post.id);

      // Add user data to the response
      const postWithUser = {
        ...post,
        userId: memoryStorage.users.find(u => u.id === req.user.id) || req.user
      };
      
      res.status(201).json({ 
        success: true, 
        post: postWithUser,
        message: 'Post created successfully'
      });
    }
  
  } catch (error) {
    console.error('❌ Post creation error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Server error creating post' 
    });
  }
});

// ✅ FIXED: Get feed with better error handling
app.get('/api/feed', auth, async (req, res) => {
  try {
    console.log('📰 Fetching feed for user:', req.user.email || req.user.username);

    let posts = [];

    if (mongoose.connection.readyState === 1) {
      posts = await Post.find({ deleted: { $ne: true } })
        .populate('userId', 'name surname profileImage organizationName username isApproved')
        .sort({ createdAt: -1 })
        .limit(50);
      
      console.log(`✅ Found ${posts.length} posts from database`);
    } else {
      posts = memoryStorage.posts
        .filter(post => !post.deleted)
        .map(post => ({
          ...post,
          userId: memoryStorage.users.find(u => u.id === post.userId) || { 
            id: post.userId,
            name: 'Unknown User',
            profileImage: '',
            organizationName: 'Unknown Organization'
          }
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 50);
      
      console.log(`✅ Found ${posts.length} posts from memory`);
    }
    
    res.json({ 
      success: true, 
      posts,
      count: posts.length 
    });
  } catch (error) {
    console.error('❌ Error fetching feed:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error fetching feed: ' + error.message 
    });
  }
});

// ✅ FIXED: Get user's own posts
app.get('/api/user/posts', auth, async (req, res) => {
  try {
    console.log('📋 Fetching posts for user:', req.user.email || req.user.username);

    let userPosts = [];

    if (mongoose.connection.readyState === 1) {
      userPosts = await Post.find({ 
        userId: req.user._id,
        deleted: { $ne: true }
      })
        .populate('userId', 'name surname profileImage organizationName username')
        .sort({ createdAt: -1 });
      
      console.log(`✅ Found ${userPosts.length} posts for user from database`);
    } else {
      userPosts = memoryStorage.posts
        .filter(post => post.userId === req.user.id && !post.deleted)
        .map(post => ({
          ...post,
          userId: memoryStorage.users.find(u => u.id === post.userId) || req.user
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      console.log(`✅ Found ${userPosts.length} posts for user from memory`);
    }
    
    res.json({ 
      success: true, 
      posts: userPosts,
      count: userPosts.length 
    });
  } catch (error) {
    console.error('❌ Error fetching user posts:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Server error fetching posts' 
    });
  }
});

// ✅ Like/Unlike post
app.put('/api/posts/:id/like', auth, async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id || req.user.id;
    
    if (mongoose.connection.readyState === 1) {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }
      
      const isLiked = post.likes.includes(userId);
      
      if (isLiked) {
        post.likes = post.likes.filter(id => !id.equals(userId));
      } else {
        post.likes.push(userId);
        
        // Create notification if not own post
        if (!post.userId.equals(userId)) {
          await createNotification(
            post.userId,
            'like',
            userId,
            postId,
            `${req.user.name || req.user.username} liked your post`
          );
        }
      }
      
      await post.save();
      await post.populate('userId', 'name surname profileImage organizationName');
      
      res.json({ success: true, post, isLiked: !isLiked });
    } else {
      const post = memoryStorage.posts.find(p => p.id === postId);
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }
      
      const isLiked = post.likes.includes(userId);
      
      if (isLiked) {
        post.likes = post.likes.filter(id => id !== userId);
      } else {
        post.likes.push(userId);
        
        // Create notification if not own post
        if (post.userId !== userId) {
          await createNotification(
            post.userId,
            'like',
            userId,
            postId,
            `${req.user.name || req.user.username} liked your post`
          );
        }
      }
      
      res.json({ success: true, post, isLiked: !isLiked });
    }
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ success: false, error: 'Server error liking post' });
  }
});

// ✅ Add comment to post
app.post('/api/posts/:id/comment', auth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content?.trim()) {
      return res.status(400).json({ success: false, error: 'Comment content is required' });
    }
    
    const postId = req.params.id;
    const userId = req.user._id || req.user.id;
    
    if (mongoose.connection.readyState === 1) {
      const post = await Post.findById(postId);
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }
      
      const comment = {
        userId,
        content: content.trim(),
        createdAt: new Date()
      };
      
      post.comments.push(comment);
      await post.save();
      
      // Create notification if not own post
      if (!post.userId.equals(userId)) {
        await createNotification(
          post.userId,
          'comment',
          userId,
          postId,
          `${req.user.name || req.user.username} commented on your post`
        );
      }
      
      await post.populate('userId', 'name surname profileImage organizationName')
               .populate('comments.userId', 'name surname profileImage');
      
      res.json({ success: true, post });
    } else {
      const post = memoryStorage.posts.find(p => p.id === postId);
      if (!post) {
        return res.status(404).json({ success: false, error: 'Post not found' });
      }
      
      const comment = {
        userId,
        content: content.trim(),
        createdAt: new Date()
      };
      
      post.comments.push(comment);
      
      // Create notification if not own post
      if (post.userId !== userId) {
        await createNotification(
          post.userId,
          'comment',
          userId,
          postId,
          `${req.user.name || req.user.username} commented on your post`
        );
      }
      
      res.json({ success: true, post });
    }
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ success: false, error: 'Server error adding comment' });
  }
});

// ✅ Update user avatar
app.post('/api/users/avatar', auth, (req, res) => {
  uploadAvatar(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ success: false, error: err.message });
      } else if (err) {
        return res.status(400).json({ success: false, error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
      }

      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      
      if (mongoose.connection.readyState === 1) {
        // Update in MongoDB
        const user = await User.findByIdAndUpdate(
          req.user._id,
          { profileImage: avatarPath },
          { new: true }
        ).select('-password');
        
        res.json({ 
          success: true, 
          user,
          avatarUrl: avatarPath,
          message: 'Avatar updated successfully' 
        });
      } else {
        // Update in memory storage
        const userIndex = memoryStorage.users.findIndex(u => u.id === req.user.id);
        if (userIndex !== -1) {
          memoryStorage.users[userIndex].profileImage = avatarPath;
          const { password, ...userWithoutPassword } = memoryStorage.users[userIndex];
          
          res.json({ 
            success: true, 
            user: userWithoutPassword,
            avatarUrl: avatarPath,
            message: 'Avatar updated successfully' 
          });
        } else {
          res.status(404).json({ success: false, error: 'User not found' });
        }
      }
    } catch (error) {
      console.error('Error updating avatar:', error);
      res.status(500).json({ success: false, error: 'Server error updating avatar' });
    }
  });
});

// ✅ ADMIN ROUTES

// Get all users (admin only)
app.get('/api/admin/users', auth, requireAdmin, async (req, res) => {
  try {
    let users = [];

    if (mongoose.connection.readyState === 1) {
      users = await User.find({ role: 'user' })
        .select('username name surname email organizationName organizationType isApproved profileImage createdAt')
        .sort({ createdAt: -1 });
    } else {
      users = memoryStorage.users
        .filter(user => user.role === 'user')
        .map(({ password, ...user }) => user)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({
      success: true,
      users,
      count: users.length
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Server error fetching users' });
  }
});

// Approve user (admin only)
app.put('/api/admin/users/:id/approve', auth, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    if (mongoose.connection.readyState === 1) {
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      user.isApproved = 'approved';
      await user.save();

      res.json({
        success: true,
        message: 'User approved successfully',
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          isApproved: user.isApproved
        }
      });
    } else {
      const user = memoryStorage.users.find(u => u.id === userId);
      if (!user) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      user.isApproved = 'approved';

      res.json({
        success: true,
        message: 'User approved successfully',
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          isApproved: user.isApproved
        }
      });
    }
  } catch (error) {
    console.error('Error approving user:', error);
    res.status(500).json({ success: false, error: 'Server error approving user' });
  }
});

// Get pending approvals (admin only)
app.get('/api/admin/pending-approvals', auth, requireAdmin, async (req, res) => {
  try {
    let pendingUsers = [];

    if (mongoose.connection.readyState === 1) {
      pendingUsers = await User.find({ 
        isApproved: 'pending',
        role: 'user'
      })
      .select('username name surname email organizationName organizationType profileImage createdAt')
      .sort({ createdAt: -1 });
    } else {
      pendingUsers = memoryStorage.users
        .filter(user => user.isApproved === 'pending' && user.role === 'user')
        .map(({ password, ...user }) => user)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.json({
      success: true,
      users: pendingUsers,
      count: pendingUsers.length
    });
  } catch (error) {
    console.error('Error fetching pending approvals:', error);
    res.status(500).json({ success: false, error: 'Server error fetching pending approvals' });
  }
});

// 404 handler
app.use('/api/*', (req, res) => {
  console.log(`❌ API route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ success: false, error: 'API endpoint not found' });
});

// Error handler
app.use((error, req, res, next) => {
  console.error('🔥 Server error:', error);
  res.status(500).json({ 
    success: false, 
    error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
  });
});

// ✅ Startup function
const startServer = async () => {
  try {
    const dbConnected = await connectDB();
    await createDefaultAdmin();
    
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
      console.log(`\n🎉 Greenwich Server successfully started!`);
      console.log(`📍 Port: ${PORT}`);
      console.log(`🌐 Health: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Admin: admin@greenwich.com / Admin123!`);
      console.log(`💾 Database: ${dbConnected ? 'MongoDB Connected' : 'Memory Mode'}`);
      console.log(`📮 Posts: POST /api/posts`);
      console.log(`📰 Feed: GET /api/feed`);
      console.log(`🔔 Notifications: GET /api/notifications`);
      console.log(`❤️  Like: PUT /api/posts/:id/like`);
      console.log(`💬 Comment: POST /api/posts/:id/comment`);
      console.log(`👤 Avatar: POST /api/users/avatar`);
      console.log(`⚙️  Admin: GET /api/admin/users`);
      console.log(`🚀 Ready to accept requests!\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the server
startServer();






