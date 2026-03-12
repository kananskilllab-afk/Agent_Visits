import React from 'react';
import { Check } from 'lucide-react';

const defaultSteps = [
    'Meta', 'Profile', 'Team', 'Ops', 'Enquiry', 'Partnership', 'Challenges', 'Support', 'Summary'
];

const StepIndicator = ({ currentStep, steps = defaultSteps }) => {
    const scrollContainerRef = React.useRef(null);

    React.useEffect(() => {
        if (scrollContainerRef.current) {
            const activeElement = scrollContainerRef.current.children[currentStep];
            if (activeElement) {
                const containerWidth = scrollContainerRef.current.offsetWidth;
                const elementOffset = activeElement.offsetLeft;
                const elementWidth = activeElement.offsetWidth;
                
                scrollContainerRef.current.scrollTo({
                    left: elementOffset - (containerWidth / 2) + (elementWidth / 2),
                    behavior: 'smooth'
                });
            }
        }
    }, [currentStep]);

    return (
        <div className="mb-8 w-full">
            <div 
                ref={scrollContainerRef}
                className="flex items-start overflow-x-auto pb-6 no-scrollbar snap-x touch-pan-x px-4"
            >
                {steps.map((label, index) => {
                    const isCompleted = index < currentStep;
                    const isActive = index === currentStep;

                    return (
                        <div 
                            key={label} 
                            className="flex flex-col items-center flex-none w-24 relative snap-center"
                        >
                            {/* Connector Line */}
                            {index !== 0 && (
                                <div
                                    className={`absolute h-0.5 w-full top-5 -left-1/2 z-0 ${
                                        isCompleted ? 'bg-kanan-blue' : 'bg-slate-100'
                                    }`}
                                />
                            )}

                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-all duration-300 relative shadow-sm ${
                                    isCompleted ? 'bg-kanan-blue text-white' :
                                    isActive ? 'bg-kanan-navy text-white ring-4 ring-kanan-navy/10' :
                                    'bg-white border-2 border-slate-100 text-slate-400'
                                }`}
                            >
                                {isCompleted ? <Check className="w-5 h-5" /> : index + 1}
                            </div>

                            <span className={`mt-3 text-[10px] font-bold uppercase tracking-wider text-center px-1 break-words transition-colors ${
                                isActive ? 'text-kanan-navy' : 'text-slate-400'
                            }`}>
                                {label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StepIndicator;
