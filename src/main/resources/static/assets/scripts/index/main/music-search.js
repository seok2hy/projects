{
    const $main = document.getElementById('main');
    const $content = $main.querySelector(':scope > .content.music-search');
    const $searchForm = document.getElementById('searchForm');
    const $buttonMap = Array.from($content.querySelectorAll(':scope > .button-container > [data-mt-object="button"]')).reduce((map, $button) => (map[$button.dataset['mtName']] = $button, map), {});
    const $list = $content.querySelector(':scope > .list');
    const $listMessageMap = Array.from($list.querySelectorAll(':scope > [data-mt-reference="message"]')).reduce((map, $message) => (map[$message.dataset['mtName']] = $message, map), {});
    $searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if ($searchForm['keyword'].value === '') {
            return;
        }
        Object.values($listMessageMap).forEach(($message) => $message.setVisible(false));
        $list.querySelectorAll(':scope > .item').forEach(($item) => $item.remove());
        const xhr = new XMLHttpRequest();
        const url = new URL(`${origin}/api/music/search`);
        url.searchParams.set('keyword', $searchForm['keyword'].value);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status >= 300) {
                $listMessageMap['error'].setVisible(true);
                return;
            }
            const response = JSON.parse(xhr.responseText);
            if (response.length === 0) {
                $listMessageMap['empty'].setVisible(true);
                return;
            }
            for (const music of response) {
                $list.insertAdjacentHTML('beforeend', `
                    <li class="item ${music['liked'] === true ? '-liked' : ''}" data-mt-index="${music['index']}">
                        <label data-mt-object="checkLabel">
                            <input type="checkbox" data-mt-component="checkLabel.input">
                            <span data-mt-component="checkLabel.box"></span>
                        </label>
                        <img alt="" class="cover" draggable="false" src="/api/music/cover?index=${music['index']}">
                        <span class="name">
                            <span class="music">${music['name']}</span>
                            <span class="artist">${music['artist']}</span>
                        </span>
                        <span class="like">
                            <span class="count">${music['likeCount']?.toLocaleString()}</span>
                            <button class="button like" type="button" data-mt-object="button" data-mt-color="simple">
                                <img alt="" class="icon default" src="/assets/images/index/main/music-search/list.item.like.png">
                                <img alt="" class="icon liked" src="/assets/images/index/main/music-search/list.item.like-liked.png">
                            </button>
                        </span>
                    </li>`);
            }
            $list.querySelectorAll(':scope > .item').forEach(($item, index) => {
                $item.setAttribute('data-mt-raw', JSON.stringify(response[index]));
                const $likeButton = $item.querySelector(':scope > .like > .button.like');
                $likeButton.addEventListener('click', () => {
                    const xhr = new XMLHttpRequest();
                    const formData = new FormData();
                    formData.append('index', $item.dataset['mtIndex']);
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState !== XMLHttpRequest.DONE) {
                            return;
                        }
                        if (xhr.status < 200 || xhr.status >= 300) {
                            dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                            return;
                        }
                        const response = JSON.parse(xhr.responseText);
                        if (response.result === true) {
                            $item.classList.add('-liked');
                        } else if (response.result === false) {
                            $item.classList.remove('-liked');
                        } else {
                            dialog.showSimpleOk('경고', '요청을 처리할 수 없습니다. 세션이 만료되었거나 음원이 삭제되었을 수 있습니다.');
                        }
                    };
                    xhr.open('PATCH', '/api/music/like');
                    xhr.send(formData);
                });
            });
        };
        xhr.open('GET', url);
        xhr.send();
    });
    $buttonMap['addToPlaylist'].addEventListener('click', () => {
        const $items = Array.from($list.querySelectorAll(':scope > .item'));
        const $checkedItems = $items.filter(($item) => $item.querySelector('[data-mt-component="checkLabel.input"]').checked);
        if ($checkedItems.length === 0) {
            dialog.showSimpleOk('경고', '재생 목록에 추가할 항목에 체크해 주세요.');
            return;
        }
        const musics = $checkedItems.map(($item) => JSON.parse($item.dataset['mtRaw']));
        player.addToPlaylist(...musics);
    });
}