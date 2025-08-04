{
    /** @type {HTMLFormElement} */
    const $loginForm = document.getElementById('loginForm');
    /** @type {{[p: string]: HTMLLabelElement}} */
    const $labelMap = /** @type {{[p: string]: HTMLLabelElement}} */ Array.from($loginForm.querySelectorAll('[data-mt-object="label"]')).reduce((map, $label) => (map[$label.getAttribute('data-mt-name')] = $label, map), {});

    window.contentCallbackMap ??= {};
    contentCallbackMap['userLogin'] = () => {
        Object.values($labelMap).forEach(($label) => $label.setInvalid(false));
        $loginForm['email'].value = '';
        $loginForm['email'].focus();
        $loginForm['password'].value = '';
    };

    $loginForm.querySelector('[data-mt-reference="register"]').addEventListener('click', (e) => {
        e.preventDefault();
        $contentMap['userLogin'].setVisible(false);
        $contentMap['userRegister'].setVisible(true);
        contentCallbackMap['userRegister']();
    });

    $loginForm.querySelector('[data-mt-reference="recover"]').addEventListener('click', (e) => {
        e.preventDefault();
        $contentMap['userLogin'].setVisible(false);
        $contentMap['userRecover'].setVisible(true);
        contentCallbackMap['userRecover']();
    });

    $loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        Object.values($labelMap).forEach(($label) => {
            $label.setInvalid(false);
            $label.setValid(false);
        });
        if ($loginForm['email'].value === '') {
            $labelMap['email'].setInvalid(true).getWarning().innerText = '이메일을 입력해 주세요.';
            $loginForm['email'].focus();
        } else if (!$loginForm['email'].validity.valid) {
            $labelMap['email'].setInvalid(true).getWarning().innerText = '올바른 이메일을 입력해 주세요.';
            $loginForm['email'].focus();
        }
        if ($loginForm['password'].value === '') {
            $labelMap['password'].setInvalid(true).getWarning().innerText = '비밀번호를 입력해 주세요.';
            $loginForm['password'].focus();
        } else if (!$loginForm['password'].validity.valid) {
            $labelMap['password'].setInvalid(true).getWarning().innerText = '올바른 비밀번호를 입력해 주세요.';
            $loginForm['password'].focus();
        }
        if (Object.values($labelMap).some(($label) => $label.isInvalid())) {
            return;
        }
        const xhr = new XMLHttpRequest();
        const formData = new FormData();
        formData.append('email', $loginForm['email'].value);
        formData.append('password', $loginForm['password'].value);
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
                case 'failure_suspended':
                    dialog.showSimpleOk('경고', '해당 계정은 이용이 정지된 상태입니다. 고객센터를 통해 문의해 주세요.');
                    break;
                case 'success':
                    location.reload();
                    break;
                default:
                    dialog.showSimpleOk('경고', '이메일 혹은 비밀번호가 올바르지 않습니다. 다시 확인해 주세요.', {
                        onClickCallback: () => $loginForm['email'].focus()
                    });
            }
        };
        xhr.open('POST', '/api/user/login');
        xhr.send(formData);
    });
}
















