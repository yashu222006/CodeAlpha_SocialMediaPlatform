```javascript
// ===============================
// ConnectHub Social Media App
// CodeAlpha Internship - Task 2
// ===============================

// Get users from browser storage
let users = JSON.parse(localStorage.getItem("users")) || [];

// Get posts from browser storage
let posts = JSON.parse(localStorage.getItem("posts")) || [];

// Current logged-in user
let currentUser = localStorage.getItem("currentUser");

// ===============================
// REGISTER
// ===============================

function register() {

    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();
    let message = document.getElementById("authMessage");

    if (username === "" || password === "") {
        message.innerText = "Please enter username and password.";
        message.style.color = "red";
        return;
    }

    let existingUser = users.find(user => user.username === username);

    if (existingUser) {
        message.innerText = "Username already exists.";
        message.style.color = "red";
        return;
    }

    users.push({
        username: username,
        password: password,
        followers: [],
        following: []
    });

    localStorage.setItem("users", JSON.stringify(users));

    message.innerText = "Registration successful! Now login.";
    message.style.color = "green";

    document.getElementById("username").value = "";
    document.getElementById("password").value = "";
}

// ===============================
// LOGIN
// ===============================

function login() {

    let username = document.getElementById("username").value.trim();
    let password = document.getElementById("password").value.trim();
    let message = document.getElementById("authMessage");

    let user = users.find(
        user => user.username === username &&
                user.password === password
    );

    if (!user) {
        message.innerText = "Invalid username or password.";
        message.style.color = "red";
        return;
    }

    currentUser = username;

    localStorage.setItem("currentUser", currentUser);

    showApp();
}

// ===============================
// SHOW APP
// ===============================

function showApp() {

    document.getElementById("authPage").style.display = "none";
    document.getElementById("appPage").style.display = "block";

    showHome();
}

// ===============================
// LOGOUT
// ===============================

function logout() {

    localStorage.removeItem("currentUser");

    currentUser = null;

    document.getElementById("authPage").style.display = "flex";
    document.getElementById("appPage").style.display = "none";
}

// ===============================
// CREATE POST
// ===============================

function createPost() {

    let postText = document.getElementById("postText").value.trim();

    if (postText === "") {
        alert("Please write something before posting.");
        return;
    }

    let newPost = {
        id: Date.now(),
        username: currentUser,
        content: postText,
        likes: [],
        comments: [],
        time: new Date().toLocaleString()
    };

    posts.unshift(newPost);

    localStorage.setItem("posts", JSON.stringify(posts));

    document.getElementById("postText").value = "";

    displayPosts();
}

// ===============================
// DISPLAY POSTS
// ===============================

function displayPosts() {

    let container = document.getElementById("postsContainer");

    container.innerHTML = "";

    if (posts.length === 0) {

        container.innerHTML = `
            <div class="post">
                <p>No posts yet. Create the first post!</p>
            </div>
        `;

        return;
    }

    posts.forEach(post => {

        let liked = post.likes.includes(currentUser);

        let commentsHTML = "";

        post.comments.forEach(comment => {

            commentsHTML += `
                <div class="comment">
                    <strong>${escapeHTML(comment.username)}</strong>:
                    ${escapeHTML(comment.text)}
                </div>
            `;
        });

        let postHTML = `
            <div class="post">

                <div class="post-header">

                    <div class="avatar">
                        ${post.username.charAt(0).toUpperCase()}
                    </div>

                    <div>
                        <div class="post-user">
                            ${escapeHTML(post.username)}
                        </div>

                        <div class="post-time">
                            ${post.time}
                        </div>
                    </div>

                </div>

                <div class="post-content">
                    ${escapeHTML(post.content)}
                </div>

                <button
                    class="like-btn ${liked ? "liked" : ""}"
                    onclick="likePost(${post.id})">

                    ${liked ? "❤️ Liked" : "🤍 Like"}

                    (${post.likes.length})

                </button>

                ${
                    post.username !== currentUser
                    ?
                    `<button onclick="followUser('${escapeHTML(post.username)}')">
                        ➕ Follow
                    </button>`
                    :
                    ""
                }

                <div class="comment-box">

                    <input
                        type="text"
                        id="comment-${post.id}"
                        placeholder="Write a comment...">

                    <button onclick="addComment(${post.id})">
                        Comment
                    </button>

                </div>

                <div class="comments">
                    ${commentsHTML}
                </div>

            </div>
        `;

        container.innerHTML += postHTML;
    });
}

// ===============================
// LIKE POST
// ===============================

function likePost(postId) {

    let post = posts.find(post => post.id === postId);

    if (!post) return;

    let index = post.likes.indexOf(currentUser);

    if (index === -1) {

        post.likes.push(currentUser);

    } else {

        post.likes.splice(index, 1);

    }

    localStorage.setItem("posts", JSON.stringify(posts));

    displayPosts();
}

// ===============================
// ADD COMMENT
// ===============================

function addComment(postId) {

    let input = document.getElementById("comment-" + postId);

    let text = input.value.trim();

    if (text === "") {
        alert("Please enter a comment.");
        return;
    }

    let post = posts.find(post => post.id === postId);

    if (!post) return;

    post.comments.push({
        username: currentUser,
        text: text
    });

    localStorage.setItem("posts", JSON.stringify(posts));

    input.value = "";

    displayPosts();
}

// ===============================
// FOLLOW USER
// ===============================

function followUser(username) {

    if (username === currentUser) {
        return;
    }

    let current = users.find(
        user => user.username === currentUser
    );

    let target = users.find(
        user => user.username === username
    );

    if (!current || !target) return;

    let followingIndex = current.following.indexOf(username);

    if (followingIndex === -1) {

        current.following.push(username);

        target.followers.push(currentUser);

        alert("You are now following " + username);

    } else {

        current.following.splice(followingIndex, 1);

        let followerIndex = target.followers.indexOf(currentUser);

        if (followerIndex !== -1) {
            target.followers.splice(followerIndex, 1);
        }

        alert("You unfollowed " + username);
    }

    localStorage.setItem("users", JSON.stringify(users));

    displayPosts();
}

// ===============================
// SHOW HOME
// ===============================

function showHome() {

    document.getElementById("homeSection").style.display = "block";

    document.getElementById("profileSection").style.display = "none";

    displayPosts();
}

// ===============================
// SHOW PROFILE
// ===============================

function showProfile() {

    document.getElementById("homeSection").style.display = "none";

    document.getElementById("profileSection").style.display = "block";

    let user = users.find(
        user => user.username === currentUser
    );

    if (!user) return;

    document.getElementById("profileName").innerText =
        "@" + user.username;

    document.getElementById("followersCount").innerText =
        user.followers.length;

    document.getElementById("followingCount").innerText =
        user.following.length;

    let myPosts = posts.filter(
        post => post.username === currentUser
    );

    let container = document.getElementById("myPosts");

    container.innerHTML = "";

    myPosts.forEach(post => {

        container.innerHTML += `
            <div class="post">

                <div class="post-content">
                    ${escapeHTML(post.content)}
                </div>

                <small>
                    ${post.time}
                </small>

                <p>
                    ❤️ ${post.likes.length}
                    &nbsp;&nbsp;
                    💬 ${post.comments.length}
                </p>

            </div>
        `;
    });

    if (myPosts.length === 0) {

        container.innerHTML = `
            <div class="post">
                <p>You haven't created any posts yet.</p>
            </div>
        `;
    }
}

// ===============================
// SECURITY FUNCTION
// ===============================

function escapeHTML(text) {

    let div = document.createElement("div");

    div.innerText = text;

    return div.innerHTML;
}

// ===============================
// AUTO LOGIN
// ===============================

if (currentUser) {

    showApp();

}
```
