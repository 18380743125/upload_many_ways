// 基于 base64 实现文件上传
(function () {
  const upload = document.querySelector("#upload2");
  const upload_inp = upload.querySelector(".upload_inp");
  const upload_button_select = upload.querySelector(".upload_button.select");

  // 把选择的文件读取成 base64
  const changeBase64 = (file) => {
    return new Promise((resolve) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = (e) => {
        resolve(e.target.result);
      };
    });
  };

  // 验证是否处于可操作状态
  const checkDisable = (element) => {
    const classList = element.classList;
    return !(classList.contains("disable") || classList.contains("loading"));
  };

  // 监听用户选择文件的操作
  upload_inp.addEventListener("change", async function () {
    // 获取用户选中的文件
    const file = upload_inp.files[0];
    if (!file) return;

    // 限制文件上传的大小
    if (file.size > 2 * 1024 * 1024) {
      alert(`上传的文件大小超过2MB, 你选择文件的大小是${file.size}`);
      return;
    }
    upload_button_select.classList.add("loading");
    const base64 = await changeBase64(file);
    try {
      const data = await instance.post(
        "/upload_single_base64",
        {
          file: encodeURIComponent(base64),
          filename: file.name,
        },
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      );
      console.log(data);
      upload_inp.value = null
    } catch (err) {
      console.log(err);
    } finally {
      upload_button_select.classList.remove("loading");
    }
  });

  // 点击选择文件按钮, 触发上传文件 input 框选择文件的行为
  upload_button_select.addEventListener("click", function () {
    if (!checkDisable(this)) return;
    upload_inp.click();
  });
})();
