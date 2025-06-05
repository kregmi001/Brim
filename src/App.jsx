
import React, { useState, useEffect } from 'react';
import { initializeApp, getApp } from 'firebase/app';
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

  if (loading) {
    return (
      <div style={{ padding: '1rem', maxWidth: '600px', margin: 'auto', textAlign: 'center' }}>
        <h1>Loading...</h1>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '1rem', maxWidth: '600px', margin: 'auto', textAlign: 'center' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Mini Social App</h1>
        <p style={{ marginBottom: '1rem' }}>Please sign in to continue</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: 'auto' }}>
          <button 
            onClick={signInWithGoogle}
            style={{ 
              backgroundColor: '#db4437', 
              color: '#fff', 
              padding: '12px 24px', 
              borderRadius: '6px', 
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Sign in with Google
          </button>

          <button 
            onClick={signInWithTwitter}
            style={{ 
              backgroundColor: '#1da1f2', 
              color: '#fff', 
              padding: '12px 24px', 
              borderRadius: '6px', 
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Sign in with X (Twitter)
          </button>

          <button 
            onClick={() => setShowEmailForm(!showEmailForm)}
            style={{ 
              backgroundColor: '#28a745', 
              color: '#fff', 
              padding: '12px 24px', 
              borderRadius: '6px', 
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer'
            }}
          >
            Sign in with Email
          </button>
        </div>

        {showEmailForm && (
          <form onSubmit={handleEmailAuth} style={{ marginTop: '20px', maxWidth: '300px', margin: '20px auto' }}>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #ccc' }}
              />
            </div>
            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <input
                  type="checkbox"
                  checked={isSignUp}
                  onChange={(e) => setIsSignUp(e.target.checked)}
                />
                Create new account
              </label>
            </div>
            <button 
              type="submit"
              style={{ 
                backgroundColor: '#007bff', 
                color: '#fff', 
                padding: '10px 20px', 
                borderRadius: '4px', 
                border: 'none',
                cursor: 'pointer',
                width: '100%'
              }}
            >
              {isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Mini Social App</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user.photoURL && (
            <img 
              src={user.photoURL} 
              alt="Profile" 
              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
            />
          )}
          <span style={{ fontSize: '14px' }}>Welcome, {user.displayName || user.email}!</span>
          <button 
            onClick={handleSignOut}
            style={{ 
              backgroundColor: '#dc3545', 
              color: '#fff', 
              padding: '4px 8px', 
              borderRadius: '4px', 
              border: 'none',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>

      <textarea
        style={{ width: '100%', padding: '10px', borderRadius: '5px', border: '1px solid #ccc', marginBottom: '10px' }}
        placeholder="What's on your mind?"
        value={newPost}
        onChange={(e) => setNewPost(e.target.value)}
      />
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setSelectedImage(e.target.files[0])}
        style={{ display: 'block', marginBottom: '10px' }}
      />
      <button onClick={handleAddPost} style={{ backgroundColor: '#007bff', color: '#fff', padding: '8px 16px', borderRadius: '4px', border: 'none' }}>
        Post
      </button>

      {posts.map((post) => (
        <div key={post.id} style={{ border: '1px solid #ccc', padding: '10px', marginTop: '20px', borderRadius: '6px' }}>
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '5px' }}>
            By: {post.author}
          </div>
          <div>
            <p>{post.content}</p>
            {post.image && (
              <img
                src={post.image}
                alt="User upload"
                style={{ marginTop: '10px', maxWidth: '100%', maxHeight: '300px' }}
              />
            )}
            <div style={{ marginTop: '10px' }}>
              <button onClick={() => handleLike(post.id)} style={{ backgroundColor: '#28a745', color: '#fff', padding: '6px 12px', border: 'none', borderRadius: '4px' }}>
                Like ({likes[post.id] || 0})
              </button>
            </div>
            <div style={{ marginTop: '10px' }}>
              <input
                type="text"
                placeholder="Add comment..."
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddComment(post.id, e.target.value);
                    e.target.value = '';
                  }
                }}
                style={{ width: '100%', padding: '5px', border: '1px solid #ccc', borderRadius: '4px' }}
              />
              {(comments[post.id] || []).map((comment, i) => (
                <p key={i} style={{ fontSize: '0.9em', color: 'gray', marginTop: '5px' }}>- {comment}</p>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default App;