
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

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: "AIzaSyANv-NM_A5ZXB-FReeMLFveD_dQSnU3iYA",
  authDomain: "brim-7c24b.firebaseapp.com",
  projectId: "brim-7c24b",
  storageBucket: "brim-7c24b.appspot.com",
  messagingSenderId: "93916627211",
  appId: "1:93916627211:web:8179df32b94e20402fa20e"
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

const App = () => {
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [comments, setComments] = useState({});
  const [likes, setLikes] = useState({});
  const [reactions, setReactions] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  // Check authentication state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign In
  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  // Twitter Sign In
  const signInWithTwitter = async () => {
    const provider = new TwitterAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Error signing in with Twitter:', error);
    }
  };

  // Email/Password Sign In/Up
  const handleEmailAuth = async (e) => {
    e.preventDefault();
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
      alert(error.message);
    }
  };

  // Sign Out
  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

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

          <div className="auth-buttons">
            <button onClick={signInWithGoogle} className="auth-button google-btn">
              🔍 Sign in with Google
            </button>

            <button onClick={signInWithTwitter} className="auth-button twitter-btn">
              🐦 Sign in with X (Twitter)
            </button>

            <button onClick={() => setShowEmailForm(!showEmailForm)} className="auth-button email-btn">
              ✉️ Sign in with Email
            </button>
          </div>

          {showEmailForm && (
            <form onSubmit={handleEmailAuth} className="email-form">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="form-input"
              />
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="form-input"
              />
              <div className="checkbox-container">
                <input
                  type="checkbox"
                  checked={isSignUp}
                  onChange={(e) => setIsSignUp(e.target.checked)}
                  id="signup-checkbox"
                />
                <label htmlFor="signup-checkbox">Create new account</label>
              </div>
              <button type="submit" className="submit-btn">
                {isSignUp ? 'Create Account' : 'Sign In'}
              </button>
            </form>
          )}
        </div>
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
    </div>
  );
};

export default App;