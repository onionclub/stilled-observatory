import { useEffect, useRef, useState } from 'react';

export default function CursorMask() {
    const maskRef = useRef(null);
    const [isTouch, setIsTouch] = useState(false);

    useEffect(() => {
        // Detect touch capability to gracefully degrade mask
        if (window.matchMedia("(pointer: coarse)").matches) {
            setIsTouch(true);
            return;
        }

        const updateMask = (e) => {
            const { clientX, clientY } = e;
            if (maskRef.current) {
                maskRef.current.style.setProperty('--x', `${clientX}px`);
                maskRef.current.style.setProperty('--y', `${clientY}px`);
            }
        };

        window.addEventListener('mousemove', updateMask);
        return () => window.removeEventListener('mousemove', updateMask);
    }, []);

    if (isTouch) return null;

    return (
        <div
            ref={maskRef}
            className="frosted-glass"
            style={{
                position: 'fixed',
                inset: 0,
                zIndex: 10,
                pointerEvents: 'none',
                maskImage: 'radial-gradient(circle 250px at var(--x, 50%) var(--y, 50%), transparent 20%, black 100%)',
                WebkitMaskImage: 'radial-gradient(circle 250px at var(--x, 50%) var(--y, 50%), transparent 20%, black 100%)'
            }}
        />
    );
}
