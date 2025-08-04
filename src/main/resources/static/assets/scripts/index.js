import './index/main/music-register.js';
import './index/main/music-search.js';
import './index/main/user-login.js';
import './index/main/user-music-register.js';
import './index/main/user-register.js';

class Player {
    static formatSeconds = (seconds) => {
        seconds = Math.trunc(seconds);
        const fMin = Math.trunc(seconds / 60);
        const fSec = seconds % 60;
        return `${fMin}:${fSec.toString().padStart(2, '0')}`;
    }

    $element;
    $youtubePlayer;
    $playlist;
    $shuffleInput;
    $loopInput;
    $progressValue;
    $progressPointer;
    $controller;
    $cover;
    $name;
    $artist;
    $timeCurrent;
    $timeSpan;
    $prevButton;
    $playButton;
    $pauseButton;
    $nextButton;
    youtubePlayer;
    playList = [];
    currentPlayIndex;
    isProgressDragging = false;
    progressDragStartLeft;
    progressDragStartX;

    constructor($element) {
        this.$element = $element;
        this.$youtubePlayer = $element.querySelector('[data-mt-reference="youtubePlayer"]');
        this.$playlist = $element.querySelector('[data-mt-reference="playlist"]');
        this.$shuffleInput = $element.querySelector('[data-mt-component="checkLabel.input"][data-mt-name="shuffle"]');
        this.$loopInput = $element.querySelector('[data-mt-component="checkLabel.input"][data-mt-name="loop"]');
        this.$progressValue = $element.querySelector('[data-mt-reference="progressValue"]');
        this.$progressPointer = $element.querySelector('[data-mt-reference="progressPointer"]');
        this.$controller = $element.querySelector('[data-mt-reference="controller"]');
        this.$cover = $element.querySelector('[data-mt-reference="cover"]');
        this.$name = $element.querySelector('[data-mt-reference="name"]');
        this.$artist = $element.querySelector('[data-mt-reference="artist"]');
        this.$timeCurrent = $element.querySelector('[data-mt-reference="timeCurrent"]');
        this.$timeSpan = $element.querySelector('[data-mt-reference="timeSpan"]');
        this.$prevButton = $element.querySelector('[data-mt-reference="prevButton"]');
        this.$playButton = $element.querySelector('[data-mt-reference="playButton"]');
        this.$pauseButton = $element.querySelector('[data-mt-reference="pauseButton"]');
        this.$nextButton = $element.querySelector('[data-mt-reference="nextButton"]');

        YT.ready(() => {
            this.youtubePlayer = new YT.Player('youtubePlayer', {
                width: '100%',
                height: '100%',
                events: {
                    onReady: () => {
                        setInterval(() => {
                            if (this.isProgressDragging === false) {
                                const playRate = (this.youtubePlayer.getCurrentTime() / this.youtubePlayer.getDuration()) * 100;
                                this.$timeCurrent.innerText = Player.formatSeconds(this.youtubePlayer.getCurrentTime());
                                this.$progressValue.style.width = `${playRate}%`;
                                this.$progressPointer.style.left = `${playRate}%`;
                            }
                        }, 1000);
                    },
                    onStateChange: (e) => {
                        this.$timeCurrent.innerText = Player.formatSeconds(this.youtubePlayer.getCurrentTime());
                        this.$timeSpan.innerText = Player.formatSeconds(this.youtubePlayer.getDuration());
                        if (e.data === 0) {
                            this.playNext();
                        } else if (e.data === 1) { // 재생
                            this.$pauseButton.setVisible(true);
                            this.$playButton.setVisible(false);
                        } else if (e.data === 2) { // 일시정지
                            this.$pauseButton.setVisible(false);
                            this.$playButton.setVisible(true);
                        }
                    }
                }
            });
        });
        this.$controller.addEventListener('click', (e) => this.#controllerOnClick(e));
        this.$nextButton.addEventListener('click', () => this.#nextButtonOnClick());
        this.$pauseButton.addEventListener('click', () => this.#pauseButtonOnClick());
        this.$playButton.addEventListener('click', () => this.#playButtonOnClick());
        this.$prevButton.addEventListener('click', () => this.#prevButtonOnClick());

        document.addEventListener('mousemove', (e) => this.#documentOnMousemove(e));
        document.addEventListener('mouseup', () => this.#documentOnMouseup());
        this.$progressPointer.addEventListener('mousedown', (e) => this.#progressPointerOnMousedown(e));
    }

    #controllerOnClick = (e) => {
        if (e.target.parentElement.parentElement.classList.contains('button-container')) {
            return;
        }
        this.$playlist.setVisible(!this.$playlist.isVisible());
    }

    #documentOnMouseup = () => {
        if (this.isProgressDragging === true) {
            this.isProgressDragging = false;
            const currentLeft = parseInt(this.$progressPointer.style.left.replaceAll('px', ''));
            const progressWidth = this.$progressPointer.parentElement.clientWidth;
            const playRatio = currentLeft / progressWidth;
            const seconds = Math.trunc(this.youtubePlayer.getDuration() * playRatio);
            this.youtubePlayer.seekTo(seconds, true);
        }
    }

    #documentOnMousemove = (e) => {
        if (this.isProgressDragging === true) {
            const mouseX = e.clientX;
            const mouseXDelta = mouseX - this.progressDragStartX;
            let position = this.progressDragStartLeft + mouseXDelta;
            if (position < 0) {
                position = 0;
            }
            if (position > this.$progressPointer.parentElement.offsetWidth) {
                position = this.$progressPointer.parentElement.offsetWidth;
            }
            this.$progressValue.style.width = `${position}px`;
            this.$progressPointer.style.left = `${position}px`;
        }
    }

    #nextButtonOnClick = () => {
        this.playNext();
    }

    #pauseButtonOnClick = () => {
        this.youtubePlayer.pauseVideo();
    }

    #playButtonOnClick = () => {
        this.youtubePlayer.playVideo();
    }

    #prevButtonOnClick = () => {
        this.playPrev();
    }

    #progressPointerOnMousedown = (e) => {
        this.progressDragStartX = e.clientX;
        this.progressDragStartLeft = this.$progressValue.clientWidth;
        this.isProgressDragging = true;
    }

