LoadData();
async function LoadData() {
    //async await 
    //HTTP Request GET, GET1, PUT, POST, DELETE
    try {
        let res = await fetch('http://localhost:3000/posts');
        let posts = await res.json();
        let body = document.getElementById('post-body')
        body.innerHTML = "";
        for (const post of posts) {
            body.innerHTML += convertDataToHTML(post);
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
    //Dùng PATCH để chỉ cập nhật trường isDeleted mà không mất dữ liệu khác
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
    }
}