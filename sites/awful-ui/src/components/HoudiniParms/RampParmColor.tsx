import React, { useRef, useEffect, useState, useCallback } from 'react';
import hou from '../../types/Houdini';
import { dictionary } from '../../types/Automation';

interface ColorRampPoint {
    x: number;
    y: number[]; // RGB values in range [0,1]
    interp?: hou.rampBasis;
}

interface ColorRampParmProps {
    template: hou.RampParmTemplate;
    onChange?: (formData: dictionary) => void;
}

function getDefaultColorPoints(template: hou.RampParmTemplate): ColorRampPoint[] {
    if (template.default_points && template.default_points.length > 0) {
        const pts =  template.default_points.map(p => ({
            x: p.pos,
            y: p.c ? p.c : [0, 0, 0],
            interp: p.interp
        }));
        return pts;
    }
    // Default two points: black to white
    return [
        { x: 0, y: [0,0,0], interp: hou.rampBasis.Linear },
        { x: 1, y: [1,1,1], interp: hou.rampBasis.Linear }
    ];
}

// Utility: Convert [r,g,b] in [0,1] to hex string
function rgbToHex(rgb: number[]): string {
    const [r,g,b] = rgb.map((v) => Math.round(v * 255));
    const toHex = (val: number) => val.toString(16).padStart(2, '0');
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Utility: Convert hex string (#rrggbb) to [r,g,b] in [0,1]
function hexToRgb(hex: string): number[] {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    return [r, g, b];
}

const ColorRampParm: React.FC<ColorRampParmProps> = ({ template, onChange }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasSize = { width: 360, height: 50 };

    const [points, setPoints] = useState<ColorRampPoint[]>(() => getDefaultColorPoints(template));
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(0);

    const commitChange = useCallback((newPoints: ColorRampPoint[]) => {
        setPoints(newPoints);
        const ret: { [key: string]: ColorRampPoint[] } = {};
        ret[template.name] = newPoints;
        onChange?.(ret);
    }, [onChange, template.name]);

    const drawRamp = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const {width, height} = canvas;
        ctx.clearRect(0, 0, width, height);

        const margin = 10;
        const innerWidth = width - margin * 2;

        const sorted = [...points].sort((a, b) => a.x - b.x);

        // Draw gradient segments between points
        for (let i = 0; i < sorted.length - 1; i++) {
            const p1 = sorted[i];
            const p2 = sorted[i + 1];

            const x1 = p1.x * innerWidth + margin;
            const x2 = p2.x * innerWidth + margin;

            const grad = ctx.createLinearGradient(x1, height/2, x2, height/2);
            const c1 = `rgb(${p1.y[0]*255}, ${p1.y[1]*255}, ${p1.y[2]*255})`;
            const c2 = `rgb(${p2.y[0]*255}, ${p2.y[1]*255}, ${p2.y[2]*255})`;
            grad.addColorStop(0, c1);
            grad.addColorStop(1, c2);

            ctx.fillStyle = grad;
            ctx.fillRect(x1, margin, x2 - x1, height - margin*2);
        }
        
        // If the last point is not at x=1, continue with its color
        const lastPoint = sorted[sorted.length - 1];
        if (lastPoint.x < 1) {
            const xStart = lastPoint.x * innerWidth + margin;
            const xEnd = margin + innerWidth; // end of the ramp area
            ctx.fillStyle = `rgb(${lastPoint.y[0]*255}, ${lastPoint.y[1]*255}, ${lastPoint.y[2]*255})`;
            ctx.fillRect(xStart, margin, xEnd - xStart, height - margin*2);
        }

        // Draw points as small squares
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        sorted.forEach((p, i) => {
            const x = p.x * innerWidth + margin;
            const y = height/2;
            ctx.fillStyle = `rgb(${p.y[0]*255}, ${p.y[1]*255}, ${p.y[2]*255})`;
            ctx.fillRect(x - 5, y - 5, 10, 10);
        
            if (i === selectedIndex) {
                ctx.strokeStyle = '#6666ff'; // Blue stroke for the selected point
                ctx.lineWidth = 3;
            } else {
                ctx.strokeStyle = '#000';
                ctx.lineWidth = 1;
            }
            ctx.strokeRect(x - 5, y - 5, 10, 10);
        });
    }, [points, selectedIndex]);

    useEffect(() => {
        drawRamp();
    }, [drawRamp]);

    const getMousePos = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return { x:0, y:0 };
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        return {
            x: (e.clientX - rect.left)*scaleX,
            y: (e.clientY - rect.top)*scaleY
        };
    };

    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getMousePos(e);
        const {width, height} = canvasSize;
        const margin = 10;
        const innerWidth = width - margin*2;

        // Hit test points
        const hitIndex = points.findIndex(p => {
            const x = p.x * innerWidth + margin;
            const dx = x - pos.x;
            const dy = (height/2) - pos.y;
            return Math.sqrt(dx*dx + dy*dy) < 10; 
        });

        if (hitIndex !== -1) {
            // If right-click and more than two points, remove
            if (e.button === 2 && points.length > 2) {
                e.preventDefault();
                const newPoints = [...points];
                newPoints.splice(hitIndex, 1);
                commitChange(newPoints);
                setSelectedIndex(null);
            } else {
                // Left-click select point and start dragging
                setDraggingIndex(hitIndex);
                setSelectedIndex(hitIndex);
            }
            return;
        }

        // Add a new point on left-click empty space
        if (e.button === 0) {
            const nx = (pos.x - margin) / innerWidth;
            if (nx >= 0 && nx <= 1) {
                // Default new point color is mid gray
                const newPoint = { x: nx, y: [0.5, 0.5, 0.5] as [number,number,number] };
                const newPoints = [...points, newPoint].sort((a,b) => a.x - b.x);
                commitChange(newPoints);

                // Select the newly added point
                const idx = newPoints.findIndex(p => p === newPoint);
                setSelectedIndex(idx);
            }
        }
    };

    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (draggingIndex === null) return;
        const pos = getMousePos(e);
        const {width} = canvasSize;
        const margin = 10;
        const innerWidth = width - margin*2;

        let nx = (pos.x - margin) / innerWidth;
        nx = Math.max(0, Math.min(1, nx));

        const newPoints = [...points];
        // Keep the same color, just move position
        newPoints[draggingIndex] = { ...newPoints[draggingIndex], x: nx };
        setPoints(newPoints);
    };

    const onMouseUp = () => {
        if (draggingIndex !== null) {
            commitChange(points);
            setDraggingIndex(null);
        }
    };

    const onContextMenu = (e: React.MouseEvent) => {
        e.preventDefault();
    };

    // Handle color changes for the selected point
    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedIndex === null) return;
        const newColor = hexToRgb(e.target.value); // Convert hex to [r,g,b] in [0,1]
        const newPoints = [...points];
        newPoints[selectedIndex] = { ...newPoints[selectedIndex], y: newColor };
        commitChange(newPoints);
    };

    return (
        <div className="ramp-parm" title={template.help} style={{ userSelect: 'none' }}>
            <label>{template.label}</label>
            <div style={{position: 'relative'}}>
                <canvas
                    ref={canvasRef}
                    width={canvasSize.width}
                    height={canvasSize.height}
                    style={{ border: '1px solid #ccc', display: 'block', cursor: draggingIndex !== null ? 'grabbing' : 'crosshair'}}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    onContextMenu={onContextMenu}
                />
                {template.show_controls && (
                    <div className="ramp-controls">
                        {selectedIndex !== null && (
                            <div style={{ marginTop: '10px' }}>
                                <label>Point Color - Index {selectedIndex}:</label>
                                <input
                                    type="color"
                                    value={rgbToHex(points[selectedIndex].y)}
                                    onChange={handleColorChange}
                                />
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ColorRampParm;