    addToPlaylist = (...musics) => {
        const isInit = this.playList.length === 0;
        const $list = this.$playlist.querySelector(':scope > .list');
        $list.querySelector(':scope > .message.empty').setVisible(false);
        for (const music of musics) {
            $list.insertAdjacentHTML('beforeend', `
                <li class="item">
                    <label class="check" data-mt-object="checkLabel">
                        <input type="checkbox" data-mt-component="checkLabel.input">
                        <span data-mt-component="checkLabel.box"></span>
                    </label>
                    <img alt="" class="cover" src="${origin}/api/music/cover?index=${music['index']}">
                    <span class="name">
                        <span class="name">${music['name']}</span>
                        <span class="artist">${music['artist']}</span>
                    </span>
                </li>`);
            const $item = $list.querySelector(':scope > .item:last-child');
            $item.setAttribute('data-mt-raw', JSON.stringify(music));
        }
        this.playList.push(...musics);
        if (isInit === true) {
            this.$element.setVisible(true);
            this.currentPlayIndex = 0;
            this.play(0);
        }
    }

    deleteFromPlaylist = (itemIndex) => {
        if (this.currentPlayIndex === itemIndex) {
            this.playNext();
        }
        this.playList.splice(itemIndex, 1);
        if (this.playList.length === 0) {
            this.$playlist.querySelector('.message.empty').setVisible(true);
            // this.$element.setVisible(false);
            this.$progressValue.style.width = '0';
            this.$name.innerText = '';
            this.$artist.innerText = '';
            this.$timeCurrent.innerText = '0:00';
            this.$timeSpan.innerText = '0:00';
            this.#pauseButtonOnClick();
        }
    }

