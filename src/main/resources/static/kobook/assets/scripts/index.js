const $findDialog = document.getElementById('find-dialog');
const $searchDialog = document.getElementById('search-dialog');
const $find = $searchDialog.querySelector(':scope > .layout-content > .search-container > .search-form > .label > .bookTitle');
const $loading = document.body.querySelector(':scope > .loading');
const $lists = $findDialog.querySelector(':scope > .content > .list');
const $totalCount = $findDialog.querySelector(':scope > .content > .total-count');
const $bestSearch = $searchDialog.querySelector(':scope > .layout-content > .rank-container');
const $bestBookItems = $bestSearch.querySelector(':scope > .show-ranks > .list');
const $contentBox = $searchDialog.querySelector(':scope > .layout-content > .popular-container > .content-box');

const apiKey = '8Lk0MkLHo573DCbWLuJXqkh3aCtUK5vbm1NPP%2B13GqQzF9DXlFtKmZEy0iVPtqoWQHnKh6j6gsaEpDTdrXZJVg%3D%3D';

const hideLoading = () => $loading.classList.remove('visible');
const showLoading = () => $loading.classList.add('visible');
const hideDialog = () => $findDialog.classList.remove('visible');
const showDialog = () => $findDialog.classList.add('visible');

$findDialog.querySelector(':scope > .close').onclick = () => {
    hideDialog()
    $find.value = '';
};

$searchDialog.querySelector(':scope > .layout-content > .search-container > .search-form').onsubmit = (e) => {
    e.preventDefault();
    const bookTitle = $find.value.trim();
    if (bookTitle.length < 1) {
        alert('검색할 책을 입력해주세요.');
        return;
    }
    fetchBookData(bookTitle);
};

const sortValue = $findDialog.querySelector(':scope > .content > .sort-form > .label');
const $select = sortValue.querySelector(':scope > select[name="select"]');
$select.addEventListener('change', (e) => {
    const sortValue = e.target.value;
    fetchBookData($find.value.trim(), sortValue);
});

function fetchBookData(bookTitle, sortType) {
    if (!bookTitle) return;

    const url = new URL('https://dapi.kakao.com/v3/search/book');
    url.searchParams.set('query', bookTitle);
    url.searchParams.set('size', '10');
    url.searchParams.set('sort', sortType);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        hideLoading();
        if (xhr.status < 200 || xhr.status >= 400) {
            alert('검색 요청 실패');
            return;
        }

        const response = JSON.parse(xhr.responseText);
        const books = response.documents;
        const totalCount = response.meta.total_count;
        console.log(response);

        renderBooks(books, totalCount);
        showDialog();
    };

    xhr.open('GET', url.toString());
    xhr.setRequestHeader('Authorization', 'KakaoAK fa8fbe051d67927bcc168a007e37a73b');
    xhr.send();
    showLoading();
}

function renderBooks (books, totalCount) {
    $lists.querySelectorAll('.book').forEach((item) => {
        item.remove();
    })
    $lists.innerHTML = '';
    $totalCount.innerHTML = '';
    for (const book of books) {
        const translator =book.translators.length>0 ? book.translators: '없음';
        const html = `
                    <li class="book">
                        <span class="image">
                            <span class="thumbnail">
                                <img class="img" src="${book['thumbnail']}" alt="">
                            </span>
                        </span>
                        <span class="stretch"></span>
                        <span class="detail">
                            <span class="title-info">
                                 <h3><span class="title">${book['title']}</span></h3>
                            </span>
                            <span class="author-info">
                                <span class="common">저자:</span>
                                <span class="author">${book['authors']}</span>
                                <span class="common">출판사:</span>
                                <span class="publisher">${book['publisher']}</span>
                            </span>                          
                            <span class="translator-info">
                                <span class="common">번역가:</span>
                                <span class="translator">${translator}</span>
                                <span class="common">발간일:</span>
                                <span class="date-time">${book['datetime'].substring(0, 10)}</span>                           
                            </span>
                            <span class="price">
                                <span class="common">가격:</span>
                                <span>${book['price']}원</span>
                        </span>
                    </li>
                    `
        $lists.innerHTML += html;
    }
    $totalCount.innerHTML += `
        <span>"${$find.value}"에 대한 결과:${totalCount}건</span>
    `;
}

function rankList() {
    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        if (xhr.status < 200 || xhr.status >= 400) {
            alert('요청 실패');
            return;
        }

        const response = JSON.parse(xhr.responseText);
        console.log(response)
        const datas = response.response.body.items.item;
        let rankTitle = [];

        $contentBox.innerHTML = "";
        $bestBookItems.innerHTML = "";

        for (const data of datas) {
            let li = document.createElement("li");
            let img = document.createElement("img");
            img.classList.add("img");
            img.alt = "책 이미지";
            img.src = "./assets/images/loading.png";

            if (data['rank'] <= 3) {
                li.classList.add("page");
                li.innerHTML = `
                    <span class="rank">${data['rank']}</span>
                    <span class="title">${data['search_word']}</span>
                `;
                li.prepend(img);
                $contentBox.appendChild(li);
            } else {
                li.classList.add("item");
                li.innerHTML = `
                    <span class="rank">${data['rank']}</span>
                    <span class="title">${data['search_word']}</span>
                `;
                li.prepend(img);
                $bestBookItems.appendChild(li);
            }
            rankTitle.push({title: data['search_word'], img: img});
        }
        for (const item of rankTitle) {
            getSearchImg(item.title, item.img);
        }
    };
    const url = `https://apis.data.go.kr/6260000/BookSearchWordBestService/getBookSearchWordBest?serviceKey=${apiKey}&numOfRows=10&pageNo=1&resultType=json`;
    xhr.open('GET', url);
    xhr.send();
}

rankList();

function getSearchImg(rankTitle, img) {
    const url = `https://dapi.kakao.com/v3/search/book?query=${encodeURIComponent(rankTitle)}&size=1`;

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState !== XMLHttpRequest.DONE) return;
        if (xhr.status < 200 || xhr.status >= 400) {
            return;
        }

        const data = JSON.parse(xhr.responseText);
        if (data.documents.length > 0 && data.documents[0].thumbnail) {
            img.src = data.documents[0].thumbnail;
        }
    };

    xhr.open("GET", url);
    xhr.setRequestHeader("Authorization", "KakaoAK fa8fbe051d67927bcc168a007e37a73b");
    xhr.send();
}

document.addEventListener("click", (e) => {
    const target = e.target.closest(".page, .item");
    if (!target) return;

    const titleElement = target.querySelector(".title");
    if (!titleElement) return;

    const title = titleElement.innerText.trim();
    $find.value = title;
    console.log(title);

    fetchBookData(title);
});
