const dataCenter = "https://api.buhikayesenin.com";

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const categoryName = urlParams.get('scat');

const getContentData = async () => {
    return fetch(`${dataCenter}/getContents`, {
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

const deleteContentM = async (contentID) => {
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

const loadData = async () => {
    await getContentData()
    .then(data => {
        if(data['task'] == true){
            data['results'].forEach(element => {
                var d = document.createElement('tr');
                var icd_c = document.createElement('td');
                var chkbx = document.createElement('input');
                chkbx.setAttribute('type', 'checkbox');
                icd_c.appendChild(chkbx);
                var icd = document.createElement('td');
                icd.innerText = element['contentHeader'];
                var icd_2 = document.createElement('td');
                icd_2.innerText = element['categoryName'];
                var icd_3 = document.createElement('td');
                icd_3.innerText = element['creationTime'].replace('T', " ").replace(".000Z", "");
                var icd_4 = document.createElement('td');
                icd_4.setAttribute('id', element['id']);
                icd_4.innerHTML = `<button type="button" onclick="preview(this);"><i class="fa-solid fa-eye"></i></button>
                <button type="button" onclick="editContent(this);"><i class="fa-solid fa-pen-to-square"></i></button>
                <button type="button" onclick="deleteContent(this);"><i class="fa-solid fa-trash"></i></button>`
                d.appendChild(icd_c);
                d.appendChild(icd);
                d.appendChild(icd_2);
                d.appendChild(icd_3);
                d.appendChild(icd_4);

                document.querySelector('#toIns').appendChild(d);
            });

        }
        else{
            console.log(data);
        }
    })
    .catch(error => {
        console.error(error);
    });
}

$(document).ready(async () => {
    await loadData();
    $('#data').DataTable({
    "aaSorting": [],
    columnDefs: [{
    orderable: false,
    targets: 3
    }],
    "language": {
        "decimal":        "",
        "emptyTable":     "İçerik bulunamadı",
        "info":           " _START_ - _END_ arası gösteriliyor | _TOTAL_ Toplam",
        "infoEmpty":      "0 içerik",
        "infoFiltered":   "(Toplam _MAX_ veri içerisinden filtrelendi)",
        "infoPostFix":    "",
        "thousands":      ",",
        "lengthMenu":     "Tek seferde _MENU_ içerik göster",
        "loadingRecords": "Yükleniyor...",
        "processing":     "",
        "search":         "İçeriklerde Ara:",
        "zeroRecords":    "Aranan içerik bulunamadı",
        "paginate": {
            "first":      "İlk Sayfa",
            "last":       "Son Sayfa",
            "next":       "Sonraki",
            "previous":   "Önceki"
        },
        "aria": {
            "sortAscending":  ": Artana göre sırala",
            "sortDescending": ": Azalana göre sırala"
        }
    }
  });
    $('.dataTables_length').addClass('bs-select');

    if(categoryName){
        document.querySelector('input').value = categoryName;
        var evt = new CustomEvent('keyup');
        evt.which = 13;
        evt.keyCode = 13;
        document.querySelector('input').dispatchEvent(evt);
    }
});

document.getElementById('closePreview').onclick = () => {
    document.querySelector('.previewPDF').style.display = 'none';
};

const preview = async (e) => {
    document.querySelectorAll('iframe').forEach(async (element) => {
        element.remove();
    });
    
    let jh = document.createElement('div');
    jh.setAttribute('id', 'earlyShow');
    jh.innerHTML = `<p>Önizleme yükleniyor...</p>
    <i class="fa-solid fa-spinner" id="rotate"></i>`;
    document.querySelector('.previewPDF').appendChild(jh);

    let documentID = e.parentElement.getAttribute('id');
    document.querySelector('.previewPDF').style.display = 'flex';
    let doc = await getFilePreview(documentID);
    
    let h = document.createElement('iframe');
    h.setAttribute('id', 'pdfurl');
    h.setAttribute('src', doc);
    document.getElementById('earlyShow').remove();
    document.querySelector('.previewPDF').appendChild(h);
};

const editContent = async (e) => {
    let documentID = e.parentElement.getAttribute('id');
    window.location.href = `https://panel.buhikayesenin.com/v1.0/editor?content=${documentID}`;
};

const deleteContent = async (e) => {
    let documentID = e.parentElement.getAttribute('id');
    if(confirm('İçeriği silmek istediğinize emin misiniz?')){
        let kt = await deleteContentM(documentID);
        if(kt['task'] == true){
            e.parentElement.parentElement.remove();
            alert('Başarıyla silindi');
        }
        else{
            alert('İşlem tamamlanamadı');
        }
    }

};