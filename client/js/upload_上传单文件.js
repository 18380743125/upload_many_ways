(function () {
  const upload = document.querySelector("#upload1");
  const upload_inp = document.querySelector(".upload_inp");
  const upload_button_select = document.querySelector(".upload_button.select");
  const upload_button_upload = document.querySelector(".upload_button.upload");
  const upload_tip = document.querySelector(".upload_tip");
  const upload_list = document.querySelector(".upload_list");

  let _file = null;

  // 处理禁用
  function changeDisable(flag) {
    if (flag) {
      upload_button_select.classList.add("disable");
      upload_button_upload.classList.add("loading");
    } else {
      upload_button_select.classList.remove("disable");
      upload_button_upload.classList.remove("loading");
    }
  }

  // 清除文件操作
  function _clearHandler() {
    upload_tip.style.display = "block";
    upload_list.style.display = "none";
    upload_list.innerHTML = ``;
    _file = null;
    upload_inp.value = null;
  }

  // 上传文件到服务器
  upload_button_upload.addEventListener("click", function () {
    if (_file === null) {
      return alert("请选择文件！");
    }
    if (!isCanHandle()) return;
    changeDisable(true);
    const fd = new FormData();
    fd.append("filename", _file.name);
    fd.append("file", _file);
    instance
      .post("/upload_single", fd)
      .then((data) => {
        alert(`上传成功, 你可以通过${data.servicePath}访问~`);
      })
      .catch((err) => {
        alert(`上传异常~${err.message}`);
      })
      .finally(() => {
        _clearHandler();
        changeDisable(false);
      });
  });

  // 移除按钮的点击处理
  upload_list.addEventListener("click", function (e) {
    const target = e.target;
    if (target.tagName === "EM") {
      _clearHandler();
    }
  });

  // 监听用户选择文件的操作
  upload_inp.addEventListener("change", function () {
    // 获取用户选中的文件
    const file = upload_inp.files[0];
    if (!file) return;

    // 限制文件上传的格式
    if (!/(PNG|JPE?G)/i.test(file.type)) {
      alert(`上传的文件格式错误！你选择文件的格式是${file.type}`);
      _clearHandler();
      return;
    }

    // 限制文件上传的大小
    if (file.size > 2 * 1024 * 1024) {
      alert(`上传的文件大小超过2MB, 你选择文件的大小是${file.size}`);
      _clearHandler();
      return;
    }
    _file = file;

    // 显示上传的文件
    upload_tip.style.display = "none";
    upload_list.style.display = "block";
    upload_list.innerHTML = `<li>
      <span>文件：${file.name}</span>
      <span><em>移除</em></span>
    </li>`;
  });

  const isCanHandle = () => {
    return !(
      upload_button_select.classList.contains("disable") ||
      upload_button_upload.classList.contains("loading")
    );
  };

  // 点击选择文件按钮, 触发上传文件 input 框选择文件的行为
  upload_button_select.addEventListener("click", function () {
    if (!isCanHandle()) return;
    upload_inp.click();
  });
})();
