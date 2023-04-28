const dataCenter = "https://api.buhikayesenin.com";

const getCategoryData = async () => {
    return fetch(`${dataCenter}/getCategories`, {
        credentials: 'include',
    })
        .then(response => response.json())
        .catch(error => {
        console.error(error);
        window.location.href = "https://panel.buhikayesenin.com/";
        });
}

const getContentData = async () => {
    return fetch(`${dataCenter}/getLastContents`, {
        credentials: 'include',
        method: 'GET',
    })
        .then(response => response.json())
        .catch(error => {
        console.error(error);
        window.location.href = "https://panel.buhikayesenin.com";
        });
}

const getFilePreview = async (fileID) => {
    return fetch(`${dataCenter}/getPDF`, {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ fileID: fileID })
    })
        .then(response => response.blob())
        .then(blob => URL.createObjectURL(blob))
        .catch(error => {
        console.error(error);
        window.location.href = "https://panel.buhikayesenin.com";
        });
}

const deleteContent = async (contentID) => {
    return fetch(`${dataCenter}/deleteContent`, {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ contentID: contentID })
    })
        .then(response => response.json())
        .catch(error => {
        console.error(error);
        window.location.href = "https://panel.buhikayesenin.com/";
        });
}

const insertNewCategory = async (categoryName) => {
    return fetch(`${dataCenter}/insertNewCategory`, {
        credentials: 'include',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ categoryName: categoryName })
    })
        .then(response => response.json())
        .catch(error => {
        console.error(error);
        window.location.href = "https://panel.buhikayesenin.com/";
        });
}

const loadData = async () => {
    await getContentData()
    .then(data => {
        if(data['task'] == true){
            data['results'].forEach(element => {
                var d = document.createElement('div');
                d.setAttribute('class', 'content');
                var pn = document.createElement('p');
                pn.setAttribute('class', 'name');
                var pc = document.createElement('p');
                pc.setAttribute('class', 'category');
                var pt = document.createElement('p');
                pt.setAttribute('class', 'time');
                pn.innerText = element['contentHeader'];
                pc.innerText = element['categoryName'];
                pt.innerText = element['creationTime'].replace('T', " ").replace(".000Z", "");
                d.appendChild(pn);
                d.appendChild(pc);
                d.appendChild(pt);
                var k = document.createElement('div');
                k.setAttribute('class', 'buttons');
                k.setAttribute('id', element['id']);
                k.innerHTML = `<button type="button" onclick="preview(this);"><i class="fa-solid fa-eye"></i></button>
                <button type="button" onclick="editContent(this);"><i class="fa-solid fa-pen-to-square"></i></button>
                <button type="button" onclick="deleteContent(this);"><i class="fa-solid fa-trash"></i></button>`

                document.querySelector('.fastcontents').appendChild(d);
            });

        }
        else{
            console.log(data);
        }
    })
    .catch(error => {
        console.error(error);
    });

    await getCategoryData()
    .then(data => {
        if(data['task'] == true){
            data['results'].forEach(element => {
                var a = document.createElement('a');
                a.href = "https://panel.buhikayesenin.com/v1.0/contents?scat=" + element['categoryName'];
                var b = document.createElement('button');
                b.setAttribute('type', 'button');
                b.innerText = element['categoryName'];
                a.appendChild(b);
                document.querySelector('.fastcats').appendChild(a);
            });
        }
        else{
            alert(data['err']['msg']);
        }
    })
    .catch(error => {
        console.error(error);
    });
}

loadData();

document.getElementById('newContent').onclick = () => {
    window.location.href = "https://panel.buhikayesenin.com/v1.0/editor";
}

var closeCategoryButton = document.querySelector('#newCategory > div > #closeCategory');
var addCategoryButton = document.querySelector('#newCategory > div > #addCategory');

document.getElementById('addNewCategory').onclick = () => {
    document.getElementById('newCategory').style.display = 'flex';
}

addCategoryButton.onclick = async () => {
    var categoryName = document.querySelector('#newCategory > div > input');
    if(categoryName.value && categoryName.value.length > 0){
        await insertNewCategory(categoryName.value)
        .then(data => {
            if(data['task'] == true){
                document.getElementById('newCategory').style.display = 'none';
                document.getElementById('inputCatName').value = "";
                window.location.reload();
            }
            else{
                var errorView = document.createElement('p');
                errorView.style.color = 'red';
                errorView.innerText = data['err']['msg'];
                document.querySelector('#newCategory > div').appendChild(errorView);
            }
        })
        .catch(error => {
            console.error(error);
        });
    }
}

closeCategoryButton.onclick = () => {
    document.getElementById('newCategory').style.display = 'none';
    document.getElementById('inputCatName').value = "";
}

function closeContent(){
    document.getElementById('newContent').style.display = 'none';
}

document.getElementById('searchSide').addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        window.location.href = "https://panel.buhikayesenin.com/v1.0/contents?scat=" + document.getElementById('searchSide').value;
    }
});