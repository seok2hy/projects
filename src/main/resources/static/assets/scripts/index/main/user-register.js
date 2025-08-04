{
    /** @type {HTMLFontElement} */
    const $registerForm = document.getElementById('registerForm');
    /** @type {{[p: string]: HTMLLabelElement}} */
    const $labelMap = /** @type {{[p: string]: HTMLLabelElement}} */ Array.from($registerForm.querySelectorAll('[data-mt-object="label"]')).reduce((map, $label) => (map[$label.getAttribute('data-mt-name')] = $label, map), {});

    window.contentCallbackMap ??= {};
    contentCallbackMap['userRegister'] = () => {
        Object.values($labelMap).forEach(($label) => {
            $label.setInvalid(false);
            $label.setValid(false);
        });
        $registerForm['email'].value = '';
        $registerForm['email'].focus();
        $registerForm['password'].value = '';
        $registerForm['passwordCheck'].value = '';
        $registerForm['nickname'].value = '';
    };

    $registerForm['email'].addEventListener('focusout', () => {
        if (!$registerForm['email'].validity.valid) {
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('email', $registerForm['email'].value);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status >= 300) {
                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'failure':
                    $labelMap['email'].setInvalid(true).getWarning().innerText = '이미 사용 중인 이메일입니다.';
                    break;
                case 'success':
                    $labelMap['email'].setValid(true).getWarning().innerText = '사용할 수 있는 이메일입니다.';
                    break;
            }
        };
        xhr.open('POST', '/api/user/check-email');
        xhr.send(formData);
    });
    $registerForm['nickname'].addEventListener('focusout', () => {
        if (!$registerForm['nickname'].validity.valid) {
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('nickname', $registerForm['nickname'].value);
        xhr.onreadystatechange = () => {
            if (xhr.readyState !== XMLHttpRequest.DONE) {
                return;
            }
            if (xhr.status < 200 || xhr.status >= 300) {
                return;
            }
            const response = JSON.parse(xhr.responseText);
            switch (response.result) {
                case 'failure':
                    $labelMap['nickname'].setInvalid(true).getWarning().innerText = '이미 사용 중인 닉네임입니다.';
                    break;
                case 'success':
                    $labelMap['nickname'].setValid(true).getWarning().innerText = '사용할 수 있는 닉네임입니다.';
                    break;
            }
        };
        xhr.open('POST', '/api/user/check-nickname');
        xhr.send(formData);
    });
    $registerForm['back'].addEventListener('click', () => {
        dialog.show({
            title: '경고',
            content: '정말로 회원가입을 취소하고 로그인 페이지로 이동할까요? 입력한 모든 내용이 유실됩니다.',
            buttons: [
                {
                    caption: '이동하기',
                    onClickCallback: ($modal) => {
                        dialog.hide($modal);
                        $contentMap['userLogin'].setVisible(true);
                        $contentMap['userRegister'].setVisible(false);
                        contentCallbackMap['userLogin']();
                    }
                },
                {
                    caption: '계속하기',
                    onClickCallback: ($modal) => dialog.hide($modal)
                }
            ]
        })
    });
    $registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        Object.values($labelMap).forEach(($label) => {
            $label.setInvalid(false);
            $label.setValid(false);
        });
        if ($registerForm['email'].value === '') {
            $labelMap['email'].setInvalid(true).getWarning().innerText = '이메일을 입력해 주세요.';
            $registerForm['email'].focus();
        } else if (!$registerForm['email'].validity.valid) {
            $labelMap['email'].setInvalid(true).getWarning().innerText = '올바른 이메일을 입력해 주세요.';
            $registerForm['email'].focus();
        }
        if ($registerForm['password'].value === '') {
            $labelMap['password'].setInvalid(true).getWarning().innerText = '비밀번호를 입력해 주세요.';
            $registerForm['password'].focus();
        } else if (!$registerForm['password'].validity.valid) {
            $labelMap['password'].setInvalid(true).getWarning().innerText = '올바른 비밀번호를 입력해 주세요.';
            $registerForm['password'].focus();
        } else if ($registerForm['passwordCheck'].value === '') {
            $labelMap['password'].setInvalid(true).getWarning().innerText = '비밀번호를 한 번 더 입력해 주세요.';
            $registerForm['passwordCheck'].focus();
        } else if ($registerForm['password'].value !== $registerForm['passwordCheck'].value) {
            $labelMap['password'].setInvalid(true).getWarning().innerText = '비밀번호가 일치하지 않습니다. 다시 확인해 주세요.';
            $registerForm['passwordCheck'].focus();
        }
        if ($registerForm['nickname'].value === '') {
            $labelMap['nickname'].setInvalid(true).getWarning().innerText = '닉네임을 입력해 주세요.';
            $registerForm['nickname'].focus();
        } else if (!$registerForm['nickname'].validity.valid) {
            $labelMap['nickname'].setInvalid(true).getWarning().innerText = '올바른 닉네임을 입력해 주세요.';
            $registerForm['nickname'].focus();
        }
        if (Object.values($labelMap).some(($label) => $label.isInvalid())) {
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('email', $registerForm['email'].value);
        formData.append('password', $registerForm['password'].value);
        formData.append('nickname', $registerForm['nickname'].value);
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
                case 'failure_duplicate_email':
                    dialog.showSimpleOk('경고', `입력하신 이메일 <b>${$registerForm['email'].value}</b>은/는 이미 사용 중입니다.`, {isContentHtml: true});
                    break;
                case 'failure_duplicate_nickname':
                    dialog.showSimpleOk('경고', `입력하신 닉네임 <b>${$registerForm['nickname'].value}</b>은/는 이미 사용 중입니다.`, {isContentHtml: true});
                    break;
                case 'success':
                    dialog.showSimpleOk('알림', '회원가입해 주셔서 감사합니다. 확인 버튼을 클릭하면 로그인 화면으로 이동합니다.', {
                        onClickCallback: () => {
                            $contentMap['userRegister'].setVisible(false);
                            $contentMap['userLogin'].setVisible(true);
                        }
                    });
                    break;
                default:
                    dialog.showSimpleOk('경고', '알 수 없는 이유로 회원가입에 실패하였습니다. 잠시 후 다시 시도해 주세요.');
            }
        };
        xhr.open('POST', '/api/user/register');
        xhr.send(formData);
    });
}














