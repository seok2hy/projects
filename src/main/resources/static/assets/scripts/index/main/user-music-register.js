window.addEventListener('load', () => {
    const $content = window.$contentMap['userMusicRegister'];
    const $list = $content.querySelector(':scope > .list');
    const $listMessageMap = Array.from($list.querySelectorAll(':scope > [data-mt-reference="message"]')).reduce((map, $message) => (map[$message.dataset['mtName']] = $message, map), {});
    window.contentCallbackMap ??= {};
    window.contentCallbackMap['userMusicRegister'] = () => {
        if (window.userSigned === false) {
            dialog.show({
                title: '음원 등록 신청 내용',
                content: '로그인 후 사용할 수 있는 기능입니다.',
                buttons: [
                    {
                        caption: '로그인하러 이동',
                        color: 'green',
                        onClickCallback: ($modal) => {
                            dialog.hide($modal);
                            Object.values($contentMap).forEach(($content) => $content.setVisible(false));
                            $contentMap['userLogin'].setVisible(true);
                            contentCallbackMap['userLogin']();
                        }
                    },
                    {
                        caption: '닫기',
                        onClickCallback: ($modal) => {
                            dialog.hide($modal);
                            Object.values($contentMap).forEach(($content) => $content.setVisible(false));
                            $contentMap['musicSearch'].setVisible(true);
                            contentCallbackMap['musicSearch']();
                        }
                    }
                ]
            });
            return;
        }

        $list.querySelectorAll(':scope > .item').forEach(($item) => $item.remove());
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            $loading.setVisible(false);
            if (xhr.status < 200 || xhr.status >= 300) {
                dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.', {
                    onClickCallback: () => location.reload()
                });
                return;
            }
            const response = JSON.parse(xhr.responseText);
            if (response.length === 0) {
                $listMessageMap['empty'].setVisible(true);
                return;
            }
            $listMessageMap['empty'].setVisible(false);
            for (const music of response) {
                $list.insertAdjacentHTML('beforeend', `
                    <li class="item" data-mt-index="${music['index']}">
                        <img alt="" class="cover" draggable="false" src="${origin}/api/music/cover?index=${music['index']}">
                        <span class="name">
                            <span class="music">${music['name']}</span>
                            <span class="artist">${music['artist']}</span>
                        </span>
                        <span class="action">
                            ${music['status'] === 'ALLOWED' ? `<span class="approved">승인</span>` : ''}
                            ${music['status'] === 'DENIED' ? `
                                <span class="denied-reason">
                                    <span class="caption">?</span>
                                    <span class="message">${music['deniedReason']}</span>
                                </span>
                                <span class="denied">거절</span>` : ''}
                            ${music['status'] === 'PENDING' ? `<button type="button" data-mt-object="button" data-mt-name="cancel" data-mt-color="simple">신청 취소</button>` : ''}
                        </span>
                    </li>`);
            }
            $list.querySelectorAll('.list > .item').forEach(($item) => {
                const $cancelButton = $item.querySelector('[data-mt-object="button"][data-mt-name="cancel"]');
                $cancelButton?.addEventListener('click', () => {
                    dialog.show({
                        title: '음원 등록 신청 취소',
                        content: '정말로 선택한 음원에 대한 등록 신청을 취소할까요?',
                        buttons: [
                            {
                                caption: '돌아가기',
                                onClickCallback: ($modal) => dialog.hide($modal)
                            },
                            {
                                caption: '신청 취소',
                                color: 'red',
                                onClickCallback: ($modal) => {
                                    dialog.hide($modal);
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
                                        switch (response.result) {
                                            case 'failure_session_expired':
                                                dialog.showSimpleOk('경고', '세션 정보가 없습니다. 다시 로그인해 주세요.');
                                                break;
                                            case 'success':
                                                dialog.showSimpleOk('알림', '성공적으로 음원 등록 신청을 취소하였습니다.', {
                                                    onClickCallback: () => contentCallbackMap['userMusicRegister']()
                                                });
                                                break;
                                            default:
                                                dialog.showSimpleOk('경고', '알 수 없는 이유로 음원 등록 신청 취소에 실패하였습니다. 잠시 후 다시 시도해 주세요.');
                                        }
                                    };
                                    xhr.open('DELETE', '/api/music/');
                                    xhr.send(formData);
                                }
                            }
                        ]
                    })
                })
            });
        };
        xhr.open('GET', '/api/music/register-history');
        xhr.send();
        $loading.setVisible(true);
    }
    // window.contentCallbackMap['userMusicRegister'](); // TODO 개발용
});