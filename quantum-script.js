// Quantum Drawing Studio - JavaScript

class QuantumStudio {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvas.width = 1000;
        this.canvas.height = 700;

        this.currentTool = 'draw';
        this.isDrawing = false;
        this.layers = [];
        this.layerIndex = 0;
        this.history = [];
        this.historyIndex = -1;
        this.blendMode = false;

        // Settings
        this.brushSize = 5;
        this.brushOpacity = 1;
        this.strokeColor = '#ff6b35';
        this.fillColor = '#ffffff';
        this.fontFamily = 'Poppins';
        this.fontSize = 24;
        this.texture = 'none';

        this.tools = {
            draw: this.drawFreehand.bind(this),
            brush: this.drawBrush.bind(this),
            crayon: this.drawCrayon.bind(this),
            pencil: this.drawPencil.bind(this),
            marker: this.drawMarker.bind(this),
            highlighter: this.drawHighlighter.bind(this),
            airbrush: this.drawAirbrush.bind(this),
            eraser: this.erase.bind(this),
            text: this.drawText.bind(this),
        };

        this.initLayers();
        this.setupEventListeners();
        this.drawBackground();
    }

    initLayers() {
        this.layers = [
            {
                id: 0,
                name: 'Layer 1',
                canvas: document.createElement('canvas'),
                visible: true,
                locked: false,
            }
        ];
        this.layers[0].canvas.width = this.canvas.width;
        this.layers[0].canvas.height = this.canvas.height;
        this.layerIndex = 0;
        this.updateLayersPanel();
    }

    setupEventListeners() {
        // Tool buttons
        document.querySelectorAll('.tool-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
                this.currentTool = e.target.dataset.tool;
            });
        });

        // Shape buttons
        document.querySelectorAll('.shape-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentTool = 'shape';
                this.currentShape = e.target.dataset.shape;
            });
        });

        // Bubble buttons
        document.querySelectorAll('.bubble-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.currentTool = 'bubble';
                this.currentBubble = e.target.dataset.bubble;
            });
        });

        // Settings
        document.getElementById('brushSize').addEventListener('input', (e) => {
            this.brushSize = e.target.value;
            document.getElementById('brushSizeValue').textContent = e.target.value;
        });

        document.getElementById('brushOpacity').addEventListener('input', (e) => {
            this.brushOpacity = e.target.value / 100;
            document.getElementById('brushOpacityValue').textContent = e.target.value + '%';
        });

        document.getElementById('strokeColor').addEventListener('change', (e) => {
            this.strokeColor = e.target.value;
        });

        document.getElementById('fillColor').addEventListener('change', (e) => {
            this.fillColor = e.target.value;
        });

        document.getElementById('fontFamily').addEventListener('change', (e) => {
            this.fontFamily = e.target.value;
        });

        document.getElementById('fontSize').addEventListener('input', (e) => {
            this.fontSize = e.target.value;
            document.getElementById('fontSizeValue').textContent = e.target.value;
        });

        document.getElementById('textureSelect').addEventListener('change', (e) => {
            this.texture = e.target.value;
        });

        // Action buttons
        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        document.getElementById('blendBtn').addEventListener('click', () => this.toggleBlendMode());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearCanvas());

        // Canvas events
        this.canvas.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        this.canvas.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        this.canvas.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));

        // Layer button
        document.getElementById('addLayerBtn').addEventListener('click', () => this.addLayer());

        // Save/Export
        document.getElementById('saveBtn').addEventListener('click', () => this.saveProject());
        document.getElementById('exportBtn').addEventListener('click', () => this.exportPNG());
    }

    drawBackground() {
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.applyTexture();
    }

    applyTexture() {
        if (this.texture === 'none') return;

        const ctx = this.ctx;
        const width = this.canvas.width;
        const height = this.canvas.height;

        if (this.texture === 'paper') {
            // Paper texture with noise
            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const noise = Math.random() * 10;
                data[i] -= noise;
                data[i + 1] -= noise;
                data[i + 2] -= noise;
            }
            ctx.putImageData(imageData, 0, 0);
        } else if (this.texture === 'canvas') {
            // Canvas weave pattern
            ctx.strokeStyle = 'rgba(0, 0, 0, 0.03)';
            ctx.lineWidth = 1;
            for (let i = 0; i < width; i += 4) {
                ctx.beginPath();
                ctx.moveTo(i, 0);
                ctx.lineTo(i, height);
                ctx.stroke();
            }
            for (let i = 0; i < height; i += 4) {
                ctx.beginPath();
                ctx.moveTo(0, i);
                ctx.lineTo(width, i);
                ctx.stroke();
            }
        }
    }

    handleMouseDown(e) {
        this.isDrawing = true;
        const rect = this.canvas.getBoundingClientRect();
        this.lastX = e.clientX - rect.left;
        this.lastY = e.clientY - rect.top;
        this.saveHistory();
    }

    handleMouseMove(e) {
        if (!this.isDrawing) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        if (this.tools[this.currentTool]) {
            this.tools[this.currentTool](this.lastX, this.lastY, x, y);
        } else if (this.currentTool === 'shape') {
            this.drawShape(this.lastX, this.lastY, x, y);
        } else if (this.currentTool === 'bubble') {
            this.drawBubble(this.lastX, this.lastY, x, y);
        }

        this.lastX = x;
        this.lastY = y;
    }

    handleMouseUp(e) {
        this.isDrawing = false;
    }

    handleMouseLeave(e) {
        this.isDrawing = false;
    }

    drawFreehand(fromX, fromY, toX, toY) {
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.globalAlpha = this.brushOpacity;
        this.ctx.lineWidth = this.brushSize;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    drawBrush(fromX, fromY, toX, toY) {
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.globalAlpha = this.brushOpacity * 0.7;
        this.ctx.lineWidth = this.brushSize * 1.5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    drawCrayon(fromX, fromY, toX, toY) {
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.globalAlpha = this.brushOpacity * 0.5;
        this.ctx.lineWidth = this.brushSize * 2;
        this.ctx.lineCap = 'square';
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    drawPencil(fromX, fromY, toX, toY) {
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.globalAlpha = this.brushOpacity * 0.9;
        this.ctx.lineWidth = this.brushSize * 0.5;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    drawMarker(fromX, fromY, toX, toY) {
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.globalAlpha = this.brushOpacity * 0.6;
        this.ctx.lineWidth = this.brushSize * 1.2;
        this.ctx.lineCap = 'square';
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    drawHighlighter(fromX, fromY, toX, toY) {
        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.globalAlpha = this.brushOpacity * 0.3;
        this.ctx.lineWidth = this.brushSize * 2.5;
        this.ctx.lineCap = 'square';
        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();
        this.ctx.globalAlpha = 1;
    }

    drawAirbrush(fromX, fromY, toX, toY) {
        const distance = Math.sqrt((toX - fromX) ** 2 + (toY - fromY) ** 2);
        const steps = Math.ceil(distance);
        
        for (let i = 0; i < steps; i++) {
            const t = i / steps;
            const x = fromX + (toX - fromX) * t;
            const y = fromY + (toY - fromY) * t;
            
            for (let j = 0; j < 10; j++) {
                const angle = Math.random() * Math.PI * 2;
                const radius = Math.random() * this.brushSize;
                const px = x + Math.cos(angle) * radius;
                const py = y + Math.sin(angle) * radius;
                
                this.ctx.fillStyle = this.strokeColor;
                this.ctx.globalAlpha = this.brushOpacity * 0.1;
                this.ctx.beginPath();
                this.ctx.arc(px, py, 1, 0, Math.PI * 2);
                this.ctx.fill();
            }
        }
        this.ctx.globalAlpha = 1;
    }

    erase(fromX, fromY, toX, toY) {
        this.ctx.clearRect(fromX - this.brushSize/2, fromY - this.brushSize/2, this.brushSize, this.brushSize);
        this.ctx.clearRect(toX - this.brushSize/2, toY - this.brushSize/2, this.brushSize, this.brushSize);
    }

    drawShape(fromX, fromY, toX, toY) {
        const width = toX - fromX;
        const height = toY - fromY;

        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.fillStyle = this.fillColor;
        this.ctx.lineWidth = 2;

        switch(this.currentShape) {
            case 'line':
                this.ctx.beginPath();
                this.ctx.moveTo(fromX, fromY);
                this.ctx.lineTo(toX, toY);
                this.ctx.stroke();
                break;
            case 'rectangle':
                this.ctx.fillRect(fromX, fromY, width, height);
                this.ctx.strokeRect(fromX, fromY, width, height);
                break;
            case 'circle':
                const radius = Math.sqrt(width * width + height * height) / 2;
                this.ctx.beginPath();
                this.ctx.arc(fromX, fromY, radius, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.stroke();
                break;
            case 'triangle':
                this.ctx.beginPath();
                this.ctx.moveTo(fromX, toY);
                this.ctx.lineTo(toX, toY);
                this.ctx.lineTo((fromX + toX) / 2, fromY);
                this.ctx.closePath();
                this.ctx.fill();
                this.ctx.stroke();
                break;
            case 'arrow':
                this.drawArrow(fromX, fromY, toX, toY);
                break;
            case 'star':
                this.drawStar(fromX, fromY, toX, toY);
                break;
        }
    }

    drawArrow(fromX, fromY, toX, toY) {
        const headlen = 15;
        const angle = Math.atan2(toY - fromY, toX - fromX);

        this.ctx.beginPath();
        this.ctx.moveTo(fromX, fromY);
        this.ctx.lineTo(toX, toY);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(toX - headlen * Math.cos(angle - Math.PI / 6), toY - headlen * Math.sin(angle - Math.PI / 6));
        this.ctx.moveTo(toX, toY);
        this.ctx.lineTo(toX - headlen * Math.cos(angle + Math.PI / 6), toY - headlen * Math.sin(angle + Math.PI / 6));
        this.ctx.stroke();
    }

    drawStar(cx, cy, toX, toY) {
        const spikes = 5;
        const outerRadius = Math.sqrt((toX - cx) ** 2 + (toY - cy) ** 2);
        const innerRadius = outerRadius / 2.5;

        this.ctx.beginPath();
        for (let i = 0; i < spikes * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / spikes;
            const x = cx + radius * Math.cos(angle - Math.PI / 2);
            const y = cy + radius * Math.sin(angle - Math.PI / 2);
            i === 0 ? this.ctx.moveTo(x, y) : this.ctx.lineTo(x, y);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawBubble(fromX, fromY, toX, toY) {
        const width = Math.abs(toX - fromX);
        const height = Math.abs(toY - fromY);
        const x = Math.min(fromX, toX);
        const y = Math.min(fromY, toY);

        this.ctx.strokeStyle = this.strokeColor;
        this.ctx.fillStyle = this.fillColor;
        this.ctx.lineWidth = 2;

        switch(this.currentBubble) {
            case 'speech':
                this.drawRoundedRect(x, y, width, height, 10);
                this.drawTail(x + width * 0.8, y + height, 10);
                break;
            case 'thought':
                this.drawThoughtBubble(x, y, width, height);
                break;
            case 'shout':
                this.drawShoutBubble(x, y, width, height);
                break;
            case 'cloud':
                this.drawCloudBubble(x, y, width, height);
                break;
            case 'rectangle':
                this.ctx.fillRect(x, y, width, height);
                this.ctx.strokeRect(x, y, width, height);
                break;
            default:
                this.drawRoundedRect(x, y, width, height, 10);
        }
    }

    drawRoundedRect(x, y, width, height, radius) {
        this.ctx.beginPath();
        this.ctx.moveTo(x + radius, y);
        this.ctx.lineTo(x + width - radius, y);
        this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        this.ctx.lineTo(x + width, y + height - radius);
        this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        this.ctx.lineTo(x + radius, y + height);
        this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        this.ctx.lineTo(x, y + radius);
        this.ctx.quadraticCurveTo(x, y, x + radius, y);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawTail(x, y, size) {
        this.ctx.beginPath();
        this.ctx.moveTo(x - size, y - size);
        this.ctx.lineTo(x, y);
        this.ctx.lineTo(x + size, y - size);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawThoughtBubble(x, y, width, height) {
        this.drawRoundedRect(x, y, width, height, 15);
        
        // Circles for thought
        [20, 15, 8].forEach((r, i) => {
            const cx = x + width * 0.2 - r * (i + 1);
            const cy = y + height + r * 2;
            this.ctx.beginPath();
            this.ctx.arc(cx, cy, r, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        });
    }

    drawShoutBubble(x, y, width, height) {
        // Spiky bubble
        this.ctx.beginPath();
        const spikes = 8;
        for (let i = 0; i < spikes * 2; i++) {
            const angle = (i * Math.PI) / spikes;
            const r = i % 2 === 0 ? Math.max(width, height) / 2 + 20 : Math.max(width, height) / 2;
            const px = x + width / 2 + r * Math.cos(angle);
            const py = y + height / 2 + r * Math.sin(angle);
            i === 0 ? this.ctx.moveTo(px, py) : this.ctx.lineTo(px, py);
        }
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawCloudBubble(x, y, width, height) {
        const h = height / 2;
        this.ctx.beginPath();
        this.ctx.arc(x + width * 0.2, y + h, h * 0.7, Math.PI * 0.5, Math.PI * 1.5);
        this.ctx.arc(x + width * 0.5, y, h * 0.8, Math.PI, Math.PI * 2);
        this.ctx.arc(x + width * 0.8, y + h * 0.3, h * 0.9, Math.PI * 1.3, Math.PI * 0.3);
        this.ctx.lineTo(x, y + height);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
    }

    drawText(fromX, fromY, toX, toY) {
        // Show text input
        const textInput = document.getElementById('textInput');
        textInput.style.left = fromX + 'px';
        textInput.style.top = fromY + 'px';
        textInput.classList.remove('hidden');
        document.getElementById('textContent').focus();

        this.textX = fromX;
        this.textY = fromY;
    }

    toggleBlendMode() {
        this.blendMode = !this.blendMode;
        if (this.blendMode) {
            this.ctx.globalCompositeOperation = 'lighten';
            document.getElementById('blendBtn').style.background = 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
        } else {
            this.ctx.globalCompositeOperation = 'source-over';
            document.getElementById('blendBtn').style.background = '';
        }
    }

    saveHistory() {
        this.history.push(this.canvas.toDataURL());
        this.historyIndex++;
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            this.loadHistory();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            this.loadHistory();
        }
    }

    loadHistory() {
        const img = new Image();
        img.src = this.history[this.historyIndex];
        img.onload = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.ctx.drawImage(img, 0, 0);
        };
    }

    clearCanvas() {
        if (confirm('Clear all? This cannot be undone!')) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.drawBackground();
            this.saveHistory();
        }
    }

    addLayer() {
        const newLayer = {
            id: this.layers.length,
            name: `Layer ${this.layers.length + 1}`,
            canvas: document.createElement('canvas'),
            visible: true,
            locked: false,
        };
        newLayer.canvas.width = this.canvas.width;
        newLayer.canvas.height = this.canvas.height;
        this.layers.push(newLayer);
        this.layerIndex = this.layers.length - 1;
        this.updateLayersPanel();
    }

    updateLayersPanel() {
        const layersList = document.getElementById('layersList');
        layersList.innerHTML = '';

        this.layers.forEach((layer, index) => {
            const layerItem = document.createElement('div');
            layerItem.className = 'layer-item' + (index === this.layerIndex ? ' active' : '');
            layerItem.innerHTML = `
                <span class="layer-name">${layer.name}</span>
                <div class="layer-controls">
                    <button class="layer-control" data-action="visibility" data-index="${index}">👁️</button>
                    <button class="layer-control" data-action="delete" data-index="${index}">🗑️</button>
                </div>
            `;
            layerItem.addEventListener('click', () => {
                this.layerIndex = index;
                this.updateLayersPanel();
            });
            layersList.appendChild(layerItem);
        });
    }

    saveProject() {
        const projectName = document.getElementById('projectName').value || 'Untitled';
        const data = JSON.stringify({
            name: projectName,
            image: this.canvas.toDataURL(),
            timestamp: new Date().toISOString(),
        });
        localStorage.setItem(`quantum_project_${Date.now()}`, data);
        alert('Project saved!');
    }

    exportPNG() {
        const canvas = this.canvas;
        const link = document.createElement('a');
        link.href = canvas.toDataURL('image/png');
        link.download = (document.getElementById('projectName').value || 'Untitled') + '.png';
        link.click();
    }
}

// Initialize on load
window.addEventListener('DOMContentLoaded', () => {
    new QuantumStudio();
});