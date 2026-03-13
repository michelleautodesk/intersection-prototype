class IntersectionEditor {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        this.settings = {
            roadWidth: 100,
            laneCount: 2,
            cornerRadius: 25,
            editPoints: false
        };
        
        this.center = { x: 0, y: 0 };
        this.isHovered = false;
        
        // Corner control points for editing
        this.cornerPoints = [];
        this.initCornerPoints();
        
        this.dragging = null;
        this.hoveredPoint = null;
        
        this.colors = {
            background: '#f5f5f5',
            road: '#a8a8a8',
            laneMarking: '#ffffff',
            hoverCircle: 'rgba(200, 225, 245, 0.7)',
            hoverCircleBorder: '#90c5f0',
            controlPoint: '#4a9eff',
            controlPointHover: '#2a7edf'
        };
        
        this.setupCanvas();
        this.bindEvents();
        this.bindControls();
        this.render();
    }
    
    initCornerPoints() {
        const hw = this.settings.roadWidth / 2;
        const offset = hw + this.settings.cornerRadius * 0.5;
        
        this.cornerPoints = [
            { id: 'tl', x: -offset, y: -offset, corner: 'top-left' },
            { id: 'tr', x: offset, y: -offset, corner: 'top-right' },
            { id: 'br', x: offset, y: offset, corner: 'bottom-right' },
            { id: 'bl', x: -offset, y: offset, corner: 'bottom-left' }
        ];
    }
    
    setupCanvas() {
        const container = this.canvas.parentElement;
        const size = Math.min(container.clientWidth - 40, container.clientHeight - 40, 600);
        this.canvas.width = size;
        this.canvas.height = size;
        this.center = { x: size / 2, y: size / 2 };
        
        window.addEventListener('resize', () => {
            const newSize = Math.min(container.clientWidth - 40, container.clientHeight - 40, 600);
            this.canvas.width = newSize;
            this.canvas.height = newSize;
            this.center = { x: newSize / 2, y: newSize / 2 };
            this.render();
        });
    }
    
    bindEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mouseleave', () => {
            this.isHovered = false;
            this.hoveredPoint = null;
            this.dragging = null;
            this.canvas.style.cursor = 'default';
            this.render();
        });
    }
    
    bindControls() {
        const roadWidth = document.getElementById('road-width');
        const roadWidthValue = document.getElementById('road-width-value');
        roadWidth.addEventListener('input', (e) => {
            this.settings.roadWidth = parseInt(e.target.value);
            roadWidthValue.textContent = e.target.value;
            this.initCornerPoints();
            this.render();
        });
        
        const cornerRadius = document.getElementById('corner-radius');
        const cornerRadiusValue = document.getElementById('corner-radius-value');
        cornerRadius.addEventListener('input', (e) => {
            this.settings.cornerRadius = parseInt(e.target.value);
            cornerRadiusValue.textContent = e.target.value;
            this.initCornerPoints();
            this.render();
        });
        
        const editPoints = document.getElementById('edit-points');
        editPoints.addEventListener('change', (e) => {
            this.settings.editPoints = e.target.checked;
            this.render();
        });
        
        const resetBtn = document.getElementById('reset-btn');
        resetBtn.addEventListener('click', () => this.reset());
    }
    
    reset() {
        this.settings = {
            roadWidth: 100,
            laneCount: 2,
            cornerRadius: 25,
            editPoints: false
        };
        
        document.getElementById('road-width').value = 100;
        document.getElementById('road-width-value').textContent = '100';
        document.getElementById('corner-radius').value = 25;
        document.getElementById('corner-radius-value').textContent = '25';
        document.getElementById('edit-points').checked = false;
        
        this.initCornerPoints();
        this.render();
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left - this.center.x,
            y: e.clientY - rect.top - this.center.y
        };
    }
    
    isOverIntersection(pos) {
        const hw = this.settings.roadWidth / 2;
        return Math.abs(pos.x) < hw && Math.abs(pos.y) < hw;
    }
    
    getHoveredPoint(pos) {
        if (!this.settings.editPoints) return null;
        
        for (const point of this.cornerPoints) {
            const dx = pos.x - point.x;
            const dy = pos.y - point.y;
            if (Math.sqrt(dx * dx + dy * dy) < 12) {
                return point;
            }
        }
        return null;
    }
    
    onMouseDown(e) {
        const pos = this.getMousePos(e);
        const hoveredPoint = this.getHoveredPoint(pos);
        
        if (hoveredPoint) {
            this.dragging = hoveredPoint;
            this.canvas.style.cursor = 'grabbing';
        }
    }
    
    onMouseMove(e) {
        const pos = this.getMousePos(e);
        
        if (this.dragging) {
            this.dragging.x = pos.x;
            this.dragging.y = pos.y;
            this.render();
        } else {
            // Check hover state
            const wasHovered = this.isHovered;
            this.isHovered = this.isOverIntersection(pos);
            
            // Check for hovered control points
            const prevHoveredPoint = this.hoveredPoint;
            this.hoveredPoint = this.getHoveredPoint(pos);
            
            if (this.hoveredPoint) {
                this.canvas.style.cursor = 'grab';
            } else if (this.isHovered) {
                this.canvas.style.cursor = 'pointer';
            } else {
                this.canvas.style.cursor = 'default';
            }
            
            if (wasHovered !== this.isHovered || prevHoveredPoint !== this.hoveredPoint) {
                this.render();
            }
        }
    }
    
    onMouseUp() {
        this.dragging = null;
        if (this.hoveredPoint) {
            this.canvas.style.cursor = 'grab';
        } else if (this.isHovered) {
            this.canvas.style.cursor = 'pointer';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Background
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.ctx.save();
        this.ctx.translate(this.center.x, this.center.y);
        
        this.drawIntersection();
        
        // Draw hover circle when hovering over intersection
        if (this.isHovered) {
            this.drawHoverCircle();
        }
        
        if (this.settings.editPoints) {
            this.drawControlPoints();
        }
        
        this.ctx.restore();
    }
    
    drawIntersection() {
        const hw = this.settings.roadWidth / 2;
        const roadLength = this.canvas.width / 2;
        const cr = this.settings.cornerRadius;
        
        // Draw roads
        this.ctx.fillStyle = this.colors.road;
        
        // Vertical road
        this.ctx.fillRect(-hw, -roadLength, this.settings.roadWidth, roadLength * 2);
        
        // Horizontal road
        this.ctx.fillRect(-roadLength, -hw, roadLength * 2, this.settings.roadWidth);
        
        // Cut out corners with curves (the curbs)
        this.drawCornerCutouts(hw, cr, roadLength);
        
        // Draw lane markings
        this.drawLaneMarkings(hw, roadLength);
    }
    
    drawCornerCutouts(hw, cr, roadLength) {
        this.ctx.fillStyle = this.colors.background;
        
        // Top-left corner
        this.ctx.beginPath();
        this.ctx.moveTo(-roadLength, -hw);
        this.ctx.lineTo(-hw - cr, -hw);
        this.ctx.quadraticCurveTo(-hw, -hw, -hw, -hw - cr);
        this.ctx.lineTo(-hw, -roadLength);
        this.ctx.lineTo(-roadLength, -roadLength);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Top-right corner
        this.ctx.beginPath();
        this.ctx.moveTo(roadLength, -hw);
        this.ctx.lineTo(hw + cr, -hw);
        this.ctx.quadraticCurveTo(hw, -hw, hw, -hw - cr);
        this.ctx.lineTo(hw, -roadLength);
        this.ctx.lineTo(roadLength, -roadLength);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Bottom-right corner
        this.ctx.beginPath();
        this.ctx.moveTo(roadLength, hw);
        this.ctx.lineTo(hw + cr, hw);
        this.ctx.quadraticCurveTo(hw, hw, hw, hw + cr);
        this.ctx.lineTo(hw, roadLength);
        this.ctx.lineTo(roadLength, roadLength);
        this.ctx.closePath();
        this.ctx.fill();
        
        // Bottom-left corner
        this.ctx.beginPath();
        this.ctx.moveTo(-roadLength, hw);
        this.ctx.lineTo(-hw - cr, hw);
        this.ctx.quadraticCurveTo(-hw, hw, -hw, hw + cr);
        this.ctx.lineTo(-hw, roadLength);
        this.ctx.lineTo(-roadLength, roadLength);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    drawLaneMarkings(hw, roadLength) {
        this.ctx.strokeStyle = this.colors.laneMarking;
        this.ctx.lineWidth = 3;
        
        // Edge lines (solid white lines on road edges)
        const edgeOffset = hw - 8;
        
        // Vertical road edge lines
        // Left edge - top section
        this.ctx.beginPath();
        this.ctx.moveTo(-edgeOffset, -roadLength);
        this.ctx.lineTo(-edgeOffset, -hw - 15);
        this.ctx.stroke();
        
        // Left edge - bottom section
        this.ctx.beginPath();
        this.ctx.moveTo(-edgeOffset, hw + 15);
        this.ctx.lineTo(-edgeOffset, roadLength);
        this.ctx.stroke();
        
        // Right edge - top section
        this.ctx.beginPath();
        this.ctx.moveTo(edgeOffset, -roadLength);
        this.ctx.lineTo(edgeOffset, -hw - 15);
        this.ctx.stroke();
        
        // Right edge - bottom section
        this.ctx.beginPath();
        this.ctx.moveTo(edgeOffset, hw + 15);
        this.ctx.lineTo(edgeOffset, roadLength);
        this.ctx.stroke();
        
        // Horizontal road edge lines
        // Top edge - left section
        this.ctx.beginPath();
        this.ctx.moveTo(-roadLength, -edgeOffset);
        this.ctx.lineTo(-hw - 15, -edgeOffset);
        this.ctx.stroke();
        
        // Top edge - right section
        this.ctx.beginPath();
        this.ctx.moveTo(hw + 15, -edgeOffset);
        this.ctx.lineTo(roadLength, -edgeOffset);
        this.ctx.stroke();
        
        // Bottom edge - left section
        this.ctx.beginPath();
        this.ctx.moveTo(-roadLength, edgeOffset);
        this.ctx.lineTo(-hw - 15, edgeOffset);
        this.ctx.stroke();
        
        // Bottom edge - right section
        this.ctx.beginPath();
        this.ctx.moveTo(hw + 15, edgeOffset);
        this.ctx.lineTo(roadLength, edgeOffset);
        this.ctx.stroke();
        
        // Center dashed lines
        this.ctx.setLineDash([15, 10]);
        this.ctx.lineWidth = 2;
        
        // Vertical center line - top
        this.ctx.beginPath();
        this.ctx.moveTo(0, -roadLength);
        this.ctx.lineTo(0, -hw - 10);
        this.ctx.stroke();
        
        // Vertical center line - bottom
        this.ctx.beginPath();
        this.ctx.moveTo(0, hw + 10);
        this.ctx.lineTo(0, roadLength);
        this.ctx.stroke();
        
        // Horizontal center line - left
        this.ctx.beginPath();
        this.ctx.moveTo(-roadLength, 0);
        this.ctx.lineTo(-hw - 10, 0);
        this.ctx.stroke();
        
        // Horizontal center line - right
        this.ctx.beginPath();
        this.ctx.moveTo(hw + 10, 0);
        this.ctx.lineTo(roadLength, 0);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }
    
    drawHoverCircle() {
        const radius = this.settings.roadWidth * 0.6;
        
        // Fill circle
        this.ctx.beginPath();
        this.ctx.arc(0, 0, radius, 0, Math.PI * 2);
        this.ctx.fillStyle = this.colors.hoverCircle;
        this.ctx.fill();
        
        // Border
        this.ctx.strokeStyle = this.colors.hoverCircleBorder;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // Center dot
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 3, 0, Math.PI * 2);
        this.ctx.fillStyle = this.colors.hoverCircleBorder;
        this.ctx.fill();
    }
    
    drawControlPoints() {
        for (const point of this.cornerPoints) {
            const isHovered = this.hoveredPoint && this.hoveredPoint.id === point.id;
            
            // Outer circle
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, isHovered ? 9 : 7, 0, Math.PI * 2);
            this.ctx.fillStyle = isHovered ? this.colors.controlPointHover : this.colors.controlPoint;
            this.ctx.fill();
            
            // White border
            this.ctx.strokeStyle = '#ffffff';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            
            // Inner dot
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fill();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new IntersectionEditor('intersection-canvas');
});
