class AppManager {
    constructor() {
        this.initElements();
        this.bindEvents();
        this.currentFunction = null;
        this.currentImage = null;
    }

    initElements() {
        this.inputText = document.getElementById('inputText');
        this.outputText = document.getElementById('outputText');
        this.outputTitle = document.getElementById('outputTitle');
        this.copyBtn = document.getElementById('copyBtn');
        
        this.passwordBtn = document.getElementById('passwordBtn');
        this.uppercaseBtn = document.getElementById('uppercaseBtn');
        this.lowercaseBtn = document.getElementById('lowercaseBtn');
        this.guidBtn = document.getElementById('guidBtn');
        this.unicodeBtn = document.getElementById('unicodeBtn');
        
        this.passwordOptions = document.getElementById('passwordOptions');
        this.passwordLength = document.getElementById('passwordLength');
        this.includeUpper = document.getElementById('includeUpper');
        this.includeLower = document.getElementById('includeLower');
        this.includeNumbers = document.getElementById('includeNumbers');
        this.includeSymbols = document.getElementById('includeSymbols');
        
        this.unicodeOptions = document.getElementById('unicodeOptions');
        
        this.textTab = document.getElementById('textTab');
        this.imageTab = document.getElementById('imageTab');
        this.textContent = document.getElementById('textContent');
        this.imageContent = document.getElementById('imageContent');
        
        this.uploadArea = document.getElementById('uploadArea');
        this.imageInput = document.getElementById('imageInput');
        this.selectImageBtn = document.getElementById('selectImageBtn');
        this.imageCanvas = document.getElementById('imageCanvas');
        this.previewPlaceholder = document.getElementById('previewPlaceholder');
        this.downloadBtn = document.getElementById('downloadBtn');
        this.selectionOverlay = document.getElementById('selectionOverlay');
        
        this.mosaicBtn = document.getElementById('mosaicBtn');
        this.mosaicOptions = document.getElementById('mosaicOptions');
        this.mosaicSize = document.getElementById('mosaicSize');
        this.mosaicSizeValue = document.getElementById('mosaicSizeValue');
        
        this.resizeBtn = document.getElementById('resizeBtn');
        this.resizeOptions = document.getElementById('resizeOptions');
        this.resizeWidth = document.getElementById('resizeWidth');
        this.resizeHeight = document.getElementById('resizeHeight');
        this.keepAspectRatio = document.getElementById('keepAspectRatio');
        this.applyResizeBtn = document.getElementById('applyResize');
        
        this.compressBtn = document.getElementById('compressBtn');
        this.compressOptions = document.getElementById('compressOptions');
        this.quality = document.getElementById('quality');
        this.qualityValue = document.getElementById('qualityValue');
        
        this.cropBtn = document.getElementById('cropBtn');
        this.cropOptions = document.getElementById('cropOptions');
        
        this.isSelectingMosaic = false;
        this.mosaicStartX = 0;
        this.mosaicStartY = 0;
        
        this.isSelectingCrop = false;
        this.cropStartX = 0;
        this.cropStartY = 0;
        
        this.originalImageData = null;
    }

