import React, { useRef, useEffect, useState, useCallback } from 'react';
import hou from '../../types/Houdini'; // Adjust import paths as necessary
import { dictionary } from '../../types/Automation';

interface RampPoint {
    x: number;
    y: number;
}

interface RampParmProps {
    template: hou.RampParmTemplate;
    onChange?: (formData: dictionary) => void;
}

// Default to a simple 2-point ramp if none provided
function getDefaultPoints(): RampPoint[] {
    return [
        { x: 0, y: 0 },
        { x: 1, y: 1 }
    ];
}

const RampParm: React.FC<RampParmProps> = ({ template, onChange }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [points, setPoints] = useState<RampPoint[]>(() => {
        return getDefaultPoints();
    });

    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const canvasSize = {width: 300, height: 150};


    const commitChange = useCallback((newPoints: RampPoint[]) => {
        setPoints(newPoints);
        const ret: { [key: string]: RampPoint[] } = {};
        ret[template.name] = newPoints;
        onChange?.(ret);
    }, [onChange, template.name]);

    // Drawing the ramp
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

        // Draw background
        ctx.fillStyle = "#444";
        ctx.fillRect(margin, margin, innerWidth, innerHeight);
        ctx.strokeStyle = "#666";
        ctx.strokeRect(margin, margin, innerWidth, innerHeight);

        // Sort points by x
        const sorted = [...points].sort((a, b) => a.x - b.x);

        // Draw line
        ctx.beginPath();
        sorted.forEach((p, i) => {
            const x = p.x * innerWidth + margin;
            const y = margin + innerHeight - p.y * innerHeight;
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        ctx.lineWidth = 2;
        ctx.strokeStyle = '#007bff';
        ctx.stroke();

        // Fill area under curve
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

    // Event handlers
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
    }

    const onMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const pos = getMousePos(e);
        const {width, height} = canvasSize;
        const margin = 15;
        const innerWidth = width - margin*2;
        const innerHeight = height - margin*2;

        // Check if we clicked on a point
        const hitIndex = points.findIndex(p => {
            const px = p.x * innerWidth + margin;
            const py = margin + innerHeight - p.y * innerHeight;
            const dx = px - pos.x;
            const dy = py - pos.y;
            return Math.sqrt(dx*dx + dy*dy) < 6; // 6px radius
        });

        if (hitIndex !== -1) {
            // If right-click, remove point (if more than 2 points)
            if (e.button === 2 && points.length > 2) {
                e.preventDefault();
                const newPoints = [...points];
                newPoints.splice(hitIndex, 1);
                commitChange(newPoints);
            } else {
                // Begin drag
                setDraggingIndex(hitIndex);
            }
            return;
        }

        // Left click empty space to add a point
        if (e.button === 0) {
            // Convert back to normalized coordinates
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

        // Clamp to [0,1]
        nx = Math.max(0, Math.min(1, nx));
        ny = Math.max(0, Math.min(1, ny));

        const newPoints = [...points];
        newPoints[draggingIndex] = { x: nx, y: ny };
        setPoints(newPoints); // Update live while dragging
    };

    const onMouseUp = () => {
        if (draggingIndex !== null) {
            commitChange(points);
            setDraggingIndex(null);
        }
    };

    const onContextMenu = (e: React.MouseEvent) => {
        // Prevent default context menu if we want to do custom logic
        e.preventDefault();
    };

    // Handle resizing if needed
    useEffect(() => {
        // Optional: dynamically resize or keep fixed size
        // For now, fixed size.
    }, []);

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
                        {/* You can add UI elements here for changing rampBasis, color_type, etc. */}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RampParm;
