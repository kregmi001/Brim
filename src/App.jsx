// Step 1: Basic Setup - Create a React app layout
import React, { useState, useEffect } from 'react';

const App = () => {
  // Step 2: Set up initial state for users, posts, friends, images
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [comments, setComments] = useState({});
  const [likes, setLikes] = useState({});
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('/__replauthuser');
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
      }
    } catch (error) {
      console.log('User not authenticated');
    } finally {
      setLoading(false);
    }
  };

  // Login function for Replit Auth
  const loginWithReplit = () => {
    window.addEventListener("message", authComplete);
    var h = 500;
    var w = 350;
    var left = window.screen.width / 2 - w / 2;
    var top = window.screen.height / 2 - h / 2;

    var authWindow = window.open(
      "https://replit.com/auth_with_repl_site?domain=" + window.location.host,
      "_blank",
      "modal=yes, toolbar=no, location=no, directories=no, status=no, menubar=no, scrollbars=no, resizable=no, copyhistory=no, width=" +
        w +
        ", height=" +
        h +
        ", top=" +
        top +
        ", left=" +
        left
    );

    function authComplete(e) {
      if (e.data !== "auth_complete") {
        return;
      }

      window.removeEventListener("message", authComplete);
      authWindow.close();
      window.location.reload();
    }
  };

  const logout = () => {
    window.location.href = '/__replauthlogout';
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
        <p style={{ marginBottom: '1rem' }}>Please log in with your Replit account to continue</p>
        <button 
          onClick={loginWithReplit}
          style={{ 
            backgroundColor: '#007bff', 
            color: '#fff', 
            padding: '12px 24px', 
            borderRadius: '6px', 
            border: 'none',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          Log in with Replit
        </button>
      </div>
    );
  }

  // Step 3: Function to handle adding a new post
  const handleAddPost = () => {
    if (newPost.trim() === '' && !selectedImage) return;
    const postId = Date.now().toString();
    const newEntry = {
      id: postId,
      content: newPost,
      image: selectedImage ? URL.createObjectURL(selectedImage) : null,
    };
    setPosts([...posts, newEntry]);
    setNewPost('');
    setSelectedImage(null);
  };

  // Step 4: Function to handle liking a post
  const handleLike = (postId) => {
    setLikes({ ...likes, [postId]: (likes[postId] || 0) + 1 });
  };

  // Step 5: Function to handle adding a comment
  const handleAddComment = (postId, text) => {
    setComments({
      ...comments,
      [postId]: [...(comments[postId] || []), text],
    });
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '600px', margin: 'auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0 }}>Mini Social App</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {user.profileImage && (
            <img 
              src={user.profileImage} 
              alt="Profile" 
              style={{ width: '32px', height: '32px', borderRadius: '50%' }}
            />
          )}
          <span style={{ fontSize: '14px' }}>Welcome, {user.name}!</span>
          <button 
            onClick={logout}
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
            Logout
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