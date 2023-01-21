// 多文件上传
(function () {
  const upload = document.querySelector("#upload5");
  const upload_inp = upload.querySelector(".upload_inp");
  const upload_button_select = upload.querySelector(".upload_button.select");
  const upload_button_upload = upload.querySelector(".upload_button.upload");
  const upload_list = upload.querySelector(".upload_list");

  let _files = [];

  // 验证是否处于可操作状态
  const _checkDisable = (element) => {
    const classList = element.classList;
    return !(classList.contains("disable") || classList.contains("loading"));
  };

  // 获取唯一值
  const _createRandom = () => {
    let ran = Math.random() * Date.now();
    return ran.toString(16).replace(".", Math.floor(Math.random() * 10));
  };

  upload_button_upload.addEventListener("click", function () {
    if (_files.length === 0) {
      return alert("请选择文件！");
    }
    // 获取所有 li
    const upload_list_arr = Array.from(upload_list.querySelectorAll("li"));
    _files = _files.map((item) => {
      const currLi = upload_list_arr.find(
        (li) => li.getAttribute("key") === item.key
      );
      const currSpan = currLi
        ? currLi.querySelector("span:nth-last-child(1)")
        : null;
      const fd = new FormData();
      fd.append("file", item.file);
      fd.append("filename", item.name);
      return instance
        .post("/upload_single", fd, {
          onUploadProgress(e) {
            if (currSpan) {
              currSpan.innerHTML = `${((e.loaded / e.total) * 100).toFixed(
                2
              )}%`;
            }
          },
        })
        .then(
          (data) => {
            if (+data.code === 0) {
              if (currSpan) currSpan.innerHTML = `100%`;
            }
          },
          (err) => Promise.reject(err)
        );
    });

    // 等待所有处理的结果
    Promise.all(_files)
      .then(() => {
        console.log("所有文件上传成功~");
      })
      .catch(() => {
        alert("文件上传错误~");
      });
  });

  // 基于事件委托实现移除操作
  upload_list.addEventListener("click", function (e) {
    const target = e.target;
    if (target.tagName === "EM") {
      const currLi = target.parentNode.parentNode;
      if (!currLi) return;
      const key = currLi.getAttribute("key");
      upload_list.removeChild(currLi);
      _files = _files.filter((file) => file.key !== key);
    }
  });

  // 监听用户选择文件的操作
  upload_inp.addEventListener("change", async function () {
    // 获取用户选中的文件
    _files = Array.from(upload_inp.files);
    if (_files.length === 0) return;
    _files = _files.map((file) => ({
      file,
      name: file.name,
      key: _createRandom(),
    }));
    let str = ``;
    _files.forEach((item, index) => {
      str += `<li key=${item.key}>
        <span>文件${index + 1}：${item.name}</span>
        <span><em>移除</em></span>
      </li>`;
    });
    upload_list.innerHTML = str;
    upload_list.style.display = "block";
  });

  // 点击选择文件按钮, 触发上传文件 input 框选择文件的行为
  upload_button_select.addEventListener("click", function () {
    if (!_checkDisable(this)) return;
    upload_inp.click();
  });
})();
