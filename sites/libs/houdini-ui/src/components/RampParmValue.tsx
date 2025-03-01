import React, { useRef, useEffect, useState, useCallback } from 'react';
import hou,{ dictionary } from '../types/Houdini';


interface ValueRampPoint {
    x: number;
    y: number;
    interp?: hou.rampBasis;
}

export interface ValueRampParmProps {
    template: hou.RampParmTemplate;
    data: dictionary;
    onChange?: (formData: dictionary) => void;
}

// Default to a simple 2-point ramp if none provided
function getDefaultPoints(template: hou.RampParmTemplate, data: dictionary): ValueRampPoint[] {
    if (data[template.name]) {
        return data[template.name] as ValueRampPoint[];
    }

    if (template.default_points && template.default_points.length > 0) {
        return template.default_points.map(p => ({
            x: p.pos,
            y: p.value || 0,
            interp: p.interp || hou.rampBasis.Linear
        }));
    }
    return [
        { x: 0, y: 0, interp: hou.rampBasis.Linear },
        { x: 1, y: 1, interp: hou.rampBasis.Linear }
    ];
}

const rampColor = 'rgb(0,123,255)';
const rampShadeColor = 'rgba(0,123,255,0.2)';
const selectedColor = 'rgb(255,255,0)';
const rampBackgroundColor = 'rgb(68,68,68)';
const rampLineColor = 'rgb(102,102,102)';

