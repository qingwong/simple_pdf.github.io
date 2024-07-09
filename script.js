let currentPdfFiles = [];

document.getElementById('pdf-upload').addEventListener('change', async function(e) {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    currentPdfFiles = files.filter(file => file.type === 'application/pdf');
    
    if (currentPdfFiles.length !== files.length) {
        showStatus(`已选择 ${currentPdfFiles.length} 个 PDF 文件。忽略了 ${files.length - currentPdfFiles.length} 个非 PDF 文件。`, 'success');
    } else {
        showStatus(`已成功选择 ${currentPdfFiles.length} 个 PDF 文件。`, 'success');
    }

    displayFileList();
    document.getElementById('metadata-form').style.display = 'block';
});

function showStatus(message, type) {
    const statusElement = document.getElementById('upload-status');
    statusElement.textContent = message;
    statusElement.className = `status-message ${type}`;
}

function displayFileList() {
    const fileListElement = document.getElementById('file-list');
    fileListElement.innerHTML = '';
    currentPdfFiles.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.textContent = `${index + 1}. ${file.name}`;
        fileListElement.appendChild(fileItem);
    });
}

document.getElementById('pdf-metadata').addEventListener('submit', async function(e) {
    e.preventDefault();

    if (currentPdfFiles.length === 0) {
        alert('请先上传 PDF 文件');
        return;
    }

    const title = document.getElementById('title').value;
    const author = document.getElementById('author').value;
    const subject = document.getElementById('subject').value;
    const keywords = document.getElementById('keywords').value;

    const zip = new JSZip();

    for (let file of currentPdfFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);

        if (title) pdfDoc.setTitle(title);
        if (author) pdfDoc.setAuthor(author);
        if (subject) pdfDoc.setSubject(subject);
        if (keywords) {
            const keywordsArray = keywords.split(',').map(keyword => keyword.trim()).filter(keyword => keyword !== '');
            pdfDoc.setKeywords(keywordsArray);
        } else {
            pdfDoc.setKeywords([]);
        }

        const pdfBytes = await pdfDoc.save();
        zip.file(`modified_${file.name}`, pdfBytes);
    }

    const zipContent = await zip.generateAsync({type: 'blob'});
    download(zipContent, 'modified_pdfs.zip', 'application/zip');
    showStatus('所有 PDF 文件已成功修改并打包下载。', 'success');
});