// 大文件上传
(function () {
  const upload = document.querySelector("#upload7");
  const upload_inp = upload.querySelector(".upload_inp");
  const upload_button_select = upload.querySelector(".upload_button.select");
  const upload_progress = upload.querySelector(".upload_progress");
  const upload_progress_value = upload_progress.querySelector(".value");

  // 验证是否处于可操作状态
  const _checkDisable = (element) => {
    const classList = element.classList;
    return !(classList.contains("disable") || classList.contains("loading"));
  };

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

  // 监听用户选择文件的操作
  upload_inp.addEventListener("change", async function () {
    // 获取用户选中的文件
    const file = upload_inp.files[0];
    if (!file) return;
    upload_button_select.classList.add("loading");
    upload_progress.style.display = "block";
    // 限制文件上传的大小 1G
    if (file.size > 1000 * 1024 * 1024) {
      alert(`上传的文件大小超过2MB, 你选择文件的大小是${file.size}`);
      return;
    }

    let { hash, suffix } = await _changeBuffer(file);
    let already = [];
    try {
      // 获取已经上传的切片信息
      const data = await instance.get("/upload_already", {
        params: {
          HASH: hash,
        },
      });
      if (+data.code === 0) {
        already = data.fileList;
      }
    } catch (err) {
      console.log(err);
    }

    // 实现文件切片处理 [固定数量 & 固定大小]
    let max = 1024 * 128;
    let count = Math.ceil(file.size / max);
    if (count > 100) {
      max = file.size / 100;
      count = 100;
    }
    let index = 0;
    const chunks = [];
    while (index < count) {
      chunks.push({
        file: file.slice(index * max, (index + 1) * max),
        filename: `${hash}_${index + 1}.${suffix}`,
      });
      index++;
    }

    // 上传成功的处理
    const clear = () => {
      upload_button_select.classList.remove("loading");
      upload_progress.style.display = "none";
      upload_progress_value.style.value = `0%`;
    };

    index = 0;
    const complete = async () => {
      // 管控进度条
      index++;
      upload_progress_value.style.width = `${((index / count) * 100).toFixed(
        2
      )}%`;
      if (index < count) return;
      // 上传完成
      upload_progress_value.style.width = `100%`;
      // 合并切片操作
      try {
        const data = await instance.post(
          "/upload_merge",
          {
            HASH: hash,
            count,
          },
          {
            headers: {
              "Content-Type": "application/x-www-form-urlencoded",
            },
          }
        );
        if (data.code === 0) {
          alert(`上传成功~`);
          return;
        }
        throw data.codeText;
      } catch (err) {
        console.error(err);
        alert("合并切片失败~");
      } finally {
        clear();
      }
    };

    // 把每个切片都上传到服务器
    chunks.forEach((chunk) => {
      // 已经上传的切片无需再上传
      if (already.length > 0 && already.includes(chunk.filename)) {
        complete();
        return;
      }
      const fd = new FormData();
      fd.append("file", chunk.file);
      fd.append("filename", chunk.filename);
      instance
        .post("/upload_chunk", fd)
        .then((data) => {
          if (data.code === 0) {
            complete();
            return;
          }
          return Promise.reject(data.codeText);
        })
        .catch((err) => {
          alert("当前切换上传失败, 请稍后再试~");
          clear();
        });
    });
  });

  // 点击选择文件按钮, 触发上传文件 input 框选择文件的行为
  upload_button_select.addEventListener("click", function () {
    if (!_checkDisable(this)) return;
    upload_inp.click();
  });
})();