    bindEvents() {
        this.passwordBtn.addEventListener('click', () => this.setFunction('password'));
        this.uppercaseBtn.addEventListener('click', () => this.setFunction('uppercase'));
        this.lowercaseBtn.addEventListener('click', () => this.setFunction('lowercase'));
        this.guidBtn.addEventListener('click', () => this.setFunction('guid'));
        this.unicodeBtn.addEventListener('click', () => this.setFunction('unicode'));
        
        this.inputText.addEventListener('input', () => this.processText());
        this.copyBtn.addEventListener('click', () => this.copyToClipboard());
        
        this.passwordLength.addEventListener('input', () => this.processText());
        this.includeUpper.addEventListener('change', () => this.processText());
        this.includeLower.addEventListener('change', () => this.processText());
        this.includeNumbers.addEventListener('change', () => this.processText());
        this.includeSymbols.addEventListener('change', () => this.processText());
        
        document.querySelectorAll('input[name="unicodeMode"]').forEach(radio => {
            radio.addEventListener('change', () => this.processText());
        });
        
        this.textTab.addEventListener('click', () => this.switchTab('text'));
        this.imageTab.addEventListener('click', () => this.switchTab('image'));
        
        this.selectImageBtn.addEventListener('click', () => this.imageInput.click());
        this.imageInput.addEventListener('change', (e) => this.handleImageSelect(e));
        this.uploadArea.addEventListener('click', () => this.imageInput.click());
        this.uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        this.uploadArea.addEventListener('drop', (e) => this.handleDrop(e));
        this.downloadBtn.addEventListener('click', () => this.downloadImage());
        
        this.mosaicBtn.addEventListener('click', () => this.setImageFunction('mosaic'));
        this.mosaicSize.addEventListener('input', () => {
            this.mosaicSizeValue.textContent = this.mosaicSize.value + 'px';
        });
        
        this.resizeBtn.addEventListener('click', () => this.setImageFunction('resize'));
        this.resizeWidth.addEventListener('input', () => this.calculateAspectRatio('width'));
        this.resizeHeight.addEventListener('input', () => this.calculateAspectRatio('height'));
        this.keepAspectRatio.addEventListener('change', () => this.onAspectRatioToggle());
        this.applyResizeBtn.addEventListener('click', () => this.applyResize());
        
        this.compressBtn.addEventListener('click', () => this.setImageFunction('compress'));
        this.quality.addEventListener('input', () => {
            this.qualityValue.textContent = Math.round(this.quality.value * 100) + '%';
            this.applyCompression();
        });
        
        this.cropBtn.addEventListener('click', () => this.setImageFunction('crop'));
        
        this.imageCanvas.addEventListener('mousedown', (e) => this.handleCanvasMouseDown(e));
        this.imageCanvas.addEventListener('mousemove', (e) => this.handleCanvasMouseMove(e));
        this.imageCanvas.addEventListener('mouseup', (e) => this.handleCanvasMouseUp(e));
    }
    
    switchTab(tabName) {
        document.querySelectorAll('.nav-item').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        if (tabName === 'text') {
            this.textTab.classList.add('active');
            this.textContent.classList.add('active');
        } else if (tabName === 'image') {
            this.imageTab.classList.add('active');
            this.imageContent.classList.add('active');
        }
    }
    
    handleDragOver(e) {
        e.preventDefault();
        this.uploadArea.classList.add('dragover');
    }
    