    play = (index = undefined) => {
        index ??= this.currentPlayIndex;
        this.currentPlayIndex = index;

        const music = this.playList[index];
        this.$progressValue.style.width = '0';
        this.$progressPointer.style.left = '0';
        this.$cover.src = `${origin}/api/music/cover?index=${music['index']}`;
        this.$name.innerText = music['name'];
        this.$artist.innerText = music['artist'];
        this.$timeCurrent.innerText = '0:00';
        this.$timeSpan.innerText = '0:00';
        this.youtubePlayer.loadVideoById(music['youtubeId']);
    }

    playPrev = () => {
        let index;
        if (this.youtubePlayer.getCurrentTime() <= 5) {
            index = this.currentPlayIndex - 1;
            if (index < 0) {
                index = this.playList.length - 1;
            }
        } else {
            index = this.currentPlayIndex;
        }
        this.currentPlayIndex = index;
        this.play(this.currentPlayIndex);
    }

    playNext = () => {
        this.currentPlayIndex++;
        if (this.playList.length === this.currentPlayIndex) {
            if (this.$loopInput.checked === true) {
                this.currentPlayIndex = 0;
            } else {
                this.currentPlayIndex--;
                return;
            }
        }
        this.play(this.currentPlayIndex);
    }
}

window.userSigned = document.head.querySelector('meta[name="_userSigned"]').getAttribute('content') === 'true';
window.dialog = new Dialog({
    $element: document.body.querySelector(':scope > [data-mt-object="dialog"]')
});
window.$main = document.getElementById('main');
window.player = new Player($main.querySelector('[data-mt-reference="player"]'));
/** @type {{[p: string]: HTMLElement}} */
window.$contentMap = /** @type {{[p: string]: HTMLElement}} */ Array.from($main.querySelectorAll(':scope > [data-mt-reference="content"]')).reduce((map, $content) => (map[$content.getAttribute('data-mt-name')] = $content, map), {});
window.$loading = document.getElementById('loading');
/** @type {{[p: string]: function()}} */
window.contentCallbackMap ??= {};

{
    const $menuToggle = document.getElementById('menuToggle');
    const $content = $contentMap['menu'];
    const $routers = Array.from($content.querySelectorAll('[data-mt-reference="router"]'));
    const $routerMap = $routers.reduce((map, $router) => (map[$router.getAttribute('data-mt-name')] = $router, map), {});
    const $items = Array.from($content.querySelectorAll('[data-mt-reference="item"]'));
    const $itemMap = $items.reduce((map, $item) => (map[$item.getAttribute('data-mt-name')] = $item, map), {});
    Object.entries($routerMap).forEach(([name, $router]) => {
        $router.addEventListener('click', () => {
            Object.values($contentMap).forEach(($content) => $content.setVisible(false));
            $contentMap[name]?.setVisible(true);
            contentCallbackMap[name]?.();
            // if (typeof contentCallbackMap[name] === 'function') {
            //     contentCallbackMap[name]();
            // }
            $menuToggle.checked = false;
        });
    });
    $itemMap['userLogout']?.addEventListener('click', () => {
        dialog.show({
            title: '로그아웃',
            content: '정말로 로그아웃 할까요? 저장되지 않은 모든 정보는 유실됩니다.',
            buttons: [
                {
                    caption: '취소',
                    onClickCallback: ($modal) => dialog.hide($modal)
                },
                {
                    caption: '로그아웃',
                    color: 'red',
                    onClickCallback: ($modal) => {
                        dialog.hide($modal);
                        location.href = `${origin}/user-logout`;
                    }
                }
            ]
        });
    });
}

