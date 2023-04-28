const dataCenter = "https://api.buhikayesenin.com";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const contentNumber = urlParams.get('content');

const ed = CKEDITOR.replace('editor1', {
  language: 'tr',
  width: 302,
  height: 400,
  toolbar: [
      { name: 'basicstyles', items: [ 'Font','FontSize','Bold','Italic','Underline','Strike','Subscript','Superscript'] },
      //'/',
      { name: 'align', items: [ 'JustifyLeft','JustifyCenter','JustifyRight','JustifyBlock'] },
      { name: 'save', items: [ 'savebtn','Undo','Redo' ] },
      { name: 'clipboard', items: [ 'Cut','Copy','Paste','PasteText','PasteFromWord'] },
      { name: 'document', items: [ 'Find','Replace'] },
      { name: 'lists', items: [ 'NumberedList','BulletedList'] },
      { name: 'insert', items: [ 'Image','Table','Smiley','SpecialChar'] },
      '/',
  ],
  font_names: 'Arial/Arial, Helvetica, sans-serif;' +
		'Comic Sans MS/Comic Sans MS, cursive;' +
		'Courier New/Courier New, Courier, monospace;' +
		'Georgia/Georgia, serif;' +
		'Times New Roman/Times New Roman, Times, serif;' +
		'Calibri/Calibri, sans-serif'
});

const getCategoryData = async () => {
  return fetch(`${dataCenter}/getCategories`, {
      credentials: 'include',
  })
      .then(response => response.json())
      .catch(error => {
      console.error(error);
      window.location.href = "https://panel.buhikayesenin.com/";
      });
};

const getContentIntext = async (contentID) => {
  return fetch(`${dataCenter}/getContent`, {
    credentials: 'include',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify({ contentID: contentID})
})
    .then(response => response.json())
    .catch(error => {
    console.error(error);
    window.location.href = "https://panel.buhikayesenin.com";
    });
}

const loadData = async () => {
  await getCategoryData()
  .then(data => {
      if(data['task'] == true){
          data['results'].forEach(element => {
            var a = document.createElement('option');
            if(contentNumber){
              a.setAttribute('selected', true);
            }
            a.value = element['id'];
            a.innerText = element['categoryName'];
            document.querySelector('#selectCategory').appendChild(a);
          });
      }
      else{
          alert(data['err']['msg']);
      }
  })
  .catch(error => {
      console.error(error);
  });

  if(contentNumber){
    await getContentIntext(contentNumber)
    .then(data => {
        if(data['task'] == true){
          let rawData = data['results']['content'];
          document.getElementById('headerInput').value = data['results']['contentHeader'];
          
          document.querySelectorAll('#selectCategory > option').forEach(async (g) => {
            if(g.value == data['results']['category']){
              g.selected = true;
            }
          })

          CKEDITOR.instances['editor1'].insertHtml(rawData);
        }
        else{
            alert(data['err']['msg']);
        }
    })
    .catch(error => {
        console.error(error);
    });
  }
}

loadData();

const saveButton = document.getElementsByClassName('savebutton')[0];

saveButton.onclick = () =>{
  saveButton.setAttribute('disabled', true);
  const label = document.getElementById('headerInput');
  const textArea = CKEDITOR.instances["editor1"];
  const inner = textArea.getData();
  const categoryID = document.getElementById('selectCategory').value;

  if(label.value.length < 1){
    alert('Lütfen içerik başlığı giriniz');
    saveButton.removeAttribute('disabled');
    return;
  }

  if(inner.trim() == ""){
    alert('İçerik doldurulmadı. Boş pdf oluşturulamaz!');
    saveButton.removeAttribute('disabled');
    return;
  }

  const formData = new FormData();
  formData.append('categoryID', categoryID);
  formData.append('contentHeader', label.value);
  formData.append('fileType', 'html');
  formData.append('file',  new Blob([inner], {type: 'text/html'}));
  if(contentNumber){
    formData.append('contentID', contentNumber);
  }

  const request = new XMLHttpRequest();
  request.open('POST', 'https://api.buhikayesenin.com/insertNewContent');
  request.withCredentials = true;
  request.send(formData);

  request.onreadystatechange = function() {
    if (this.readyState === 4 && this.status === 200) {
      const response = JSON.parse(this.responseText);
      if(response['task'] == true){
        window.location.href = response['redirect'];
      }
      else{
        alert(response['err']['msg']);
        saveButton.removeAttribute('disabled');
      }
    }
  };
  
}