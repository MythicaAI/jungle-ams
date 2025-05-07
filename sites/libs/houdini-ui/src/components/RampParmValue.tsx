import React, { useRef, useEffect, useState, useCallback } from 'react';
import hou,{ dictionary } from '../types/Houdini';


interface ValueRampPoint {
    pos: number;
    value: number;
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
            pos: p.pos,
            value: p.value || 0,
            interp: p.interp || hou.rampBasis.Linear
        }));
    }
    return [
        { pos: 0, value: 0, interp: hou.rampBasis.Linear },
        { pos: 1, value: 1, interp: hou.rampBasis.Linear }
    ];
}

const rampColor = 'rgb(0,123,255)';
const rampShadeColor = 'rgba(0,123,255,0.2)';
const selectedColor = 'rgb(255,255,0)';
const rampBackgroundColor = 'rgb(68,68,68)';
const rampLineColor = 'rgb(102,102,102)';

// Helper functions for interpolation
const interpolate = {
    Linear: (t: number, p0: number, p1: number): number => {
        return p0 + t * (p1 - p0);
    },
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Constant: (_t: number, p0: number, _p1: number): number => {
        return p0;
    },
    CatmullRom: (t: number, p0: number, p1: number, p2: number, p3: number): number => {
        const t2 = t * t;
        const t3 = t2 * t;
        return 0.5 * (
            (2 * p1) +
            (-p0 + p2) * t +
            (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 +
            (-p0 + 3 * p1 - 3 * p2 + p3) * t3
        );
    },
    MonotoneCubic: (t: number, p0: number, p1: number, m0: number, m1: number): number => {
        const t2 = t * t;
        const t3 = t2 * t;
        return (2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * p1 + (t3 - t2) * m1;
    },
    Bezier: (t: number, p0: number, p1: number, p2: number, p3: number): number => {
        const t2 = t * t;
        const t3 = t2 * t;
        const mt = 1 - t;
        const mt2 = mt * mt;
        const mt3 = mt2 * mt;
        return mt3 * p0 + 3 * mt2 * t * p1 + 3 * mt * t2 * p2 + t3 * p3;
    },
    BSpline: (t: number, p0: number, p1: number, p2: number, p3: number): number => {
        const t2 = t * t;
        const t3 = t2 * t;
        return (1/6) * (
            (-t3 + 3 * t2 - 3 * t + 1) * p0 +
            (3 * t3 - 6 * t2 + 4) * p1 +
            (-3 * t3 + 3 * t2 + 3 * t + 1) * p2 +
            t3 * p3
        );
    },
    Hermite: (t: number, p0: number, p1: number, m0: number, m1: number): number => {
        const t2 = t * t;
        const t3 = t2 * t;
        return (2 * t3 - 3 * t2 + 1) * p0 + (t3 - 2 * t2 + t) * m0 + (-2 * t3 + 3 * t2) * p1 + (t3 - t2) * m1;
    }
};

// Function to calculate slope for monotone cubic interpolation
const calculateSlopes = (points: ValueRampPoint[]): number[] => {
    const n = points.length;
    const slopes: number[] = new Array(n).fill(0);
    
    if (n <= 1) return slopes;
    
    // Calculate secant slopes
    const deltaX: number[] = new Array(n - 1);
    const deltaY: number[] = new Array(n - 1);
    
    for (let i = 0; i < n - 1; i++) {
        deltaX[i] = points[i + 1].pos - points[i].pos;
        deltaY[i] = points[i + 1].value - points[i].value;
    }
    
    // Handle boundary cases
    slopes[0] = deltaY[0] / deltaX[0];
    slopes[n - 1] = deltaY[n - 2] / deltaX[n - 2];
    
    // Handle interior points
    for (let i = 1; i < n - 1; i++) {
        const m1 = deltaY[i - 1] / deltaX[i - 1];
        const m2 = deltaY[i] / deltaX[i];
        
        // If signs are different or either is zero, set slope to zero
        if (m1 * m2 <= 0) {
            slopes[i] = 0;
        } else {
            // Use harmonic mean of slopes
            slopes[i] = 2 / (1/m1 + 1/m2);
        }
    }
    
    return slopes;
};

export const ValueRampParm: React.FC<ValueRampParmProps> = ({ template, data, onChange }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const canvasSize = { width: 300, height: 150 };

    const [points, setPoints] = useState<ValueRampPoint[]>(() => getDefaultPoints(template,data));
    const [draggingIndex, setDraggingIndex] = useState<number | null>(null);
    const [selectedIndex, setSelectedIndex] = useState<number | null>(0);

    useEffect(() => {
        const myData = data[template.name] as ValueRampPoint[] || null;
        if (myData) {
            setPoints(myData);
        }
    }, [data[template.name]]);
        
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

        const sorted = [...points].sort((a, b) => a.pos - b.pos);

        if (sorted.length > 0) {
            const first = sorted[0];
            const last = sorted[sorted.length - 1];

            // Draw line
            ctx.beginPath();
            
            // Start from x=0
            const startY = margin + innerHeight - first.value * innerHeight;
            ctx.moveTo(margin, startY);

            // If first.pos > 0, draw horizontal line to first point
            if (first.pos > 0) {
                const firstX = first.pos * innerWidth + margin;
                ctx.lineTo(firstX, startY);
            }

            // Pre-calculate slopes for monotone cubic and hermite interpolation
            const slopes = calculateSlopes(sorted);
            
            // Draw curves between points
            for (let i = 0; i < sorted.length - 1; i++) {
                const p0 = sorted[i];
                const p1 = sorted[i + 1];
                
                const x0 = p0.pos * innerWidth + margin;
                const y0 = margin + innerHeight - p0.value * innerHeight;
                const x1 = p1.pos * innerWidth + margin;
                const y1 = margin + innerHeight - p1.value * innerHeight;
                
                const interp = p0.interp || hou.rampBasis.Linear;
                
                if (interp === hou.rampBasis.Constant) {
                    // Draw horizontal then vertical line (step function)
                    ctx.lineTo(x1, y0);
                    ctx.lineTo(x1, y1);
                } else if (interp === hou.rampBasis.Linear) {
                    // Simple straight line
                    ctx.lineTo(x1, y1);
                } else {
                    // For spline interpolations
                    const STEPS = 20; // Adjust for smoother curves
                    
                    // Get previous and next points for context (for splines that need more points)
                    const prev = i > 0 ? sorted[i - 1] : {
                        pos: p0.pos - (p1.pos - p0.pos),
                        value: p0.value
                    };
                    const next = i < sorted.length - 2 ? sorted[i + 2] : {
                        pos: p1.pos + (p1.pos - p0.pos),
                        value: p1.value
                    };
                    
                    for (let step = 1; step <= STEPS; step++) {
                        const t = step / STEPS;
                        const screenX = x0 + (x1 - x0) * t;
                        let screenY;
                        
                        if (interp === hou.rampBasis.CatmullRom) {
                            const val = interpolate.CatmullRom(
                                t, 
                                prev.value, 
                                p0.value, 
                                p1.value, 
                                next.value
                            );
                            screenY = margin + innerHeight - val * innerHeight;
                        } else if (interp === hou.rampBasis.MonotoneCubic) {
                            const m0 = slopes[i] * (p1.pos - p0.pos);
                            const m1 = slopes[i + 1] * (p1.pos - p0.pos);
                            const val = interpolate.MonotoneCubic(t, p0.value, p1.value, m0, m1);
                            screenY = margin + innerHeight - val * innerHeight;
                        } else if (interp === hou.rampBasis.Bezier) {
                            // Use control points at 1/3 distances for this simple implementation
                            const cp1 = p0.value + (p1.value - prev.value) / 3;
                            const cp2 = p1.value - (next.value - p0.value) / 3;
                            const val = interpolate.Bezier(t, p0.value, cp1, cp2, p1.value);
                            screenY = margin + innerHeight - val * innerHeight;
                        } else if (interp === hou.rampBasis.BSpline) {
                            const val = interpolate.BSpline(t, prev.value, p0.value, p1.value, next.value);
                            screenY = margin + innerHeight - val * innerHeight;
                        } else if (interp === hou.rampBasis.Hermite) {
                            const m0 = slopes[i];
                            const m1 = slopes[i + 1];
                            const val = interpolate.Hermite(t, p0.value, p1.value, m0, m1);
                            screenY = margin + innerHeight - val * innerHeight;
                        } else {
                            // Fallback to linear for any unimplemented types
                            const val = interpolate.Linear(t, p0.value, p1.value);
                            screenY = margin + innerHeight - val * innerHeight;
                        }
                        
                        ctx.lineTo(screenX, screenY);
                    }
                }
            }

            // If last.pos < 1, continue line horizontally at last.y to x=1
            if (last.pos < 1) {
                const endY = margin + innerHeight - last.value * innerHeight;
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
            if (first.pos > 0) {
                ctx.lineTo(margin, startY);
                const firstActualX = first.pos * innerWidth + margin;
                ctx.lineTo(firstActualX, startY);
            } else {
                // Move directly to first point
                const firstX = first.pos * innerWidth + margin;
                const firstY = margin + innerHeight - first.value * innerHeight;
                ctx.lineTo(firstX, firstY);
            }

            // Redraw the same curve for filling
            for (let i = 0; i < sorted.length - 1; i++) {
                const p0 = sorted[i];
                const p1 = sorted[i + 1];
                
                const x0 = p0.pos * innerWidth + margin;
                const y0 = margin + innerHeight - p0.value * innerHeight;
                const x1 = p1.pos * innerWidth + margin;
                const y1 = margin + innerHeight - p1.value * innerHeight;
                
                const interp = p0.interp || hou.rampBasis.Linear;
                
                if (interp === hou.rampBasis.Constant) {
                    ctx.lineTo(x1, y0);
                    ctx.lineTo(x1, y1);
                } else if (interp === hou.rampBasis.Linear) {
                    ctx.lineTo(x1, y1);
                } else {
                    // Same spline code as above for drawing the fill
                    const STEPS = 20;
                    const prev = i > 0 ? sorted[i - 1] : {
                        pos: p0.pos - (p1.pos - p0.pos),
                        value: p0.value
                    };
                    const next = i < sorted.length - 2 ? sorted[i + 2] : {
                        pos: p1.pos + (p1.pos - p0.pos),
                        value: p1.value
                    };
                    
                    for (let step = 1; step <= STEPS; step++) {
                        const t = step / STEPS;
                        const screenX = x0 + (x1 - x0) * t;
                        let screenY;
                        
                        if (interp === hou.rampBasis.CatmullRom) {
                            const val = interpolate.CatmullRom(t, prev.value, p0.value, p1.value, next.value);
                            screenY = margin + innerHeight - val * innerHeight;
                        } else if (interp === hou.rampBasis.MonotoneCubic) {
                            const m0 = slopes[i] * (p1.pos - p0.pos);
                            const m1 = slopes[i + 1] * (p1.pos - p0.pos);
                            const val = interpolate.MonotoneCubic(t, p0.value, p1.value, m0, m1);
                            screenY = margin + innerHeight - val * innerHeight;
                        } else if (interp === hou.rampBasis.Bezier) {
                            const cp1 = p0.value + (p1.value - prev.value) / 3;
                            const cp2 = p1.value - (next.value - p0.value) / 3;
                            const val = interpolate.Bezier(t, p0.value, cp1, cp2, p1.value);
                            screenY = margin + innerHeight - val * innerHeight;
                        } else if (interp === hou.rampBasis.BSpline) {
                            const val = interpolate.BSpline(t, prev.value, p0.value, p1.value, next.value);
                            screenY = margin + innerHeight - val * innerHeight;
                        } else if (interp === hou.rampBasis.Hermite) {
                            const m0 = slopes[i];
                            const m1 = slopes[i + 1];
                            const val = interpolate.Hermite(t, p0.value, p1.value, m0, m1);
                            screenY = margin + innerHeight - val * innerHeight;
                        } else {
                            const val = interpolate.Linear(t, p0.value, p1.value);
                            screenY = margin + innerHeight - val * innerHeight;
                        }
                        
                        ctx.lineTo(screenX, screenY);
                    }
                }
            }

            // If last.x < 1, fill horizontally to x=1 at last.y
            if (last.pos < 1) {
                const endY = margin + innerHeight - last.value * innerHeight;
                const endX = margin + innerWidth;
                ctx.lineTo(endX, endY);
                ctx.lineTo(endX, margin + innerHeight);
            } else {
                // close at the last point down to the bottom
                const lastX = last.pos * innerWidth + margin;
                ctx.lineTo(lastX, margin + innerHeight);
            }

            ctx.closePath();
            ctx.fillStyle = rampShadeColor;
            ctx.fill();

            // Draw points
            sorted.forEach((p) => {
                const x = p.pos * innerWidth + margin;
                const y = margin + innerHeight - p.value * innerHeight;

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

        const sorted = [...points].sort((a,b) => a.pos - b.pos);

        // Check if clicked on a point
        const hitIndex = sorted.findIndex(p => {
            const px = p.pos * innerWidth + margin;
            const py = margin + innerHeight - p.value * innerHeight;
            const dx = px - pos.x;
            const dy = py - pos.y;
            return Math.sqrt(dx*dx + dy*dy) < 6;
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
                const newPoint: ValueRampPoint = { pos: nx, value: ny, interp: hou.rampBasis.Linear };
                const newPoints = [...points, newPoint].sort((a,b) => a.pos - b.pos);
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
        newPoints[draggingIndex] = { ...newPoints[draggingIndex], pos: nx, value: ny };
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
                    <div className="ramp-controls" 
                         style={{marginTop: '10px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: 'smaller', justifyContent: 'center'}}>
                        <label>Pos:</label><span>{points[selectedIndex].pos.toFixed(3)}</span>
                        <label>Value:</label><span>{points[selectedIndex].value.toFixed(3)}</span>
                        <label>Interp:</label>
                        <select value={points[selectedIndex].interp || hou.rampBasis.Linear} onChange={handleBasisChange}
                        style={{ fontSize: 'smaller'}}>
                            { options() }
                        </select>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ValueRampParm;
