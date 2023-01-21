// 文件缩略图和自动生成名字
(function () {
  const upload = document.querySelector("#upload3");
  const upload_inp = upload.querySelector(".upload_inp");
  const upload_button_select = upload.querySelector(".upload_button.select");
  const upload_button_upload = upload.querySelector(".upload_button.upload");
  const upload_abbre = upload.querySelector(".upload_abbre");
  const upload_abbre_img = upload_abbre.querySelector("img");

  let _file = null;

  // 把选择的文件读取成 base64
  const _changeBuffer = (file) => {
    return new Promise((resolve) => {
      const fileReader = new FileReader();
      fileReader.readAsArrayBuffer(file);
      fileReader.onload = (e) => {
        const buffer = e.target.result;
        const spark = new SparkMD5.ArrayBuffer();
        const suffix = /\.(\w+)$/.exec(file.name)[1];
        spark.append(buffer);
        const hash = spark.end();
        resolve({
          buffer,
          hash,
          suffix,
          filename: `${hash}.${suffix}`,
        });
      };
    });
  };

  // 把选择的文件读取成 buffer
  const _changeBase64 = (file) => {
    return new Promise((resolve) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = (e) => {
        resolve(e.target.result);
      };
    });
  };

  // 验证是否处于可操作状态
  const _checkDisable = (element) => {
    const classList = element.classList;
    return !(classList.contains("disable") || classList.contains("loading"));
  };

  // 改变禁用状态
  const _changeDisable = (flag) => {
    if (flag) {
      upload_button_select.classList.add("disable");
      upload_button_upload.classList.add("loading");
    } else {
      upload_button_select.classList.remove("disable");
      upload_button_upload.classList.remove("loading");
    }
  };

  // 上传文件到服务器
  upload_button_upload.addEventListener("click", async function () {
    if (_file === null) {
      return alert("请选择文件！");
    }
    if (!_checkDisable(this)) return;
    _changeDisable(true);
    const { filename } = await _changeBuffer(_file);
    const fd = new FormData();
    fd.append("filename", filename);
    fd.append("file", _file);
    instance
      .post("/upload_single_name", fd)
      .then((data) => {
        alert(`上传成功, 你可以通过${data.servicePath}访问~`);
        console.log(data);
      })
      .catch((err) => {
        alert(`上传异常~${err.message}`);
      })
      .finally(() => {
        _changeDisable(false);
        upload_inp.value = null;
        upload_abbre_img.src = "";
      });
  });

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
    upload_button_select.classList.add("disable");
    // 文件预览, 将文件对象转为 base64
    const base64 = await _changeBase64(file);
    upload_abbre.style.display = "block";
    upload_abbre_img.src = base64;
    upload_button_select.classList.remove("disable");
    _file = file;
  });

  // 点击选择文件按钮, 触发上传文件 input 框选择文件的行为
  upload_button_select.addEventListener("click", function () {
    if (!_checkDisable(this)) return;
    upload_inp.click();
  });
})();
