// Function to calculate time ago from the given date
function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const mins = Math.floor(seconds / 60);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

document.addEventListener("DOMContentLoaded", () => {
  const saveBtn = document.getElementById("savePostBtn");
  const authorInput = document.getElementById("authorName");
  const postContentDiv = document.getElementById("postContent");
  const postsContainer = document.getElementById("publishedPostsContainer");

  // Fetch and display posts from the backend on page load
  async function fetchPosts() {
    try {
      const response = await fetch("https://blog-backend-wlzo.onrender.com/api/posts"); // Updated backend endpoint
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const posts = await response.json();
      postsContainer.innerHTML = '';  // Clear existing posts

      posts.forEach(post => {
        const postCard = createPostCard(post); // Create HTML for each post
        postsContainer.prepend(postCard);
      });
    } catch (error) {
      console.error("Failed to fetch posts:", error);
      alert("An error occurred while fetching posts. Please try again later.");
    }
  }

  // Create a post card from a post object
  function createPostCard(post) {
    const postCard = document.createElement("div");
    postCard.classList.add("published-post");

    postCard.innerHTML = `
      <h3>${post.author}</h3>
      <div class="post-content">${post.content}</div>
      <h5 class="timestamp">Posted ${timeAgo(post.createdAt)}</h5> <!-- 🕓 Timestamp added -->
      <div class="replies-section">
        <h4>Replies</h4>
        <div class="reply-form">
          <input type="text" placeholder="Your name..." class="replier-name" />
          <textarea placeholder="Write a reply..." class="reply-text"></textarea>
          <button class="reply-btn">Reply</button>
        </div>
        <div class="replies-list">
          ${post.replies.map((reply, index) => `
            <div class="reply">
              <strong>${reply.replier}</strong>
              <p>${reply.replyText}</p>
              <small class="reply-timestamp">${timeAgo(reply.createdAt)}</small>
              <button class="delete-reply-btn" data-post-id="${post._id}" data-reply-index="${index}">Delete Reply</button> <!-- Delete Reply -->
            </div>
          `).join('')}
        </div>
      </div>
      <button class="edit-post-btn" data-post-id="${post._id}">Edit Post</button> <!-- Edit Post -->
      <button class="delete-post-btn" data-post-id="${post._id}">Delete Post</button> <!-- Delete Post -->
    `;

    // Add reply button functionality for each post
    postCard.querySelector(".reply-btn").addEventListener("click", async () => {
      const replierName = postCard.querySelector(".replier-name").value.trim();
      const replyText = postCard.querySelector(".reply-text").value.trim();

      if (!replierName || !replyText) {
        alert("Please enter both name and reply.");
        return;
      }

      try {
        const response = await fetch(`https://blog-backend-wlzo.onrender.com/${post._id}/replies`, {  // Fixed string concatenation
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ replier: replierName, replyText })
        });
        
        if (!response.ok) {
          throw new Error(`Failed to post reply. Status: ${response.status}`);
        }

        const updatedPost = await response.json();
        postCard.querySelector(".replies-list").innerHTML = updatedPost.replies.map((reply, index) => `
          <div class="reply">
            <strong>${reply.replier}</strong>
            <p>${reply.replyText}</p>
            <small class="reply-timestamp">${timeAgo(reply.createdAt)}</small>
            <button class="delete-reply-btn" data-post-id="${post._id}" data-reply-index="${index}">Delete Reply</button>
          </div>
        `).join('');

        // Clear input fields
        postCard.querySelector(".replier-name").value = '';
        postCard.querySelector(".reply-text").value = '';
      } catch (error) {
        console.error("Error posting reply:", error);
        alert("An error occurred while posting your reply. Please try again.");
      }
    });
    // Edit post functionality
     postCard.querySelector(".edit-post-btn").addEventListener("click", async () => {
       const newContent = prompt("Edit your post content:", post.content);
       if (newContent !== null) {
         try {
           const response = await fetch(`https://blog-backend-wlzo.onrender.com/api/posts/${post._id}`, {  // Updated API URL
             method: "PUT",
             headers: { "Content-Type": "application/json" },
             body: JSON.stringify({ content: newContent })
           });
 
           if (!response.ok) {
             throw new Error(`Failed to update post. Status: ${response.status}`);
           }
 
           const updatedPost = await response.json();
           postCard.querySelector(".post-content").innerHTML = updatedPost.content;
         } catch (error) {
           console.error("Error editing post:", error);
           alert("An error occurred while updating the post. Please try again.");
         }
       }
     });
 
     // Delete post functionality
     postCard.querySelector(".delete-post-btn").addEventListener("click", async () => {
       if (confirm("Are you sure you want to delete this post?")) {
         try {
           const response = await fetch(`https://blog-backend-wlzo.onrender.com/api/posts/${post._id}`, {  // Updated API URL
             method: "DELETE"
           });
 
           if (response.ok) {
             postCard.remove(); // Remove post from UI
           } else {
             alert("Failed to delete post.");
           }
         } catch (error) {
           console.error("Error deleting post:", error);
           alert("An error occurred while deleting the post. Please try again.");
         }
       }
     });
    // Delete reply functionality
    postCard.querySelectorAll(".delete-reply-btn").forEach(button => {
      button.addEventListener("click", async (e) => {
        const postId = e.target.dataset.postId;
        const replyIndex = e.target.dataset.replyIndex;

        if (confirm("Are you sure you want to delete this reply?")) {
          try {
            const response = await fetch(`https://blog-backend-wlzo.onrender.com/api/posts/${postId}/replies/${replyIndex}`, {  // Updated API URL
              method: "DELETE"
            });

            if (!response.ok) {
              throw new Error(`Failed to delete reply. Status: ${response.status}`);
            }

            const updatedPost = await response.json();
            postCard.querySelector(".replies-list").innerHTML = updatedPost.replies.map((reply, index) => `
              <div class="reply">
                <strong>${reply.replier}</strong>
                <p>${reply.replyText}</p>
                <small class="reply-timestamp">${timeAgo(reply.createdAt)}</small>
                <button class="delete-reply-btn" data-post-id="${post._id}" data-reply-index="${index}">Delete Reply</button>
              </div>
            `).join('');
          } catch (error) {
            console.error("Error deleting reply:", error);
            alert("An error occurred while deleting the reply. Please try again.");
          }
        }
      });
    });

    return postCard;
  }

  // Save post and send it to the backend
  saveBtn.addEventListener("click", async () => {
    const author = authorInput.value.trim();
    const content = postContentDiv.innerHTML.trim();

    if (!author || !content || content === "<p>Write your research here...</p>") {
      alert("Please enter your name and write your post.");
      return;
    }

    try {
      const response = await fetch("https://blog-backend-wlzo.onrender.com/api/posts", {  // Updated API URL
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ author, content })
      });

      if (!response.ok) {
        throw new Error(`Failed to save the post. Status: ${response.status}`);
      }

      const post = await response.json();
      const postCard = createPostCard(post);  // Create HTML for the new post
      postsContainer.prepend(postCard);  // Add it to the posts container

      // Clear input fields
      authorInput.value = "";
      postContentDiv.innerHTML = `<p>Write your research here...</p>`;
    } catch (error) {
      console.error("Error saving post:", error);
      alert("An error occurred while saving the post. Please try again.");
    }
  });

  // Fetch posts initially
  fetchPosts();
});