{
    const $selectAllButton = player.$playlist.querySelector('[data-mt-object="button"][data-mt-name="selectAll"]');
    const $deleteButton = player.$playlist.querySelector('[data-mt-object="button"][data-mt-name="delete"]');
    const $saveDiv = player.$playlist.querySelector('.label.save');
    const $openDiv = player.$playlist.querySelector('.label.open');
    $selectAllButton.addEventListener('click', () => {
        const $items = Array.from(player.$playlist.querySelectorAll(':scope > .list > .item'));
        const $checkInputs = $items.map(($item) => $item.querySelector('[data-mt-component="checkLabel.input"]'));
        const toCheck = !$checkInputs.every(($checkInput) => $checkInput.checked === true); // 전부 체크되어있으면 false, 아니면 true
        $checkInputs.forEach(($checkInput) => $checkInput.checked = toCheck);
    });
    $deleteButton.addEventListener('click', () => {
        const $items = Array.from(player.$playlist.querySelectorAll(':scope > .list > .item'));
        const $checkInputs = $items.map(($item) => $item.querySelector('[data-mt-component="checkLabel.input"]'));
        if ($checkInputs.every(($checkInput) => $checkInput.checked === false)) {
            dialog.showSimpleOk('경고', '삭제할 항목을 한 개 이상 선택해주세요.');
            return;
        }
        let toDelete = [];
        $checkInputs.forEach(($checkInput, index) => {
            if ($checkInput.checked === true) {
                toDelete.push(index);
            }
        });
        toDelete = toDelete.sort((a, b) => b - a); // [0, 1] => [1, 0]
        for (const index of toDelete) {
            $items[index].remove(); // HTML 상에서 li 태그 삭제
            player.deleteFromPlaylist(index);
        }
    });
    $saveDiv.addEventListener('click', () => {
        if (window.userSigned === false) {
            dialog.show({
                title: '플레이리스트 저장',
                content: '로그인 후 이용할 수 있는 기능입니다.',
                buttons: [
                    {
                        caption: '로그인하러 이동',
                        color: 'green',
                        onClickCallback: ($modal) => {
                            dialog.hide($modal);
                            player.$playlist.setVisible(false);
                            Object.values($contentMap).forEach(($content) => $content.setVisible(false));
                            $contentMap['userLogin'].setVisible(true);
                            contentCallbackMap['userLogin']?.();
                        }
                    },
                    {
                        caption: '닫기',
                        onClickCallback: ($modal) => dialog.hide($modal)
                    }
                ]
            });
            return;
        }
        if (player.playList.length === 0) {
            dialog.showSimpleOk('경고', '재생 목록이 비어있습니다.');
            return;
        }
        dialog.show({
            title: '플레이리스트 저장',
            content: `
                <form novalidate class="playlist-save-form">
                    <label data-mt-object="label" data-mt-name="name">
                        <span data-mt-component="label.caption">플레이리스트 이름</span>
                        <input required autocomplete="off" maxlength="50" minlength="1" name="name" placeholder="플레이리스트 이름을 입력해 주세요." type="text" data-mt-object="field" data-mt-component="label.field">
                        <span data-mt-component="label.description">이미 존재하는 플레이리스트의 이름을 입력할 경우 해당 플레이리스트를 덮어씀으로 유의해 주세요.</span>
                        <span data-mt-component="label.warning">올바른 플레이리스트 이름을 입력해 주세요.</span>                        
                    </label>
                </form>`,
            isContentHtml: true,
            buttons: [
                {
                    caption: '취소',
                    onClickCallback: ($modal) => dialog.hide($modal)
                },
                {
                    caption: '저장',
                    color: 'green',
                    onClickCallback: ($modal) => {
                        const $form = $modal.querySelector('.playlist-save-form');
                        const $nameLabel = $form.querySelector('[data-mt-object="label"][data-mt-name="name"]');
                        $nameLabel.setInvalid(false);
                        if ($form['name'].value.length === 0) {
                            $nameLabel.setInvalid(true).getWarning().innerText = '이름을 입력해 주세요.';
                        }
                        if ($nameLabel.isInvalid() === true) {
                            return;
                        }
                        const xhr = new XMLHttpRequest();
                        const formData = new FormData();
                        formData.append('name', $form['name'].value);
                        // formData.append('musics', JSON.stringify(player.playList.map((music) => music['index'])));
                        formData.append('musics', player.playList.map((music) => music['index']).join(','));
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
                                case 'failure_session_expired':
                                    dialog.showSimpleOk('경고', '세션 정보가 없습니다. 다시 로그인해 주세요.');
                                    break;
                                case 'success':
                                    dialog.showSimpleOk('알림', '플레이리스트를 저장하였습니다.', {
                                        onClickCallback: () => dialog.hide($modal) // 이거 바깥 모달임
                                    });
                                    break;
                                default:
                                    dialog.showSimpleOk('경고', '알 수 없는 이유로 플레이리스트를 저장하지 못하였습니다. 잠시 후 다시 시도해 주세요.');
                            }
                        };
                        xhr.open('POST', '/api/playlist/');
                        xhr.send(formData);
                        $loading.setVisible(true);
                    }
                }
            ]
        });
    });
    $openDiv.addEventListener('click', () => {
        if (window.userSigned === false) {
            dialog.show({
                title: '플레이리스트 불러오기',
                content: '로그인 후 이용할 수 있는 기능입니다.',
                buttons: [
                    {
                        caption: '로그인하러 이동',
                        color: 'green',
                        onClickCallback: ($modal) => {
                            dialog.hide($modal);
                            player.$playlist.setVisible(false);
                            Object.values($contentMap).forEach(($content) => $content.setVisible(false));
                            $contentMap['userLogin'].setVisible(true);
                            contentCallbackMap['userLogin']?.();
                        }
                    },
                    {
                        caption: '닫기',
                        onClickCallback: ($modal) => dialog.hide($modal)
                    }
                ]
            });
            return;
        }
        const xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status >= 300) {
                dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                return;
            }
            const response = JSON.parse(xhr.responseText);
            if (response.length === 0) {
                dialog.showSimpleOk('경고', '불러올 플레이리스트가 없습니다. 먼저 플레이리스트를 추가해 보세요.');
                return;
            }
            let radios = '';
            for (const playlist of response) {
                radios += `
                    <label data-mt-object="checkLabel" data-mt-name="playlist">
                        <input name="playlist" value="${playlist['index']}" type="radio" data-mt-component="checkLabel.input">
                        <span data-mt-component="checkLabel.box"></span>
                        <span data-mt-component="checkLabel.caption">${playlist['name']}</span>          
                    </label>`;
            }
            dialog.show({
                title: '플레이리스트 불러오기',
                content: `
                    <form class="playlist-load-form">
                        ${radios}
                        <div class="message">불러올 플레이리스트를 선택해 주세요. 기존에 재생 중인 목록은 모두 제거됨으로 유의해 주세요.</div>
                    </form>`,
                isContentHtml: true,
                buttons: [
                    {
                        caption: '취소',
                        onClickCallback: ($modal) => dialog.hide($modal)
                    },
                    {
                        caption: '불러오기',
                        color: 'green',
                        onClickCallback: ($modal) => {
                            const $form = $modal.querySelector('form');
                            if ($form['playlist'].value === '') {
                                dialog.showSimpleOk('경고', '불러올 플레이리스트를 선택해 주세요.');
                                return;
                            }
                            const xhr = new XMLHttpRequest();
                            xhr.onreadystatechange = () => {
                                if (xhr.readyState !== XMLHttpRequest.DONE) {
                                    return;
                                }
                                if (xhr.status < 200 || xhr.status >= 300) {
                                    dialog.showSimpleOk('오류', '요청을 처리하는 도중 오류가 발생하였습니다. 잠시 후 다시 시도해 주세요.');
                                    return;
                                }
                                const response = JSON.parse(xhr.responseText);
                                player.$playlist.querySelectorAll('.item').forEach(($item) => $item.remove());
                                for (let i = player.playList.length - 1; i >= 0; i--) {
                                    player.deleteFromPlaylist(i);
                                }
                                for (const music of response) {
                                    player.addToPlaylist(music);
                                }
                                dialog.hide($modal);
                            };
                            xhr.open('GET', `/api/playlist/musics?index=${$form['playlist'].value}`);
                            xhr.send();
                        }
                    }
                ]
            });
        };
        xhr.open('GET', '/api/playlist/all');
        xhr.send();
    });
}

{
    window.addEventListener('load', () => {
        const $intro = document.getElementById('intro');
        if (new URL(location.href).searchParams.get('debugging') === 'true') {
            $intro.remove();
        } else {
            setTimeout(() => $intro.dataset['mtPhase'] = '1', 250);
            setTimeout(() => {
                $intro.setVisible(false);
                $intro.dataset['mtPhase'] = '';
            }, 2000);
        }
    });
}