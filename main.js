LoadData();
loadComments();

async function LoadData() {
    try {
        let res = await fetch('http://localhost:3000/posts');
        let posts = await res.json();
        
        // Update Post Table
        let body = document.getElementById('post-body');
        body.innerHTML = "";
        
        // Update Post Select in Comment Form
        let postSelect = document.getElementById('comment_post_id_select');
        postSelect.innerHTML = '<option value="">Select a Post</option>';
        
        for (const post of posts) {
            body.innerHTML += convertDataToHTML(post);
            if (!post.isDeleted) {
                postSelect.innerHTML += `<option value="${post.id}">${post.id} - ${post.title}</option>`;
            }
        }
    } catch (error) {
        console.log(error);
    }
}
function convertDataToHTML(post) {
    // Kiểm tra nếu bài viết đã xóa 
    const isDisabled = post.isDeleted ? "disabled" : "";
    const styleBlur = post.isDeleted ? "style='opacity: 0.5; background-color: #f8fafc; font-style: italic;'" : "";

    return `
    <tr ${styleBlur}>
        <td>${post.id}</td>
        <td style="font-weight: 500;">${post.title}</td>
        <td><span style="background: #e0f2fe; color: #0369a1; padding: 2px 8px; border-radius: 12px; font-size: 0.85rem;">${post.views}</span></td>
        <td>
            <button class='btn-delete' 
                   onclick='Delete("${post.id}")' 
                   ${isDisabled}>
                   ${post.isDeleted ? "Deleted" : "Delete"}
            </button>
        </td>
    </tr>`;
}

//THÊM MỚI HOẶC CẬP NHẬT
async function saveData() {
    // Lấy dữ liệu từ input
    let id = document.getElementById("id_txt").value.trim();
    let title = document.getElementById("title_txt").value;
    let view = document.getElementById('views_txt').value; 
    
    let checkUpdate = false;
    // Kiểm tra xem ID có tồn tại để Update hay không
    if(id){
        let resGET = await fetch('http://localhost:3000/posts/' + id);      
        if (resGET.ok ) {
            let data = await resGET.json();
            // Chỉ cho sửa nếu chưa bị xóa (isDeleted = false)
            if(!data.isDeleted){
                checkUpdate = true;
            } 
            else {
                console.log("đã xoá => thêm mới");
            }
        }  
    }


    if (checkUpdate) {
        let resPUT = await fetch('http://localhost:3000/posts/' + id, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                views: view,
                isDeleted: false
            })
        });
        if (resPUT.ok) console.log("Cập nhật thành công id: " + id);
    } else {
        // Lấy danh sách để tìm Max ID
        let res = await fetch('http://localhost:3000/posts');
        let posts = await res.json();
        
        let maxId = 0;
        posts.forEach(post => {
            let currentId = parseInt(post.id);
            if (!isNaN(currentId) && currentId > maxId) {
                maxId = currentId;
            }
        });
        //Tạo ID mới (tăng lên 1 và chuyển thành String)
        let newId = (maxId + 1).toString();
        let resPOST = await fetch('http://localhost:3000/posts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                id: newId,
                title: title,
                views: view,
                isDeleted: false
            })
        });
        if (resPOST.ok) console.log("Thêm mới thành công với ID: " + newId);
    }
    return false;
}
// async function Delete(id) {
//     let res = await fetch('http://localhost:3000/posts/' + id, {
//         method: "delete"
//     });
//     if (res.ok) {
//         console.log("xoa thanh cong");
//         LoadData();
//     }
// }

//xoá mềm không xoá hẳn bằng cách thêm trường isDeleted: true
async function Delete(id) {
    let res = await fetch('http://localhost:3000/posts/' + id, {
        method: "PATCH",
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(
            {
                isDeleted: true
            })
    });
    if (res.ok) {
        console.log("xoa thanh cong");
        LoadData();
        loadComments(); // Refresh comments as they might belong to deleted post
    }
}

// === COMMENT OPERATIONS ===

async function loadComments() {
    try {
        let res = await fetch('http://localhost:3000/comments');
        let comments = await res.json();
        let body = document.getElementById('comment-body');
        body.innerHTML = "";
        for (const comment of comments) {
            body.innerHTML += `
            <tr>
                <td>${comment.id}</td>
                <td>${comment.text}</td>
                <td><span class="badge">${comment.postId || 'N/A'}</span></td>
                <td>
                    <button class="btn-delete" onclick="deleteComment('${comment.id}')">Delete</button>
                    <button class="btn-edit" onclick="editComment('${comment.id}', '${comment.text}', '${comment.postId}')" style="background:#6366f1; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:0.8rem; cursor:pointer;">Edit</button>
                </td>
            </tr>`;
        }
    } catch (error) {
        console.error("Error loading comments:", error);
    }
}

async function saveComment() {
    try {
        let id = document.getElementById("comment_id_txt").value.trim();
        let text = document.getElementById("comment_text_txt").value;
        let postId = document.getElementById('comment_post_id_select').value;

        let res = await fetch('http://localhost:3000/comments');
        let comments = await res.json();
        let maxId = 0;
        comments.forEach(c => {
            let currentId = parseInt(c.id);
            if (!isNaN(currentId) && currentId > maxId) maxId = currentId;
        });

        let isUpdate = false;
        if (id) {
            let resGET = await fetch('http://localhost:3000/comments/' + id);
            if (resGET.ok) isUpdate = true;
        }

        const commentData = {
            text: text,
            postId: postId || null
        };

        if (isUpdate) {
            let resPUT = await fetch('http://localhost:3000/comments/' + id, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...commentData, id: id })
            });
            if (resPUT.ok) console.log("Updated comment: " + id);
        } else {
            let newId = (maxId + 1).toString();
            let resPOST = await fetch('http://localhost:3000/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...commentData, id: newId })
            });
            if (resPOST.ok) console.log("Added comment with ID: " + newId);
        }

        loadComments();
        document.getElementById("comment_id_txt").value = "";
        document.getElementById("comment_text_txt").value = "";
        document.getElementById("comment_post_id_select").value = "";
    } catch (error) {
        console.error("Error saving comment:", error);
    }
    return false;
}

async function deleteComment(id) {
    if (confirm("Are you sure you want to delete this comment?")) {
        try {
            let res = await fetch('http://localhost:3000/comments/' + id, {
                method: "DELETE"
            });
            if (res.ok) {
                console.log("Deleted comment: " + id);
                loadComments();
            }
        } catch (error) {
            console.error("Error deleting comment:", error);
        }
    }
}

function editComment(id, text, postId) {
    document.getElementById("comment_id_txt").value = id;
    document.getElementById("comment_text_txt").value = text;
    document.getElementById("comment_post_id_select").value = postId === 'null' ? "" : postId;
}