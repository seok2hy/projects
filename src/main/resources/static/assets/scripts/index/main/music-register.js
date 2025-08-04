window.addEventListener('load', () => {
    const $content = $contentMap['musicRegister'];
    /** @type {HTMLFormElement} */
    const $searchForm = $content.querySelector(':scope > .search-form');
    const $applyForm = $content.querySelector(':scope > .apply-form');
    const $applyFormLabelMap = Array.from($applyForm.querySelectorAll('[data-mt-object="label"][data-mt-name]')).reduce((map, $label) => (map[$label.dataset['mtName']] = $label, map), {});
    const $list = $content.querySelector(':scope > .list');
    const $listMessageMap = Array.from($list.querySelectorAll(':scope > [data-mt-reference="message"]')).reduce((map, $message) => (map[$message.dataset['mtName']] = $message, map), {});

    $applyForm['coverUrl'].addEventListener('focusout', () => {
        const $previewImage = $applyFormLabelMap['cover'].querySelector('.preview-wrapper > .image');
        const $previewMessage = $applyFormLabelMap['cover'].querySelector('.preview-wrapper > .message');
        $applyFormLabelMap['cover'].setInvalid(false);
        $previewImage.setVisible(false);
        $previewMessage.setVisible(false);
        if ($applyForm['coverUrl'].value === '') {
            $applyFormLabelMap['cover'].setInvalid(true).getWarning().innerText = '커버 이미지 주소를 입력해 주세요.';
            $previewMessage.setVisible(true);
            return;
        }
        if (!$applyForm['coverUrl'].value.startsWith('http://') && !$applyForm['coverUrl'].value.startsWith('https://')) {
            $applyFormLabelMap['cover'].setInvalid(true).getWarning().innerText = '올바른 이미지 주소를 입력해 주세요. 이미지 주소는 "http://" 혹은 "https://"로 시작하여야 합니다.';
            $previewMessage.setVisible(true);
            return;
        }
        $previewImage.setAttribute('src', $applyForm['coverUrl'].value);
        $previewImage.setVisible(true);
    });

    $applyForm['youtubeId'].addEventListener('focusout', () => {
        const $embed = $applyFormLabelMap['youtubeId'].querySelector(':scope > .embed');
        if ($applyForm['youtubeId'].value.length !== 11) {
            $embed.setVisible(false);
            return;
        }
        const src = `https://www.youtube.com/embed/${$applyForm['youtubeId'].value}`;
        if ($embed.src !== src) {
            $embed.src = src;
        }
        $embed.setVisible(true);
    });

    $applyForm['youtubeIdCheckButton'].addEventListener('click', () => {
        $applyFormLabelMap['youtubeId'].setInvalid(false);
        if ($applyForm['youtubeId'].value === '') {
            $applyFormLabelMap['youtubeId'].setInvalid(true).getWarning().innerText = '유튜브 식별자를 입력해 주세요.';
        } else if (!$applyForm['youtubeId'].validity.valid) {
            $applyFormLabelMap['youtubeId'].setInvalid(true).getWarning().innerText = '올바른 유튜브 식별자를 입력해 주세요.';
        }
        if ($applyFormLabelMap['youtubeId'].isInvalid()) {
            return;
        }
        const xhr = new XMLHttpRequest();
        const url = new URL(`${origin}/api/music/check-youtube-id`);
        url.searchParams.set('id', $applyForm['youtubeId'].value);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            $loading.setVisible(false);
            if (xhr.status < 200 || xhr.status >= 300) {
                dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'failure_duplicate':
                    dialog.showSimpleOk('경고', '입력하신 유튜브 아이디를 가지는 음원이 이미 등록되어 있습니다.');
                    break;
                case 'success':
                    dialog.showSimpleOk('알림', '입력하신 유튜브 아이디는 등록할 수 있습니다.');
                    break;
                default:
                    dialog.showSimpleOk('경고', '입력하신 유튜브 아이디를 가지는 유튜브 영상을 확인할 수 없습니다.');
            }
        };
        xhr.open('GET', url);
        xhr.send();
        $loading.setVisible(true);
    });

    $applyForm['cancel'].addEventListener('click', () => {
        const $previewImage = $applyFormLabelMap['cover'].querySelector('.preview-wrapper > .image');
        const $previewMessage = $applyFormLabelMap['cover'].querySelector('.preview-wrapper > .message');
        Object.values($applyFormLabelMap).forEach(($label) => $label.setInvalid(false));
        $previewImage.setVisible(false);
        $previewMessage.setVisible(true);
        $applyForm.reset();
        $applyForm.setVisible(false);
        $list.setVisible(true);
    });

    $applyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        Object.values($applyFormLabelMap).forEach(($label) => $label.setInvalid(false));
        if ($applyForm['coverUrl'].value === '') {
            $applyFormLabelMap['cover'].setInvalid(true).getWarning().innerText = '커버 이미지 주소를 입력해 주세요.';
        }
        if ($applyForm['youtubeId'].value === '') {
            $applyFormLabelMap['youtubeId'].setInvalid(true).getWarning().innerText = '유튜브 식별자를 입력해 주세요.';
        } else if (!$applyForm['youtubeId'].validity.valid) {
            $applyFormLabelMap['youtubeId'].setInvalid(true).getWarning().innerText = '올바른 유튜브 식별자를 입력해 주세요.';
        }
        if ($applyForm['artist'].value === '') {
            $applyFormLabelMap['artist'].setInvalid(true).getWarning().innerText = '아티스트를 입력해 주세요.';
        } else if (!$applyForm['artist'].validity.valid) {
            $applyFormLabelMap['artist'].setInvalid(true).getWarning().innerText = '올바른 아티스트를 입력해 주세요.';
        }
        if ($applyForm['album'].value === '') {
            $applyFormLabelMap['album'].setInvalid(true).getWarning().innerText = '앨범을 입력해 주세요.';
        } else if (!$applyForm['album'].validity.valid) {
            $applyFormLabelMap['album'].setInvalid(true).getWarning().innerText = '올바른 앨범을 입력해 주세요.';
        }
        if ($applyForm['name'].value === '') {
            $applyFormLabelMap['name'].setInvalid(true).getWarning().innerText = '곡 이름을 입력해 주세요.';
        } else if (!$applyForm['name'].validity.valid) {
            $applyFormLabelMap['name'].setInvalid(true).getWarning().innerText = '올바른 곡 이름을 입력해 주세요.';
        }
        if ($applyForm['genre'].value === '') {
            $applyFormLabelMap['genre'].setInvalid(true).getWarning().innerText = '장르를 입력해 주세요.';
        } else if (!$applyForm['genre'].validity.valid) {
            $applyFormLabelMap['genre'].setInvalid(true).getWarning().innerText = '올바른 장르를 입력해 주세요.';
        }
        if (!(new RegExp($applyForm['lyrics'].getAttribute('pattern')).test($applyForm['lyrics'].value))) {
            $applyFormLabelMap['lyrics'].setInvalid(true).getWarning().innerText = '올바른 가사를 입력해 주세요.';
        }
        if ($applyForm['releaseDate'].value === '') {
            $applyFormLabelMap['releaseDate'].setInvalid(true).getWarning().innerText = '발매일을 선택해 주세요.';
        } else if (!$applyForm['releaseDate'].validity.valid) {
            $applyFormLabelMap['releaseDate'].setInvalid(true).getWarning().innerText = '발매일이 올바르지 않습니다.';
        }
        if (Object.values($applyFormLabelMap).some(($label) => $label.isInvalid())) {
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('artist', $applyForm['artist'].value);
        formData.append('album', $applyForm['album'].value);
        formData.append('name', $applyForm['name'].value);
        formData.append('genre', $applyForm['genre'].value);
        formData.append('lyrics', $applyForm['lyrics'].value);
        formData.append('releaseDate', $applyForm['releaseDate'].value);
        formData.append('youtubeId', $applyForm['youtubeId'].value);
        formData.append('_coverUrl', $applyForm['coverUrl'].value);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            $loading.setVisible(false);
            if (xhr.status < 200 || xhr.status >= 300) {
                dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'failure_duplicate':
                    dialog.showSimpleOk('경고', '입력하신 유튜브 아이디를 가지는 음원이 이미 등록되어 있습니다.');
                    break;
                case 'failure_session_expired':
                    dialog.showSimpleOk('경고', '세션 정보가 없습니다. 다시 로그인해 주세요.');
                    break;
                case 'failure_youtube_id_invalid':
                    dialog.showSimpleOk('경고', '입력하신 유튜브 아이디를 가지는 유튜브 영상을 확인할 수 없습니다.');
                    break;
                case 'success':
                    dialog.showSimpleOk('알림', '음원 등록 신청을 완료하였습니다. 신청한 음원은 관리자 승인 후 이용할 수 있습니다.', {
                        onClickCallback: () => $applyForm['cancel'].click()
                    });
                    break;
                default:
                    dialog.showSimpleOk('경고', '알 수 없는 이유로 음원 등록 신청을 하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('POST', '/api/music/');
        xhr.send(formData);
        $loading.setVisible(true);
    });

    $searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if ($searchForm['keyword'].value === '') {
            return;
        }
        Object.values($listMessageMap).forEach(($message) => $message.setVisible(false));
        $list.querySelectorAll(':scope > .item').forEach(($item) => $item.remove());
        $list.setVisible(true);
        $applyForm.setVisible(false);
        const xhr = new XMLHttpRequest();
        const url = new URL(`${origin}/api/music/search-external`);
        url.searchParams.set('keyword', $searchForm['keyword'].value);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            $loading.setVisible(false);
            if (xhr.status < 200 || xhr.status >= 300) {
                $listMessageMap['error'].setVisible(true);
                return;
            }
            const response = JSON.parse(xhr.responseText);
            for (const music of response) {
                $list.insertAdjacentHTML('beforeend', `
                    <li class="item ${music['applied'] === true ? '-applied' : ''}" data-mt-index="${music['index']}">
                        <img alt="" class="cover" draggable="false" src="${music['coverImageName']}">
                        <span class="name">
                            <span class="music">${music['name']}</span>
                            <span class="artist">${music['artist']}</span>
                        </span>
                        <span class="action">
                            <button type="button" data-mt-object="button" data-mt-name="apply" data-mt-color="simple">신청</button>
                            <button type="button" data-mt-object="button" data-mt-name="cancel" data-mt-color="simple">신청 취소</button>
                        </span>
                    </li>`)
            }
            const $items = Array.from($list.querySelectorAll(':scope > .item'));
            for (const $item of $items) {
                const $applyButton = $item.querySelector(':scope > .action > [data-mt-name="apply"]');
                $applyButton.addEventListener('click', () => {
                    const xhr = new XMLHttpRequest();
                    const url = new URL(`${origin}/api/music/crawl`);
                    url.searchParams.set('id', $item.dataset['mtIndex']);
                    xhr.onreadystatechange = () => {
                        if (xhr.readyState !== XMLHttpRequest.DONE) {
                            return;
                        }
                        $loading.setVisible(false);
                        if (xhr.status < 200 || xhr.status >= 300) {
                            dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                            return;
                        }
                        const response = JSON.parse(xhr.responseText);
                        if (response['index'].toString() !== $item.dataset['mtIndex']) {
                            dialog.showSimpleOk('경고', '신청한 음원의 정보를 불러오지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                            return;
                        }
                        const $previewImage = $applyFormLabelMap['cover'].querySelector('.preview-wrapper > .image');
                        const $previewMessage = $applyFormLabelMap['cover'].querySelector('.preview-wrapper > .message');
                        $previewImage.setAttribute('src', response['coverImageName']);
                        $previewImage.setVisible(true);
                        $previewMessage.setVisible(false);
                        $applyForm['coverUrl'].value = response['coverImageName'];
                        $applyForm['artist'].value = response['artist'];
                        $applyForm['album'].value = response['album'];
                        $applyForm['name'].value = response['name'];
                        $applyForm['genre'].value = response['genre'];
                        $applyForm['lyrics'].value = response['lyrics'];
                        $applyForm['releaseDate'].value = response['releaseDate'];
                        $applyForm['youtubeId'].value = response['youtubeId'];
                        $applyForm['youtubeId'].dispatchEvent(new Event('focusout'));
                        $applyForm.setVisible(true);
                        $list.setVisible(false);
                    };
                    xhr.open('GET', url);
                    xhr.send();
                    $loading.setVisible(true);
                });
            }
        };
        xhr.open('GET', url);
        xhr.send();
        $loading.setVisible(true);
    });
});













