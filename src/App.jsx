// Step 1: Basic Setup - Create a React app layout
import React, { useState } from 'react';

const App = () => {
  // Step 2: Set up initial state for users, posts, friends, images
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [comments, setComments] = useState({});
  const [likes, setLikes] = useState({});

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
      <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>Mini Social App</h1>
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