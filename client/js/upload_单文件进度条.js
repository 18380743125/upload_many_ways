// 单文件进度条
(function () {
  const upload = document.querySelector("#upload4");
  const upload_inp = upload.querySelector(".upload_inp");
  const upload_button_select = upload.querySelector(".upload_button.select");
  const upload_progress = upload.querySelector(".upload_progress");
  const upload_progress_value = upload_progress.querySelector(".value");

  // 验证是否处于可操作状态
  const _checkDisable = (element) => {
    const classList = element.classList;
    return !(classList.contains("disable") || classList.contains("loading"));
  };

  // 监听用户选择文件的操作
  upload_inp.addEventListener("change", async function () {
    // 获取用户选中的文件
    const file = upload_inp.files[0];
    if (!file) return;

    // 限制文件上传的大小
    if (file.size > 1000 * 1024 * 1024) {
      alert(`上传的文件大小超过2MB, 你选择文件的大小是${file.size}`);
      return;
    }
    upload_button_select.classList.add("loading");

    const formData = new FormData();
    formData.append("file", file);
    formData.append("filename", file.name);
    instance
      .post("/upload_single", formData, {
        onUploadProgress(e) {
          const { loaded, total } = e;
          upload_progress.style.display = "block";
          upload_progress_value.style.width = `${(loaded / total) * 100}%`;
        },
      })
      .then((data) => {
        upload_progress_value.style.width = `100%`;
        console.log(data);
      })
      .finally(() => {
        setTimeout(() => {
          upload_progress.style.display = "none";
        }, 1000)
      });

    upload_button_select.classList.remove("loading");
  });

  // 点击选择文件按钮, 触发上传文件 input 框选择文件的行为
  upload_button_select.addEventListener("click", function () {
    if (!_checkDisable(this)) return;
    upload_inp.click();
  });
})();
