import React, { useRef, useEffect, useState, useCallback } from 'react';
import hou from '../../types/Houdini';
import { dictionary } from '../../types/Automation';

interface ValueRampPoint {
    x: number;
    y: number;
    interp?: hou.rampBasis;
}

interface ValueRampParmProps {
    template: hou.RampParmTemplate;
    onChange?: (formData: dictionary) => void;
}

// Default to a simple 2-point ramp if none provided
function getDefaultPoints(template: hou.RampParmTemplate): ValueRampPoint[] {
    if (template.default_points && template.default_points.length > 0) {
        return template.default_points.map(p => ({
            x: p.pos,
            y: p.value || 0,
            interp: p.interp
        }));
    }
    return [
        { x: 0, y: 0, interp: hou.rampBasis.Linear },
        { x: 1, y: 1, interp: hou.rampBasis.Linear }
    ];
}

const ValueRampParm: React.FC<ValueRampParmProps> = ({ template, onChange }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasSize = { width: 360, height: 150 };

    const [points, setPoints] = useState<ValueRampPoint[]>(() => getDefaultPoints(template));
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);

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
        ctx.fillStyle = "#444";
        ctx.fillRect(margin, margin, innerWidth, innerHeight);
        ctx.strokeStyle = "#666";
        ctx.strokeRect(margin, margin, innerWidth, innerHeight);

        const sorted = [...points].sort((a, b) => a.x - b.x);

        // Draw line
        ctx.beginPath();
        sorted.forEach((p, i) => {
            const x = p.x * innerWidth + margin;
            const y = margin + innerHeight - p.y * innerHeight;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#007bff';
        ctx.stroke();

        // Fill area
        ctx.beginPath();
        ctx.moveTo(margin + sorted[0].x * innerWidth, margin + innerHeight);
        sorted.forEach((p) => {
            const x = p.x * innerWidth + margin;
            const y = margin + innerHeight - p.y * innerHeight;
            ctx.lineTo(x, y);
        });
        ctx.lineTo(margin + sorted[sorted.length - 1].x * innerWidth, margin + innerHeight);
        ctx.closePath();
        ctx.fillStyle = 'rgba(0,123,255,0.2)';
        ctx.fill();

        // Draw points
        ctx.beginPath();
        sorted.forEach((p) => {
            const x = p.x * innerWidth + margin;
            const y = margin + innerHeight - p.y * innerHeight;
            ctx.moveTo(x + 5, y);
            ctx.arc(x, y, 5, 0, 2 * Math.PI);
        });
        ctx.lineWidth = 1;
        ctx.strokeStyle = '#007bff';
        ctx.stroke();
    }, [points]);

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

        // Check if clicked on a point
        const hitIndex = points.findIndex(p => {
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
                const newPoints = [...points];
                newPoints.splice(hitIndex, 1);
                commitChange(newPoints);
            } else {
                setDraggingIndex(hitIndex);
            }
            return;
        }

        // Add new point on left click
        if (e.button === 0) {
            const nx = (pos.x - margin) / innerWidth;
            const ny = 1 - ((pos.y - margin) / innerHeight);
            if (nx >= 0 && nx <= 1 && ny >= 0 && ny <= 1) {
                const newPoint = { x: nx, y: ny };
                const newPoints = [...points, newPoint].sort((a,b) => a.x - b.x);
                commitChange(newPoints);
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
        newPoints[draggingIndex] = { x: nx, y: ny };
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
                        {/* Add UI elements for interpolation type, etc. */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ValueRampParm;
