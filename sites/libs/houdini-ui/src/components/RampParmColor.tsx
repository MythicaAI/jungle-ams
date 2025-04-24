import React, { useRef, useEffect, useState, useCallback } from 'react';
import hou,{ dictionary } from '../types/Houdini';


interface ColorRampPoint {
    pos: number;
    c: number[]; // RGB values in range [0,1]
    interp?: hou.rampBasis;
}

export interface ColorRampParmProps {
    template: hou.RampParmTemplate;
    data: dictionary;
    onChange?: (formData: dictionary) => void;
}

const pointColor = 'rgb(0,0,0)';
const selectedColor = 'rgb(255,255,0)';

function getDefaultColorPoints(template: hou.RampParmTemplate,data:dictionary): ColorRampPoint[] {
    if (data[template.name]) {
        return data[template.name] as ColorRampPoint[];
    }
    if (template.default_points && template.default_points.length > 0) {
        const pts =  template.default_points.map(p => ({
            pos: p.pos,
            c: p.c ? p.c : [0, 0, 0],
            interp: p.interp || hou.rampBasis.Linear
        }));
        return pts;
    }
    // Default two points: black to white
    return [
        { pos: 0, c: [0,0,0], interp: hou.rampBasis.Linear },
        { pos: 1, c: [1,1,1], interp: hou.rampBasis.Linear }
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

export const ColorRampParm: React.FC<ColorRampParmProps> = ({ template, data, onChange }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasSize = { width: 300, height: 50 };

    const [points, setPoints] = useState<ColorRampPoint[]>(() => getDefaultColorPoints(template,data));
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

        const sorted = [...points].sort((a, b) => a.pos - b.pos);

        // If there are points
        if (sorted.length > 0) {
            const firstPoint = sorted[0];
            const lastPoint = sorted[sorted.length - 1];

            // Fill from 0 to first.x with first point's color if first.x > 0
            if (firstPoint.pos > 0) {
                const xEnd = firstPoint.pos * innerWidth + margin;
                ctx.fillStyle = `rgb(${firstPoint.c[0]*255}, ${firstPoint.c[1]*255}, ${firstPoint.c[2]*255})`;
                ctx.fillRect(margin, margin, xEnd - margin, height - margin*2);
            }

            // Draw gradient segments between points
            for (let i = 0; i < sorted.length - 1; i++) {
                const p1 = sorted[i];
                const p2 = sorted[i + 1];

                const x1 = p1.pos * innerWidth + margin;
                const x2 = p2.pos * innerWidth + margin;

                const grad = ctx.createLinearGradient(x1, height/2, x2, height/2);
                const c1 = `rgb(${p1.c[0]*255}, ${p1.c[1]*255}, ${p1.c[2]*255})`;
                const c2 = `rgb(${p2.c[0]*255}, ${p2.c[1]*255}, ${p2.c[2]*255})`;
                grad.addColorStop(0, c1);
                grad.addColorStop(1, c2);

                ctx.fillStyle = grad;
                ctx.fillRect(x1, margin, x2 - x1, height - margin*2);
            }

            // If the last point is not at x=1, continue with its color
            if (lastPoint.pos < 1) {
                const xStart = lastPoint.pos * innerWidth + margin;
                const xEnd = margin + innerWidth; // end of the ramp area
                ctx.fillStyle = `rgb(${lastPoint.c[0]*255}, ${lastPoint.c[1]*255}, ${lastPoint.c[2]*255})`;
                ctx.fillRect(xStart, margin, xEnd - xStart, height - margin*2);
            }

            const handleWidth = 10;
            const handleHeightAbove = 6; // height of the triangular roof portion above the line
            const handleHeightBelow = 8; // how far below the line the handle extends
            // total handle height = handleHeightAbove + handleHeightBelow
            
            sorted.forEach((p, i) => {
                const x = p.pos * innerWidth + margin;
                const lineY = height - margin;
                
                ctx.beginPath();
                ctx.moveTo(x, lineY - handleHeightAbove);
                ctx.lineTo(x - handleWidth/2, lineY);
                ctx.lineTo(x - handleWidth/2, lineY + handleHeightBelow);
                ctx.lineTo(x + handleWidth/2, lineY + handleHeightBelow);
                ctx.lineTo(x + handleWidth/2, lineY);
                ctx.closePath();
            
                ctx.fillStyle = `rgb(${p.c[0]*255}, ${p.c[1]*255}, ${p.c[2]*255})`;
                ctx.fill();
            
                if (i === selectedIndex) {
                    // Draw a highlight
                    ctx.strokeStyle = selectedColor; 
                    ctx.lineWidth = 2;
                } else {
                    ctx.strokeStyle = pointColor;
                    ctx.lineWidth = 1;
                }
                ctx.stroke();
            });
        }

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

    // Inside onMouseDown of ColorRampParm, where we previously did a distance check
    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getMousePos(e);
        const {width, height} = canvasSize;
        const margin = 10;
        const innerWidth = width - margin*2;
        const innerHeight = height - margin*2;

        const sorted = [...points].sort((a,b) => a.pos - b.pos);

        // Define handle shape metrics
        const handleWidth = 10;
        const handleHeightAbove = 6;
        const handleHeightBelow = 8;
        const lineY = margin + innerHeight; // Base line of the gradient

        // Hit test points by checking if click is inside the bounding box of the handle
        const hitIndex = sorted.findIndex(p => {
            const x = p.pos * innerWidth + margin;

            // Calculate bounding box of the handle for this point
            const left = x - handleWidth/2;
            const right = x + handleWidth/2;
            const top = lineY - handleHeightAbove;
            const bottom = lineY + handleHeightBelow;

            return (
                pos.x >= left &&
                pos.x <= right &&
                pos.y >= top &&
                pos.y <= bottom
            );
        });

        if (hitIndex !== -1) {
            // If right-click and more than two points, remove
            if (e.button === 2 && points.length > 2) {
                e.preventDefault();
                const newPoints = [...points].sort((a,b) => a.pos - b.pos);
                newPoints.splice(hitIndex, 1);
                commitChange(newPoints);
                setSelectedIndex(null);
            } else {
                // Left-click select point and start dragging
                const originalIndex = points.indexOf(sorted[hitIndex]);
                setDraggingIndex(originalIndex);
                setSelectedIndex(originalIndex);
            }
            return;
        }

        // If click not on a point, add a new one if within range
        if (e.button === 0) {
            const nx = (pos.x - margin) / innerWidth;
            if (nx >= 0 && nx <= 1) {
                // Default new point color is mid gray
                const newPoint = { pos: nx, c: [0.5, 0.5, 0.5] as [number,number,number], interp: hou.rampBasis.Linear };
                const newPoints = [...points, newPoint].sort((a,b) => a.pos - b.pos);
                commitChange(newPoints);

                const idx = newPoints.indexOf(newPoint);
                setSelectedIndex(idx);
            } else {
                // outside range, deselect any selected point
                setSelectedIndex(null);
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
        // Keep same color, just move position
        newPoints[draggingIndex] = { ...newPoints[draggingIndex], pos: nx };
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
        const newColor = hexToRgb(e.target.value); // Convert hex to [r,g,b]
        const newPoints = [...points];
        newPoints[selectedIndex] = { ...newPoints[selectedIndex], c: newColor };
        commitChange(newPoints);
    };

    // Handle basis changes for the selected point
    const handleBasisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (selectedIndex === null) return;
        const newPoints = [...points];
        newPoints[selectedIndex] = { ...newPoints[selectedIndex], interp: e.target.value as hou.rampBasis };
        commitChange(newPoints);
    };

    const options = ()=> {
        const opts = [];
        for (const basis of Object.values(hou.rampBasis)) 
            opts.push(<option key={basis} value={basis}>{basis}</option>);
        return opts;
    }

    return (
        <div className="ramp-parm" title={template.help} style={{ userSelect: 'none' }}>
            <label>{template.label}</label>
            <div style={{position: 'relative'}}>
                <canvas
                    ref={canvasRef}
                    style={{ 
                        border: '1px solid #ccc', 
                        display: 'block', 
                        cursor: draggingIndex !== null ? 'grabbing' : 'crosshair',
                        width:'100%'
                    }}
                    height = {canvasSize.height}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    onContextMenu={onContextMenu}
                />
                {template.show_controls && selectedIndex !== null && (
                    <div className="ramp-controls" style={{ marginTop: '10px' }}>
                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: 'smaller', justifyContent: 'center' }}>
                            <label>Pos:</label><span>{points[selectedIndex].pos.toFixed(3)}</span>
                            <label>Color:</label>
                            <input
                                type="color"
                                value={rgbToHex(points[selectedIndex].c)}
                                onChange={handleColorChange}
                            />
                            <label>Interp:</label>
                            <select value={points[selectedIndex].interp || hou.rampBasis.Linear} onChange={handleBasisChange}
                            style={{ fontSize: 'smaller'}}>
                                {options()}
                            </select>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ColorRampParm;
