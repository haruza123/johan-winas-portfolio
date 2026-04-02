let files = [];

const dropzone = document.getElementById("dropzone");
const fileInput = document.getElementById("fileInput");
const preview = document.getElementById("preview");

// DRAG UPLOAD
dropzone.addEventListener("dragover", (e) => e.preventDefault());
dropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  files = Array.from(e.dataTransfer.files);
  handleFiles();
});

fileInput.addEventListener("change", () => {
  files = Array.from(fileInput.files);
  handleFiles();
});

// HANDLE FILE
function handleFiles() {
  preview.innerHTML = "";

  files.sort((a, b) =>
    a.name.localeCompare(b.name, undefined, { numeric: true }),
  );

  files.forEach((file, i) => {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(file);
    img.dataset.index = i;
    preview.appendChild(img);
  });

  // DRAG SORT
  new Sortable(preview, {
    animation: 150,
    onEnd: () => {
      const newFiles = [];
      preview.querySelectorAll("img").forEach((img) => {
        newFiles.push(files[img.dataset.index]);
      });
      files = newFiles;
    },
  });

  window.detected = {
    pages: files.length,
    format: files[0].name.split(".").pop(),
  };

  autoFill();
}

function detectFromZip() {
  const zipName = document.getElementById("zipName").value;
  if (!zipName) return;

  // default
  let chapter = 1;

  // cari ch
  const chMatch = zipName.match(/ch(\d+)/i);
  if (chMatch) {
    chapter = parseInt(chMatch[1]);
  }

  // ambil nama tanpa ch
  let title = zipName.replace(/_?ch\d+/i, "");

  title = title.replace(/[_-]/g, " ").trim();

  const formattedTitle = title
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const id = title.toLowerCase().replace(/\s+/g, "_");

  document.getElementById("title").value = formattedTitle;
  document.getElementById("id").value = id;
  document.getElementById("folder").value = `image/${id}/ch${chapter}/`;
}

// AUTO DETECT
function autoFill() {
  if (!files.length) return;

  const ext = files[0].name.split(".").pop();
  document.getElementById("folder").value ||= "image/nama-manga/ch1/";

  window.detected = {
    pages: files.length,
    format: ext,
  };
}

// AUTO ID
document.getElementById("title").addEventListener("input", (e) => {
  document.getElementById("id").value = e.target.value
    .toLowerCase()
    .replace(/\s+/g, "_")
    .replace(/[^\w_]/g, "");
});

// PROCESS IMAGE
function processImage(file, index) {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      const targetWidth = parseInt(document.getElementById("width").value);
      const ratio = img.height / img.width;

      if (targetWidth) {
        canvas.width = targetWidth;
        canvas.height = targetWidth * ratio;
      } else {
        canvas.width = img.width;
        canvas.height = img.height;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const format = document.getElementById("format").value;
      const quality = document.getElementById("quality").value / 100;

      canvas.toBlob(
        (blob) => {
          const ext = format.split("/")[1];
          resolve({
            blob,
            name: `${index + 1}.${ext}`,
          });
        },
        format,
        quality,
      );
    };
  });
}

// DOWNLOAD ZIP
async function downloadZip() {
  if (!files.length) return alert("Belum ada gambar!");

  const zip = new JSZip();

  for (let i = 0; i < files.length; i++) {
    const result = await processImage(files[i], i);
    zip.file(result.name, result.blob);
  }

  const content = await zip.generateAsync({ type: "blob" });
  const zipName = document.getElementById("zipName").value || "manga";
  saveAs(content, zipName + ".zip");
}

// GENERATE JSON
function generate() {
  const title = document.getElementById("title").value;
  const id = document.getElementById("id").value;
  const series = document.getElementById("series").value;
  const genres = document
    .getElementById("genres")
    .value.split(",")
    .map((g) => g.trim());
  const folder = document.getElementById("folder").value;
  const chMatch = document.getElementById("zipName").value.match(/ch(\d+)/i);
  const chapterNumber = chMatch ? parseInt(chMatch[1]) : 1;
  const artistName = document.getElementById("artist").value;
  const artistUrl = document.getElementById("artistUrl").value;
  const description = document.getElementById("description").value;
  const status = document.getElementById("status").value;
  const tags = document
    .getElementById("tags")
    .value.split(",")
    .map((t) => t.trim());

  const format = document.getElementById("format").value.split("/")[1];

  const data = {
    id,
    title,
    series,
    genres,
    cover: `${folder}1.${format}`,
    artist: {
      name: artistName,
      url: artistUrl,
    },
    description,
    status,
    updatedAt: new Date().toISOString().split("T")[0],
    tags,
    chapters: [
      {
        number: 1,
        pages: files.length,
        folder,
      },
    ],
  };

  document.getElementById("output").textContent = JSON.stringify(data, null, 2);
}

// COPY JSON
function copyJSON() {
  const text = document.getElementById("output").textContent;
  navigator.clipboard.writeText(text);
  alert("✅ Copied!");
}

function detectFromZip() {
  const zipName = document.getElementById("zipName").value;
  if (!zipName) return;

  // contoh: goldship_ch1
  const parts = zipName.split("_");

  let title = parts[0];
  let chapter = 1;

  // cari ch
  const chMatch = zipName.match(/ch(\d+)/i);
  if (chMatch) {
    chapter = parseInt(chMatch[1]);
  }

  title = title.replace(/[_-]/g, " ");

  const formattedTitle = title
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  const id = title.toLowerCase().replace(/\s+/g, "_");

  document.getElementById("title").value = formattedTitle;
  document.getElementById("id").value = id;
  document.getElementById("folder").value = `image/${id}/ch${chapter}/`;
}

document.getElementById("zipName").addEventListener("input", detectFromZip);