export const ValueRampParm: React.FC<ValueRampParmProps> = ({ template, data, onChange }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasSize = { width: 360, height: 150 };

    const [points, setPoints] = useState<ValueRampPoint[]>(() => getDefaultPoints(template,data));
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(0);

    const commitChange = useCallback((newPoints: ValueRampPoint[]) => {
        setPoints(newPoints);
        const ret: { [key: string]: ValueRampPoint[] } = {};
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

        const margin = 15;
        const innerWidth = width - margin * 2;
        const innerHeight = height - margin * 2;

        // Background
        ctx.fillStyle = rampBackgroundColor;
        ctx.fillRect(margin, margin, innerWidth, innerHeight);
        ctx.strokeStyle = rampLineColor;
        ctx.strokeRect(margin, margin, innerWidth, innerHeight);

        const sorted = [...points].sort((a, b) => a.x - b.x);

        if (sorted.length > 0) {
            const first = sorted[0];
            const last = sorted[sorted.length - 1];

            // Draw line
            ctx.beginPath();
            // Start from x=0
            const startY = margin + innerHeight - first.y * innerHeight;

            // Move from x=0
            ctx.moveTo(margin, startY);

            // If first.x > 0, draw horizontal line to first point
            if (first.x > 0) {
                const firstX = first.x * innerWidth + margin;
                ctx.lineTo(firstX, startY);
            }

            // Draw through the points
            sorted.forEach((p) => {
                const x = p.x * innerWidth + margin;
                const y = margin + innerHeight - p.y * innerHeight;
                ctx.lineTo(x, y);
            });

            // If last.x < 1, continue line horizontally at last.y to x=1
            if (last.x < 1) {
                const endY = margin + innerHeight - last.y * innerHeight;
                const endX = margin + innerWidth;
                ctx.lineTo(endX, endY);
            }

            ctx.lineWidth = 2;
            ctx.strokeStyle = rampColor;
            ctx.stroke();

            // Fill area under the curve
            ctx.beginPath();
            ctx.moveTo(margin, margin + innerHeight); // bottom-left corner

            // If first.x > 0, fill from 0 to first.x at first.y
            if (first.x > 0) {
                ctx.lineTo(margin, startY);
                const firstActualX = first.x * innerWidth + margin;
                ctx.lineTo(firstActualX, startY);
            } else {
                // Move directly to first point
                const firstX = first.x * innerWidth + margin;
                const firstY = margin + innerHeight - first.y * innerHeight;
                ctx.lineTo(firstX, firstY);
            }

            sorted.forEach((p) => {
                const x = p.x * innerWidth + margin;
                const y = margin + innerHeight - p.y * innerHeight;
                ctx.lineTo(x, y);
            });

            // If last.x < 1, fill horizontally to x=1 at last.y
            if (last.x < 1) {
                const endY = margin + innerHeight - last.y * innerHeight;
                const endX = margin + innerWidth;
                ctx.lineTo(endX, endY);
                ctx.lineTo(endX, margin + innerHeight);
            } else {
                // close at the last point down to the bottom
                const lastX = last.x * innerWidth + margin;
                ctx.lineTo(lastX, margin + innerHeight);
            }

            ctx.closePath();
            ctx.fillStyle = rampShadeColor;
            ctx.fill();

            // Draw points
            sorted.forEach((p) => {
                const x = p.x * innerWidth + margin;
                const y = margin + innerHeight - p.y * innerHeight;

                ctx.beginPath();
                ctx.arc(x, y, 5, 0, 2 * Math.PI);
                ctx.lineWidth = 1;
                ctx.strokeStyle = rampColor;
                ctx.stroke();

                // Highlight selected point if this matches the selected index
                // Note: we need to find the corresponding original index from sorted
                const originalIndex = points.indexOf(p);
                if (selectedIndex !== null && originalIndex === selectedIndex) {
                    ctx.beginPath();
                    ctx.arc(x, y, 6, 0, 2 * Math.PI);
                    ctx.lineWidth = 2;
                    ctx.strokeStyle = selectedColor;
                    ctx.stroke();
                }
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

    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getMousePos(e);
        const {width, height} = canvasSize;
        const margin = 15;
        const innerWidth = width - margin*2;
        const innerHeight = height - margin*2;

        const sorted = [...points].sort((a,b) => a.x - b.x);

        // Check if clicked on a point
        const hitIndex = sorted.findIndex(p => {
            const px = p.x * innerWidth + margin;
            const py = margin + innerHeight - p.y * innerHeight;
            const dx = px - pos.x;
            const dy = py - pos.y;
            return Math.sqrt(dx*dx + dy*dy) < 6;
        });

        if (hitIndex !== -1) {
            // If right-click and more than two points, remove
            if (e.button === 2 && points.length > 2) {
                e.preventDefault();
                const newPoints = [...points].sort((a,b) => a.x - b.x);
                newPoints.splice(hitIndex, 1);
                commitChange(newPoints);
                setSelectedIndex(null);
            } else {
                // Left-click select point and potentially drag
                const originalIndex = points.indexOf(sorted[hitIndex]);
                if (e.button === 0) {
                    // Just a left-click: select the point
                    setSelectedIndex(originalIndex);
                    // Also allow dragging
                    setDraggingIndex(originalIndex);
                }
            }
            return;
        }

        // If clicked not on a point:
        // Add new point on left click if within range
        if (e.button === 0) {
            const nx = (pos.x - margin) / innerWidth;
            const ny = 1 - ((pos.y - margin) / innerHeight);
            if (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1) {
                const newPoint: ValueRampPoint = { x: nx, y: ny, interp: hou.rampBasis.Linear };
                const newPoints = [...points, newPoint].sort((a,b) => a.x - b.x);
                commitChange(newPoints);
                const idx = newPoints.indexOf(newPoint);
                setSelectedIndex(idx);
            } else {
                // If clicked outside range, deselect any selected point
                setSelectedIndex(null);
            }
        }
    };

    const onMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (draggingIndex === null) return;
        const pos = getMousePos(e);
        const {width, height} = canvasSize;
        const margin = 15;
        const innerWidth = width - margin*2;
        const innerHeight = height - margin*2;

        let nx = (pos.x - margin) / innerWidth;
        let ny = 1 - ((pos.y - margin) / innerHeight);

        nx = Math.max(0, Math.min(1, nx));
        ny = Math.max(0, Math.min(1, ny));

        const newPoints = [...points];
        newPoints[draggingIndex] = { ...newPoints[draggingIndex], x: nx, y: ny };
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
                    width={canvasSize.width}
                    height={canvasSize.height}
                    style={{ border: '1px solid #ccc', display: 'block', cursor: draggingIndex !== null ? 'grabbing' : 'crosshair'}}
                    onMouseDown={onMouseDown}
                    onMouseMove={onMouseMove}
                    onMouseUp={onMouseUp}
                    onMouseLeave={onMouseUp}
                    onContextMenu={onContextMenu}
                />
                {template.show_controls && selectedIndex !== null && (
                    <div className="ramp-controls" style={{ marginTop: '10px' }}>
                        <label>Interpolation:</label>
                        <select value={points[selectedIndex].interp || hou.rampBasis.Linear} onChange={handleBasisChange}>
                            { options() }
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ValueRampParm;
