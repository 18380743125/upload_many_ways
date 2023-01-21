// 拖拽上传
(function () {
  const upload = document.querySelector("#upload6");
  const upload_inp = upload.querySelector(".upload_inp");
  const upload_submit = upload.querySelector(".upload_submit");
  const upload_mark = upload.querySelector(".upload_mark");

  let isRunning = false;

  const uploadFile = (file) => {
    if (isRunning) return;
    isRunning = true;
    upload_mark.style.display = "block";
    const fd = new FormData();
    fd.append("file", file);
    fd.append("filename", file.name);
    instance
      .post("/upload_single", fd)
      .then((data) => {
        console.log(data);
      })
      .finally(() => {
        upload_mark.style.display = "none";
        isRunning = false;
      });
  };

  // 拖拽上传
  upload.addEventListener("dragover", function (e) {
    e.preventDefault();
  });
  upload.addEventListener("drop", function (e) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    uploadFile(file);
  });

  // 监听用户选择文件的操作
  upload_inp.addEventListener("change", async function () {
    // 获取用户选中的文件
    const file = upload_inp.files[0];
    if (!file) return;
    uploadFile(file);
  });

  // 点击上传
  upload_submit.addEventListener("click", function () {
    upload_inp.click();
  });
})();
