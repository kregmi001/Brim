import React, { useState, useEffect } from 'react';
import { initializeApp, getApp } from 'firebase/app';
import './App.css';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  TwitterAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged 
} from 'firebase/auth';

// Firebase configuration pulled from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
let app;
try {
  app = initializeApp(firebaseConfig);
} catch (error) {
  // If app is already initialized, get the existing instance
  if (error.code === 'app/duplicate-app') {
    app = getApp();
  } else {
    throw error;
  }
}
const auth = getAuth(app);

// Posts Component
const PostsTab = ({ user }) => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [comments, setComments] = useState({});
  const [likes, setLikes] = useState({});
  const [reactions, setReactions] = useState({});

  const handleAddPost = () => {
    if (newPost.trim() === '' && !selectedImage) return;
    const postId = Date.now().toString();
    const newEntry = {
      id: postId,
      content: newPost,
      image: selectedImage ? URL.createObjectURL(selectedImage) : null,
      author: user.displayName || user.email,
      authorPhoto: user.photoURL,
    };
    setPosts([...posts, newEntry]);
    setNewPost('');
    setSelectedImage(null);
  };

  const handleLike = (postId) => {
    setLikes({ ...likes, [postId]: (likes[postId] || 0) + 1 });
  };

  const handleAddComment = (postId, text) => {
    setComments({
      ...comments,
      [postId]: [...(comments[postId] || []), text],
    });
  };

  const handleReaction = (postId, emoji) => {
    setReactions(prev => ({
      ...prev,
      [postId]: {
        ...prev[postId],
        [emoji]: (prev[postId]?.[emoji] || 0) + 1
      }
    }));
  };

  return (
    <div className="tab-content">
      <div className="post-creator">
        <textarea
          className="post-textarea"
          placeholder="What's on your mind? Share something amazing..."
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setSelectedImage(e.target.files[0])}
          className="file-input"
        />
        <button onClick={handleAddPost} className="post-btn">
          📝 Share Post
        </button>
      </div>

      <div className="posts-container">
        {posts.map((post) => (
          <div key={post.id} className="post">
            <div className="post-author">
              {post.authorPhoto ? (
                <img src={post.authorPhoto} alt="Author" className="post-author-pic" />
              ) : (
                <span className="default-avatar">👤</span>
              )}
              <span className="author-name">{post.author}</span>
            </div>
            <div className="post-content">
              {post.content}
            </div>
            {post.image && (
              <img
                src={post.image}
                alt="User upload"
                className="post-image"
              />
            )}
            <div className="post-actions">
              <button onClick={() => handleLike(post.id)} className="like-btn">
                👍 Like ({likes[post.id] || 0})
              </button>
              <div className="reactions-container">
                <div className="reaction-buttons">
                  {['❤️', '😂', '😮', '😢', '😡', '🔥'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(post.id, emoji)}
                      className="reaction-btn"
                      title={`React with ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                {reactions[post.id] && (
                  <div className="reactions-display">
                    {Object.entries(reactions[post.id]).map(([emoji, count]) => (
                      <span key={emoji} className="reaction-count">
                        {emoji} {count}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="comments-section">
              <input
                type="text"
                placeholder="Add a comment..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.target.value.trim()) {
                    handleAddComment(post.id, e.target.value);
                    e.target.value = '';
                  }
                }}
                className="comment-input"
              />
              {(comments[post.id] || []).map((comment, i) => (
                <div key={i} className="comment">💬 {comment}</div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Profile Creation Component
const ProfileCreation = ({ user, onProfileComplete }) => {
  const [profile, setProfile] = useState({
    name: user.displayName || '',
    age: '',
    bio: '',
    interests: '',
    location: '',
    images: []
  });
  const [currentStep, setCurrentStep] = useState(0);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (profile.images.length + files.length <= 5) {
      const newImages = files.map(file => URL.createObjectURL(file));
      setProfile(prev => ({
        ...prev,
        images: [...prev.images, ...newImages]
      }));
    } else {
      alert('You can only upload up to 5 images');
    }
  };

  const handleSubmit = () => {
    if (profile.name && profile.age && profile.bio) {
      // Here you would typically save to Firebase
      console.log('Profile created:', profile);
      onProfileComplete(profile);
    } else {
      alert('Please fill in all required fields');
    }
  };

  const steps = [
    {
      title: 'Basic Info',
      content: (
        <div className="profile-step">
          <h3>Tell us about yourself</h3>
          <input
            type="text"
            placeholder="Your name"
            value={profile.name}
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            className="form-input"
          />
          <input
            type="number"
            placeholder="Age"
            value={profile.age}
            onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
            className="form-input"
          />
          <textarea
            placeholder="Write a short bio about yourself..."
            value={profile.bio}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            className="form-input"
            rows="4"
          />
        </div>
      )
    },
    {
      title: 'Photos',
      content: (
        <div className="profile-step">
          <h3>Add up to 5 photos</h3>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="file-input"
          />
          <div className="image-preview">
            {profile.images.map((image, index) => (
              <div key={index} className="image-preview-item">
                <img src={image} alt={`Photo ${index + 1}`} />
                <button
                  onClick={() => setProfile(prev => ({
                    ...prev,
                    images: prev.images.filter((_, i) => i !== index)
                  }))}
                  className="remove-image-btn"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      )
    },
    {
      title: 'Details',
      content: (
        <div className="profile-step">
          <h3>Additional details</h3>
          <input
            type="text"
            placeholder="Location"
            value={profile.location}
            onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
            className="form-input"
          />
          <textarea
            placeholder="Interests (e.g., hiking, cooking, music)"
            value={profile.interests}
            onChange={(e) => setProfile(prev => ({ ...prev, interests: e.target.value }))}
            className="form-input"
            rows="3"
          />
        </div>
      )
    }
  ];

  return (
    <div className="profile-creation">
      <div className="profile-creation-header">
        <h2>Create Your Profile</h2>
        <div className="step-indicator">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
      
      <div className="profile-creation-content">
        {steps[currentStep].content}
      </div>

      <div className="profile-creation-actions">
        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(prev => prev - 1)}
            className="btn btn-secondary"
          >
            Previous
          </button>
        )}
        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => setCurrentStep(prev => prev + 1)}
            className="btn btn-primary"
          >
            Next
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            className="btn btn-primary"
          >
            Complete Profile
          </button>
        )}
      </div>
    </div>
  );
};

// Profiles Tab Component
const ProfilesTab = ({ user, userProfile }) => {
  const [profiles, setProfiles] = useState([
    // Mock data - in real app this would come from Firebase
    {
      id: 1,
      name: 'Sarah Johnson',
      age: 25,
      bio: 'Adventure seeker and coffee enthusiast ☕',
      location: 'San Francisco, CA',
      images: ['https://via.placeholder.com/300x400/FF6B6B/white?text=Sarah'],
      interests: 'Hiking, Photography, Travel'
    },
    {
      id: 2,
      name: 'Mike Chen',
      age: 28,
      bio: 'Tech geek by day, musician by night 🎸',
      location: 'New York, NY',
      images: ['https://via.placeholder.com/300x400/4ECDC4/white?text=Mike'],
      interests: 'Coding, Guitar, Basketball'
    }
  ]);

  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

  const handleLike = () => {
    // In real app, this would save to Firebase
    console.log('Liked profile:', profiles[currentProfileIndex]);
    setCurrentProfileIndex(prev => prev + 1);
  };

  const handlePass = () => {
    setCurrentProfileIndex(prev => prev + 1);
  };

  if (currentProfileIndex >= profiles.length) {
    return (
      <div className="profiles-tab">
        <div className="no-more-profiles">
          <h3>No more profiles to show!</h3>
          <p>Check back later for new people.</p>
        </div>
      </div>
    );
  }

  const currentProfile = profiles[currentProfileIndex];

  return (
    <div className="profiles-tab">
      <div className="profile-card">
        <div className="profile-image">
          <img src={currentProfile.images[0]} alt={currentProfile.name} />
        </div>
        <div className="profile-info">
          <h3>{currentProfile.name}, {currentProfile.age}</h3>
          <p className="profile-location">📍 {currentProfile.location}</p>
          <p className="profile-bio">{currentProfile.bio}</p>
          <p className="profile-interests">🎯 {currentProfile.interests}</p>
        </div>
        <div className="profile-actions">
          <button onClick={handlePass} className="pass-btn">
            ✕ Pass
          </button>
          <button onClick={handleLike} className="like-profile-btn">
            ❤️ Like
          </button>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileCreation, setShowProfileCreation] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        // Check if user has a profile
        // In real app, this would check Firebase
        setShowProfileCreation(true);
      }
    });

    return () => unsubscribe();
  }, []);

  // Clear error when user starts typing
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === 'email') {
      setEmail(value);
    } else if (name === 'password') {
      setPassword(value);
    }
    // Clear error text when user starts typing
    if (errorText) {
      setErrorText('');
    }
  };

  // Google Sign In
  const signInWithGoogle = async () => {
    setIsAuthenticating(true);
    setErrorText('');
    
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          setErrorText('Sign-in was cancelled. Please try again.');
          break;
        case 'auth/popup-blocked':
          setErrorText('Pop-up was blocked. Please allow pop-ups for this site.');
          break;
        case 'auth/network-request-failed':
          setErrorText('Network error. Please check your internet connection.');
          break;
        case 'auth/too-many-requests':
          setErrorText('Too many failed attempts. Please try again later.');
          break;
        case 'auth/operation-not-allowed':
          setErrorText('Google sign-in is not enabled. Please contact support.');
          break;
        default:
          setErrorText('Failed to sign in with Google. Please try again.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Twitter Sign In
  const signInWithTwitter = async () => {
    setIsAuthenticating(true);
    setErrorText('');
    
    const provider = new TwitterAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Twitter:', error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          setErrorText('Sign-in was cancelled. Please try again.');
          break;
        case 'auth/popup-blocked':
          setErrorText('Pop-up was blocked. Please allow pop-ups for this site.');
          break;
        case 'auth/network-request-failed':
          setErrorText('Network error. Please check your internet connection.');
          break;
        case 'auth/too-many-requests':
          setErrorText('Too many failed attempts. Please try again later.');
          break;
        case 'auth/operation-not-allowed':
          setErrorText('Twitter sign-in is not enabled. Please contact support.');
          break;
        default:
          setErrorText('Failed to sign in with Twitter. Please try again.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Email/Password Sign In/Up
  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setIsAuthenticating(true);
    setErrorText('');
    
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      setShowEmailForm(false);
      setEmail('');
      setPassword('');
    } catch (error) {
      console.error('Error with email authentication:', error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/user-not-found':
          setErrorText('No account found with this email. Please check your email or create a new account.');
          break;
        case 'auth/wrong-password':
          setErrorText('Incorrect password. Please try again.');
          break;
        case 'auth/invalid-email':
          setErrorText('Please enter a valid email address.');
          break;
        case 'auth/weak-password':
          setErrorText('Password should be at least 6 characters long.');
          break;
        case 'auth/email-already-in-use':
          setErrorText('An account with this email already exists. Please sign in instead.');
          break;
        case 'auth/too-many-requests':
          setErrorText('Too many failed attempts. Please try again later.');
          break;
        case 'auth/network-request-failed':
          setErrorText('Network error. Please check your internet connection.');
          break;
        case 'auth/user-disabled':
          setErrorText('This account has been disabled. Please contact support.');
          break;
        case 'auth/operation-not-allowed':
          setErrorText('Email/password authentication is not enabled. Please contact support.');
          break;
        default:
          setErrorText('Authentication failed. Please try again.');
      }
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      setShowProfileCreation(false);
      setErrorText('');
    } catch (error) {
      console.error('Error signing out:', error);
      setErrorText('Failed to sign out. Please try again.');
    }
  };

  const handleProfileComplete = (profile) => {
    setUserProfile(profile);
    setShowProfileCreation(false);
  };

  if (loading) {
    return (
      <div className="app-container">
        <div className="loading-container">
          <h1 className="loading-text">Loading...</h1>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="app-container">
        <div className="auth-container">
          <h1 className="auth-title">BRIM</h1>
          <p className="auth-subtitle">Connect and share with friends</p>

          {/* Error Display */}
          {errorText && (
            <div className="error-message">
              <span className="error-icon">⚠️</span>
              {errorText}
            </div>
          )}

          <div className="auth-buttons">
            <button 
              onClick={signInWithGoogle} 
              className="auth-button google-btn"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? '🔄 Signing in...' : '🔍 Sign in with Google'}
            </button>

            <button 
              onClick={signInWithTwitter} 
              className="auth-button twitter-btn"
              disabled={isAuthenticating}
            >
              {isAuthenticating ? '🔄 Signing in...' : '🐦 Sign in with X (Twitter)'}
            </button>

            <button 
              onClick={() => setShowEmailForm(!showEmailForm)} 
              className="auth-button email-btn"
              disabled={isAuthenticating}
            >
              ✉️ Sign in with Email
            </button>
          </div>

          {showEmailForm && (
            <form onSubmit={handleEmailAuth} className="email-form">
              <input
                type="email"
                name="email"
                placeholder="Enter your email"
                value={email}
                onChange={handleInputChange}
                required
                className="form-input"
                disabled={isAuthenticating}
              />
              <input
                type="password"
                name="password"
                placeholder="Enter your password"
                value={password}
                onChange={handleInputChange}
                required
                className="form-input"
                disabled={isAuthenticating}
              />
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  checked={isSignUp}
                  onChange={(e) => setIsSignUp(e.target.checked)}
                  id="signup-checkbox"
                  disabled={isAuthenticating}
                />
                <label htmlFor="signup-checkbox">Create new account</label>
              </div>
              <button 
                type="submit" 
                className="submit-btn"
                disabled={isAuthenticating}
              >
                {isAuthenticating 
                  ? (isSignUp ? 'Creating Account...' : 'Signing In...') 
                  : (isSignUp ? 'Create Account' : 'Sign In')
                }
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  if (showProfileCreation) {
    return (
      <div className="app-container">
        <ProfileCreation user={user} onProfileComplete={handleProfileComplete} />
      </div>
    );
  }

  return (
    <div className="app-container">
      <div className="main-container">
        <div className="header">
          <h1 className="app-title">BRIM</h1>
          <div className="user-info">
            {user.photoURL && (
              <img src={user.photoURL} alt="Profile" className="profile-pic" />
            )}
            <span className="welcome-text">Welcome, {user.displayName || user.email}!</span>
            <button onClick={handleSignOut} className="sign-out-btn">
              Sign Out
            </button>
          </div>
        </div>

        <div className="tab-navigation">
          <button
            onClick={() => setActiveTab('posts')}
            className={`tab-btn ${activeTab === 'posts' ? 'active' : ''}`}
          >
            📝 Posts
          </button>
          <button
            onClick={() => setActiveTab('profiles')}
            className={`tab-btn ${activeTab === 'profiles' ? 'active' : ''}`}
          >
            👥 Profiles
          </button>
        </div>

        <div className="tab-content-container">
          {activeTab === 'posts' && <PostsTab user={user} />}
          {activeTab === 'profiles' && <ProfilesTab user={user} userProfile={userProfile} />}
        </div>
      </div>
    </div>
  );
};

export default App;