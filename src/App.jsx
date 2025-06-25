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

  const handleRemoveImage = (index) => {
    setProfile(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = () => {
    if (profile.name && profile.age && profile.bio && profile.images.length > 0) {
      onProfileComplete(profile);
    } else {
      alert('Please fill in all required fields and upload at least one image');
    }
  };

  const steps = [
    {
      title: 'Basic Information',
      fields: (
        <div>
          <input
            type="text"
            placeholder="Your name"
            value={profile.name}
            onChange={(e) => setProfile(prev => ({ ...prev, name: e.target.value }))}
            className="form-input"
          />
          <input
            type="number"
            placeholder="Your age"
            value={profile.age}
            onChange={(e) => setProfile(prev => ({ ...prev, age: e.target.value }))}
            className="form-input"
          />
          <input
            type="text"
            placeholder="Your location"
            value={profile.location}
            onChange={(e) => setProfile(prev => ({ ...prev, location: e.target.value }))}
            className="form-input"
          />
        </div>
      )
    },
    {
      title: 'About You',
      fields: (
        <div>
          <textarea
            placeholder="Tell us about yourself..."
            value={profile.bio}
            onChange={(e) => setProfile(prev => ({ ...prev, bio: e.target.value }))}
            className="form-input"
            rows="4"
          />
          <input
            type="text"
            placeholder="Your interests (e.g., hiking, cooking, travel)"
            value={profile.interests}
            onChange={(e) => setProfile(prev => ({ ...prev, interests: e.target.value }))}
            className="form-input"
          />
        </div>
      )
    },
    {
      title: 'Profile Pictures',
      fields: (
        <div>
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
                <img src={image} alt={`Profile ${index + 1}`} />
                <button
                  onClick={() => handleRemoveImage(index)}
                  className="remove-image-btn"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      )
    }
  ];

  return (
    <div className="profile-creation">
      <div className="profile-creation-header">
        <h2>Create Your Profile</h2>
        <p>Let's set up your profile to help you connect with others</p>
      </div>

      <div className="step-indicator">
        {steps.map((_, index) => (
          <div
            key={index}
            className={`step ${index === currentStep ? 'active' : ''} ${
              index < currentStep ? 'completed' : ''
            }`}
          >
            {index + 1}
          </div>
        ))}
      </div>

      <div className="profile-creation-content">
        <div className="profile-step">
          <h3>{steps[currentStep].title}</h3>
          {steps[currentStep].fields}
        </div>
      </div>

      <div className="profile-creation-actions">
        {currentStep > 0 && (
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            className="btn btn-secondary"
          >
            Previous
          </button>
        )}
        {currentStep < steps.length - 1 ? (
          <button
            onClick={() => setCurrentStep(currentStep + 1)}
            className="btn btn-primary"
          >
            Next
          </button>
        ) : (
          <button onClick={handleSubmit} className="btn btn-primary">
            Complete Profile
          </button>
        )}
      </div>
    </div>
  );
};

// User Profile Component - Tinder-like display
const UserProfile = ({ user, userProfile }) => {
  if (!userProfile) {
    return (
      <div className="profile-container">
        <div className="no-profile-message">
          <h3>No Profile Found</h3>
          <p>Please complete your profile setup to view it here.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      <div className="user-profile-card">
        {/* Profile Image Collage - Tinder Style */}
        <div className="profile-image-collage">
          {userProfile.images.length > 0 ? (
            <div className="image-grid">
              {userProfile.images.map((image, index) => (
                <div 
                  key={index} 
                  className={`image-item image-item-${index + 1}`}
                  style={{ backgroundImage: `url(${image})` }}
                >
                  {index === 0 && (
                    <div className="profile-overlay">
                      <div className="profile-info-overlay">
                        <h2>{userProfile.name}, {userProfile.age}</h2>
                        <p className="location">{userProfile.location}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="no-images">
              <span className="default-avatar-large">👤</span>
            </div>
          )}
        </div>

        {/* Profile Information */}
        <div className="profile-details">
          <div className="profile-header">
            <h2>{userProfile.name}, {userProfile.age}</h2>
            <p className="location">📍 {userProfile.location}</p>
          </div>

          <div className="profile-bio">
            <h3>About Me</h3>
            <p>{userProfile.bio}</p>
          </div>

          {userProfile.interests && (
            <div className="profile-interests">
              <h3>Interests</h3>
              <div className="interests-tags">
                {userProfile.interests.split(',').map((interest, index) => (
                  <span key={index} className="interest-tag">
                    {interest.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="profile-actions">
            <button className="edit-profile-btn">
              ✏️ Edit Profile
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Discover People Tab (formerly Profiles Tab)
const DiscoverPeopleTab = ({ user, userProfile }) => {
  const [currentProfileIndex, setCurrentProfileIndex] = useState(0);
  
  // Mock profiles for demonstration
  const mockProfiles = [
    {
      id: 1,
      name: 'Sarah',
      age: 25,
      location: 'San Francisco, CA',
      bio: 'Adventure seeker and coffee enthusiast. Love hiking, photography, and trying new restaurants.',
      interests: 'Hiking, Photography, Coffee, Travel',
      images: [
        'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=400',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400'
      ]
    },
    {
      id: 2,
      name: 'Alex',
      age: 28,
      location: 'New York, NY',
      bio: 'Tech enthusiast and foodie. Always up for trying new cuisines and exploring the city.',
      interests: 'Technology, Food, Travel, Music',
      images: [
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400',
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400',
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400'
      ]
    },
    {
      id: 3,
      name: 'Emma',
      age: 24,
      location: 'Austin, TX',
      bio: 'Artist and nature lover. I paint landscapes and enjoy spending time outdoors.',
      interests: 'Art, Nature, Painting, Yoga',
      images: [
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400'
      ]
    }
  ];

  const currentProfile = mockProfiles[currentProfileIndex];

  const handleLike = () => {
    if (currentProfileIndex < mockProfiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      setCurrentProfileIndex(0); // Reset to first profile
    }
  };

  const handlePass = () => {
    if (currentProfileIndex < mockProfiles.length - 1) {
      setCurrentProfileIndex(currentProfileIndex + 1);
    } else {
      setCurrentProfileIndex(0); // Reset to first profile
    }
  };

  if (mockProfiles.length === 0) {
    return (
      <div className="profiles-tab">
        <div className="no-more-profiles">
          <h3>No More Profiles</h3>
          <p>Check back later for new people to discover!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="profiles-tab">
      <div className="profile-card">
        {/* Profile Image Collage - Tinder Style */}
        <div className="profile-image">
          <div className="image-grid">
            {currentProfile.images.map((image, index) => (
              <div 
                key={index} 
                className={`image-item image-item-${index + 1}`}
                style={{ backgroundImage: `url(${image})` }}
              >
                {index === 0 && (
                  <div className="profile-overlay">
                    <div className="profile-info-overlay">
                      <h2>{currentProfile.name}, {currentProfile.age}</h2>
                      <p className="location">📍 {currentProfile.location}</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="profile-info">
          <h3>{currentProfile.name}, {currentProfile.age}</h3>
          <p className="profile-location">📍 {currentProfile.location}</p>
          <div className="profile-bio">
            <p>{currentProfile.bio}</p>
          </div>
          <div className="profile-interests">
            <p><strong>Interests:</strong> {currentProfile.interests}</p>
          </div>
        </div>

        <div className="profile-actions">
          <button onClick={handlePass} className="pass-btn">
            ❌ Pass
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
      console.log('Attempting Google sign-in...');
      console.log('Firebase config check:', {
        apiKey: firebaseConfig.apiKey ? 'Present' : 'Missing',
        authDomain: firebaseConfig.authDomain ? 'Present' : 'Missing',
        projectId: firebaseConfig.projectId ? 'Present' : 'Missing',
        storageBucket: firebaseConfig.storageBucket ? 'Present' : 'Missing',
        messagingSenderId: firebaseConfig.messagingSenderId ? 'Present' : 'Missing',
        appId: firebaseConfig.appId ? 'Present' : 'Missing'
      });
      
      const result = await signInWithPopup(auth, provider);
      console.log('Google sign-in successful:', result.user.email);
    } catch (error) {
      console.error('Detailed Google sign-in error:', {
        code: error.code,
        message: error.message,
        email: error.email,
        credential: error.credential
      });
      
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
          setErrorText('Google sign-in is not enabled. Please enable it in Firebase Console → Authentication → Sign-in method.');
          break;
        case 'auth/unauthorized-domain':
          setErrorText('This domain is not authorized. Please add localhost to authorized domains in Firebase Console.');
          break;
        case 'auth/invalid-api-key':
          setErrorText('Invalid Firebase API key. Please check your .env file configuration.');
          break;
        default:
          setErrorText(`Failed to sign in with Google: ${error.message}`);
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
      <div className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">🏠</span>
            BRIM
          </div>
          <div className="header-nav">
            <div className="user-menu">
              {user.photoURL && (
                <img src={user.photoURL} alt="Profile" className="user-avatar" />
              )}
              <span className="user-name">{user.displayName || user.email}</span>
              <button onClick={handleSignOut} className="sign-out-btn">
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="tab-navigation">
          <button
            className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
            onClick={() => setActiveTab('posts')}
          >
            Posts
          </button>
          <button
            className={`tab-button ${activeTab === 'profiles' ? 'active' : ''}`}
            onClick={() => setActiveTab('profiles')}
          >
            Discover People
          </button>
          <button
            className={`tab-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            Profile
          </button>
        </div>

        <div className="tab-content-container">
          {activeTab === 'posts' && <PostsTab user={user} />}
          {activeTab === 'profiles' && <DiscoverPeopleTab user={user} userProfile={userProfile} />}
          {activeTab === 'profile' && <UserProfile user={user} userProfile={userProfile} />}
        </div>
      </div>
    </div>
  );
};

export default App;