    handleDrop(e) {
        e.preventDefault();
        this.uploadArea.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type.startsWith('image/')) {
            this.loadImage(files[0]);
        }
    }
    
    handleImageSelect(e) {
        const file = e.target.files[0];
        if (file && file.type.startsWith('image/')) {
            this.loadImage(file);
        }
    }
    
    loadImage(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                this.currentImage = img;
                this.displayImage(img);
                this.downloadBtn.disabled = false;
                
                // 元画像データを保存
                this.originalImageData = this.imageCanvas.toDataURL();
                
                // リサイズのデフォルト値を設定
                this.resizeWidth.value = img.width;
                this.resizeHeight.value = img.height;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
    
    displayImage(img) {
        const canvas = this.imageCanvas;
        const ctx = canvas.getContext('2d');
        
        // 実際のサイズでキャンバスを設定
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        
        // 表示サイズを計算（最大800x600でアスペクト比維持）
        const maxDisplayWidth = 800;
        const maxDisplayHeight = 600;
        let displayWidth = img.width;
        let displayHeight = img.height;
        
        if (displayWidth > maxDisplayWidth) {
            displayHeight = (displayHeight * maxDisplayWidth) / displayWidth;
            displayWidth = maxDisplayWidth;
        }
        if (displayHeight > maxDisplayHeight) {
            displayWidth = (displayWidth * maxDisplayHeight) / displayHeight;
            displayHeight = maxDisplayHeight;
        }
        
        // CSSで表示サイズを設定
        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';
        
        this.previewPlaceholder.style.display = 'none';
        canvas.style.display = 'block';
        
        // キャンバスコンテナのサイズを更新
        const container = canvas.parentElement;
        container.style.width = displayWidth + 'px';
        container.style.height = displayHeight + 'px';
    }
    
    downloadImage() {
        if (!this.imageCanvas) return;
        
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = this.imageCanvas.toDataURL();
        link.click();
    }
    
    setImageFunction(functionName) {
        // 前の選択範囲を非表示
        this.selectionOverlay.style.display = 'none';
        
        this.currentImageFunction = functionName;
        
        // 全ての選択モードをリセット
        this.isSelectingMosaic = false;
        this.isSelectingCrop = false;
        this.imageCanvas.style.cursor = 'default';
        
        if (functionName === 'mosaic') {
            // モザイクが既にアクティブな場合は無効化
            if (this.mosaicBtn.classList.contains('active')) {
                document.querySelectorAll('.image-function-section .function-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.image-function-section .options-panel').forEach(panel => panel.style.display = 'none');
            } else {
                // モザイクを有効化
                document.querySelectorAll('.image-function-section .function-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.image-function-section .options-panel').forEach(panel => panel.style.display = 'none');
                this.mosaicBtn.classList.add('active');
                this.mosaicOptions.style.display = 'block';
                this.isSelectingMosaic = true;
                this.imageCanvas.style.cursor = 'crosshair';
            }
        } else if (functionName === 'resize') {
            document.querySelectorAll('.image-function-section .function-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.image-function-section .options-panel').forEach(panel => panel.style.display = 'none');
            this.resizeBtn.classList.add('active');
            this.resizeOptions.style.display = 'block';
        } else if (functionName === 'compress') {
            document.querySelectorAll('.image-function-section .function-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.image-function-section .options-panel').forEach(panel => panel.style.display = 'none');
            this.compressBtn.classList.add('active');
            this.compressOptions.style.display = 'block';
            this.restoreOriginalImage();
        } else if (functionName === 'crop') {
            // クロップが既にアクティブな場合は無効化
            if (this.cropBtn.classList.contains('active')) {
                document.querySelectorAll('.image-function-section .function-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.image-function-section .options-panel').forEach(panel => panel.style.display = 'none');
            } else {
                // クロップを有効化
                document.querySelectorAll('.image-function-section .function-btn').forEach(btn => btn.classList.remove('active'));
                document.querySelectorAll('.image-function-section .options-panel').forEach(panel => panel.style.display = 'none');
                this.cropBtn.classList.add('active');
                this.cropOptions.style.display = 'block';
                this.isSelectingCrop = true;
                this.imageCanvas.style.cursor = 'crosshair';
            }
        } else {
            // 他の機能の場合は通常の処理
            document.querySelectorAll('.image-function-section .function-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.image-function-section .options-panel').forEach(panel => panel.style.display = 'none');
        }
    }
    
    handleCanvasMouseDown(e) {
        if (!this.isSelectingMosaic && !this.isSelectingCrop) return;
        
        const rect = this.imageCanvas.getBoundingClientRect();
        const scaleX = this.imageCanvas.width / rect.width;
        const scaleY = this.imageCanvas.height / rect.height;
        
        if (this.isSelectingMosaic) {
            this.mosaicStartX = (e.clientX - rect.left) * scaleX;
            this.mosaicStartY = (e.clientY - rect.top) * scaleY;
        } else if (this.isSelectingCrop) {
            this.cropStartX = (e.clientX - rect.left) * scaleX;
            this.cropStartY = (e.clientY - rect.top) * scaleY;
        }
        
        this.isDragging = true;
    }
    
    handleCanvasMouseMove(e) {
        if (!this.isDragging || (!this.isSelectingMosaic && !this.isSelectingCrop)) return;
        
        const rect = this.imageCanvas.getBoundingClientRect();
        const currentX = e.clientX - rect.left;
        const currentY = e.clientY - rect.top;
        
        let startX, startY;
        
        if (this.isSelectingMosaic) {
            startX = this.mosaicStartX / (this.imageCanvas.width / rect.width);
            startY = this.mosaicStartY / (this.imageCanvas.height / rect.height);
        } else if (this.isSelectingCrop) {
            startX = this.cropStartX / (this.imageCanvas.width / rect.width);
            startY = this.cropStartY / (this.imageCanvas.height / rect.height);
        }
        
        const left = Math.min(startX, currentX);
        const top = Math.min(startY, currentY);
        const width = Math.abs(currentX - startX);
        const height = Math.abs(currentY - startY);
        
        // 選択範囲オーバーレイを表示
        this.selectionOverlay.style.left = left + 'px';
        this.selectionOverlay.style.top = top + 'px';
        this.selectionOverlay.style.width = width + 'px';
        this.selectionOverlay.style.height = height + 'px';
        this.selectionOverlay.style.display = 'block';
    }
    
    handleCanvasMouseUp(e) {
        if (!this.isDragging || (!this.isSelectingMosaic && !this.isSelectingCrop)) return;
        
        const rect = this.imageCanvas.getBoundingClientRect();
        const scaleX = this.imageCanvas.width / rect.width;
        const scaleY = this.imageCanvas.height / rect.height;
        
        const endX = (e.clientX - rect.left) * scaleX;
        const endY = (e.clientY - rect.top) * scaleY;
        
        if (this.isSelectingMosaic) {
            const startX = Math.min(this.mosaicStartX, endX);
            const startY = Math.min(this.mosaicStartY, endY);
            const width = Math.abs(endX - this.mosaicStartX);
            const height = Math.abs(endY - this.mosaicStartY);
            
            if (width > 10 && height > 10) {
                this.applyMosaic(startX, startY, width, height);
            }
        } else if (this.isSelectingCrop) {
            const startX = Math.min(this.cropStartX, endX);
            const startY = Math.min(this.cropStartY, endY);
            const width = Math.abs(endX - this.cropStartX);
            const height = Math.abs(endY - this.cropStartY);
            
            if (width > 10 && height > 10) {
                this.applyCrop(startX, startY, width, height);
                this.isSelectingCrop = false;
                this.imageCanvas.style.cursor = 'default';
                this.cropBtn.classList.remove('active');
                this.cropOptions.style.display = 'none';
            }
        }
        
        // 選択範囲オーバーレイを非表示
        this.selectionOverlay.style.display = 'none';
        
        this.isDragging = false;
        // モザイクモードは継続（連続適用可能）
    }
    
    applyMosaic(x, y, width, height) {
        const canvas = this.imageCanvas;
        const ctx = canvas.getContext('2d');
        const mosaicSize = parseInt(this.mosaicSize.value);
        
        const imageData = ctx.getImageData(x, y, width, height);
        const data = imageData.data;
        
        for (let py = 0; py < height; py += mosaicSize) {
            for (let px = 0; px < width; px += mosaicSize) {
                let r = 0, g = 0, b = 0, count = 0;
                
                // モザイクブロック内の平均色を計算
                for (let dy = 0; dy < mosaicSize && py + dy < height; dy++) {
                    for (let dx = 0; dx < mosaicSize && px + dx < width; dx++) {
                        const i = ((py + dy) * width + (px + dx)) * 4;
                        if (i < data.length) {
                            r += data[i];
                            g += data[i + 1];
                            b += data[i + 2];
                            count++;
                        }
                    }
                }
                
                if (count > 0) {
                    r = Math.floor(r / count);
                    g = Math.floor(g / count);
                    b = Math.floor(b / count);
                    
                    // ブロックを平均色で塗りつぶし
                    for (let dy = 0; dy < mosaicSize && py + dy < height; dy++) {
                        for (let dx = 0; dx < mosaicSize && px + dx < width; dx++) {
                            const i = ((py + dy) * width + (px + dx)) * 4;
                            if (i < data.length) {
                                data[i] = r;
                                data[i + 1] = g;
                                data[i + 2] = b;
                            }
                        }
                    }
                }
            }
        }
        
        ctx.putImageData(imageData, x, y);
    }
    
    calculateAspectRatio(changedField) {
        if (!this.keepAspectRatio.checked || !this.currentImage) return;
        
        const originalRatio = this.currentImage.width / this.currentImage.height;
        
        if (changedField === 'width') {
            const newWidth = parseInt(this.resizeWidth.value);
            if (newWidth > 0) {
                this.resizeHeight.value = Math.round(newWidth / originalRatio);
            }
        } else if (changedField === 'height') {
            const newHeight = parseInt(this.resizeHeight.value);
            if (newHeight > 0) {
                this.resizeWidth.value = Math.round(newHeight * originalRatio);
            }
        }
    }
    
    onAspectRatioToggle() {
        if (this.keepAspectRatio.checked) {
            this.calculateAspectRatio('width');
        }
    }
    
    applyResize() {
        if (!this.currentImage) return;
        
        const newWidth = parseInt(this.resizeWidth.value);
        const newHeight = parseInt(this.resizeHeight.value);
        
        if (newWidth > 0 && newHeight > 0) {
            const canvas = this.imageCanvas;
            const ctx = canvas.getContext('2d');
            
            // 実際のサイズでキャンバスを設定
            canvas.width = newWidth;
            canvas.height = newHeight;
            ctx.drawImage(this.currentImage, 0, 0, newWidth, newHeight);
            
            // リサイズされた画像を新しいcurrentImageとして保存
            canvas.toBlob((blob) => {
                const url = URL.createObjectURL(blob);
                const img = new Image();
                img.onload = () => {
                    this.currentImage = img;
                    URL.revokeObjectURL(url);
                };
                img.src = url;
            });
            
            // 表示サイズを計算（最大800x600でアスペクト比維持）
            const maxDisplayWidth = 800;
            const maxDisplayHeight = 600;
            let displayWidth = newWidth;
            let displayHeight = newHeight;
            
            if (displayWidth > maxDisplayWidth) {
                displayHeight = (displayHeight * maxDisplayWidth) / displayWidth;
                displayWidth = maxDisplayWidth;
            }
            if (displayHeight > maxDisplayHeight) {
                displayWidth = (displayWidth * maxDisplayHeight) / displayHeight;
                displayHeight = maxDisplayHeight;
            }
            
            // CSSで表示サイズを設定
            canvas.style.width = displayWidth + 'px';
            canvas.style.height = displayHeight + 'px';
            
            // キャンバスコンテナのサイズを更新
            const container = canvas.parentElement;
            container.style.width = displayWidth + 'px';
            container.style.height = displayHeight + 'px';
        }
    }
    
    restoreOriginalImage() {
        if (!this.originalImageData) return;
        
        const img = new Image();
        img.onload = () => {
            this.displayImage(img);
        };
        img.src = this.originalImageData;
    }
    
    applyCompression() {
        if (!this.currentImage) return;
        
        const canvas = this.imageCanvas;
        const ctx = canvas.getContext('2d');
        const quality = parseFloat(this.quality.value);
        
        // 元画像を再描画
        canvas.width = this.currentImage.width;
        canvas.height = this.currentImage.height;
        ctx.drawImage(this.currentImage, 0, 0);
        
        // 品質を適用してデータURLを取得
        const compressedDataURL = canvas.toDataURL('image/jpeg', quality);
        
        // 圧縮された画像を表示
        const img = new Image();
        img.onload = () => {
            this.displayImage(img);
        };
        img.src = compressedDataURL;
    }
    
    applyCrop(x, y, width, height) {
        const canvas = this.imageCanvas;
        const ctx = canvas.getContext('2d');
        
        // 選択範囲の画像データを取得
        const imageData = ctx.getImageData(x, y, width, height);
        
        // キャンバスサイズを選択範囲に合わせる
        canvas.width = width;
        canvas.height = height;
        
        // 選択範囲のデータを新しいキャンバスに描画
        ctx.putImageData(imageData, 0, 0);
        
        // クロップされた画像を新しいcurrentImageとして保存
        canvas.toBlob((blob) => {
            const url = URL.createObjectURL(blob);
            const img = new Image();
            img.onload = () => {
                this.currentImage = img;
                URL.revokeObjectURL(url);
            };
            img.src = url;
        });
        
        // 表示サイズを計算（最大800x600でアスペクト比維持）
        const maxDisplayWidth = 800;
        const maxDisplayHeight = 600;
        let displayWidth = width;
        let displayHeight = height;
        
        if (displayWidth > maxDisplayWidth) {
            displayHeight = (displayHeight * maxDisplayWidth) / displayWidth;
            displayWidth = maxDisplayWidth;
        }
        if (displayHeight > maxDisplayHeight) {
            displayWidth = (displayWidth * maxDisplayHeight) / displayHeight;
            displayHeight = maxDisplayHeight;
        }
        
        // CSSで表示サイズを設定
        canvas.style.width = displayWidth + 'px';
        canvas.style.height = displayHeight + 'px';
        
        // キャンバスコンテナのサイズを更新
        const container = canvas.parentElement;
        container.style.width = displayWidth + 'px';
        container.style.height = displayHeight + 'px';
    }

    setFunction(functionName) {
        document.querySelectorAll('.function-btn').forEach(btn => btn.classList.remove('active'));
        this.passwordOptions.style.display = 'none';
        this.unicodeOptions.style.display = 'none';
        
        this.currentFunction = functionName;
        
        switch(functionName) {
            case 'password':
                this.passwordBtn.classList.add('active');
                this.passwordOptions.style.display = 'block';
                this.outputTitle.textContent = 'パスワード生成結果';
                break;
            case 'uppercase':
                this.uppercaseBtn.classList.add('active');
                this.outputTitle.textContent = '大文字変換結果';
                break;
            case 'lowercase':
                this.lowercaseBtn.classList.add('active');
                this.outputTitle.textContent = '小文字変換結果';
                break;
            case 'guid':
                this.guidBtn.classList.add('active');
                this.outputTitle.textContent = 'GUID生成結果';
                break;
            case 'unicode':
                this.unicodeBtn.classList.add('active');
                this.unicodeOptions.style.display = 'block';
                this.outputTitle.textContent = 'Unicode変換結果';
                break;
        }
        
        this.processText();
    }

    processText() {
        if (!this.currentFunction) {
            this.outputText.value = '';
            this.copyBtn.disabled = true;
            return;
        }

        let result = '';
        
        switch(this.currentFunction) {
            case 'password':
                result = this.generatePassword();
                break;
            case 'uppercase':
                result = this.convertToUppercase();
                break;
            case 'lowercase':
                result = this.convertToLowercase();
                break;
            case 'guid':
                result = this.generateGUID();
                break;
            case 'unicode':
                result = this.convertToUnicode();
                break;
        }
        
        this.outputText.value = result;
        this.copyBtn.disabled = !result;
    }

    generatePassword() {
        const length = parseInt(this.passwordLength.value) || 12;
        
        let characters = '';
        if (this.includeUpper.checked) characters += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        if (this.includeLower.checked) characters += 'abcdefghijklmnopqrstuvwxyz';
        if (this.includeNumbers.checked) characters += '0123456789';
        if (this.includeSymbols.checked) characters += '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        if (!characters) return '';
        
        let password = '';
        for (let i = 0; i < length; i++) {
            password += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        
        this.inputText.value = password;
        return password;
    }

    convertToUppercase() {
        return this.inputText.value.toUpperCase();
    }

    convertToLowercase() {
        return this.inputText.value.toLowerCase();
    }

    generateGUID() {
        const guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            const r = Math.random() * 16 | 0;
            const v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
        
        this.inputText.value = guid;
        return guid;
    }

    convertToUnicode() {
        const text = this.inputText.value;
        if (!text) return '';
        
        const mode = document.querySelector('input[name="unicodeMode"]:checked').value;
        
        if (mode === 'encode') {
            return Array.from(text)
                .map(char => {
                    const codePoint = char.codePointAt(0);
                    if (codePoint <= 0xFFFF) {
                        return `\\u${codePoint.toString(16).toUpperCase().padStart(4, '0')}`;
                    } else {
                        const high = Math.floor((codePoint - 0x10000) / 0x400) + 0xD800;
                        const low = (codePoint - 0x10000) % 0x400 + 0xDC00;
                        return `\\u${high.toString(16).toUpperCase()}\\u${low.toString(16).toUpperCase()}`;
                    }
                })
                .join('');
        } else {
            try {
                const unicodePattern = /\\u([0-9A-Fa-f]{4})/g;
                return text.replace(unicodePattern, (match, hex) => {
                    const codePoint = parseInt(hex, 16);
                    return String.fromCharCode(codePoint);
                });
            } catch (error) {
                return 'エラー: 無効なUnicodeエスケープ形式です。\n正しい形式: \\u3042 または \\u0041';
            }
        }
    }

    async copyToClipboard() {
        try {
            await navigator.clipboard.writeText(this.outputText.value);
            this.showNotification('コピーしました！');
        } catch (err) {
            this.outputText.select();
            document.execCommand('copy');
            this.showNotification('コピーしました！');
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.classList.add('show'), 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 2000);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new AppManager();
});