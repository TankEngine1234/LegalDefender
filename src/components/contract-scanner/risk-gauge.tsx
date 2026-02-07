import { motion } from "framer-motion";

interface RiskScoreGaugeProps {
    score: number;
    grade: string;
}

export function RiskScoreGauge({ score, grade }: RiskScoreGaugeProps) {
    const circumference = 2 * Math.PI * 80; // radius = 80
    const offset = circumference - (score / 100) * circumference;

    const getGradeColor = (g: string) => {
        const letter = g.charAt(0).toUpperCase();
        const colors: Record<string, string> = {
            'A': '#00FF88',
            'B': '#00D9FF',
            'C': '#FFB800',
            'D': '#FF8800',
            'F': '#FF3366',
        };
        return colors[letter] || '#FFB800';
    };

    return (
        <div className="relative w-[200px] h-[200px] mx-auto">
            <svg width="200" height="200" viewBox="0 0 200 200" className="transform -rotate-90">
                <circle
                    cx="100"
                    cy="100"
                    r="80"
                    stroke="#E1E8ED"
                    strokeWidth="20"
                    fill="none"
                />
                <motion.circle
                    cx="100"
                    cy="100"
                    r="80"
                    stroke={getGradeColor(grade)}
                    strokeWidth="20"
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div
                    className="text-5xl font-bold transition-colors duration-500"
                    style={{ color: getGradeColor(grade) }}
                >
                    {grade}
                </div>
                <div className="text-2xl font-bold text-[var(--text-secondary)]">
                    {score}
                </div>
                <div className="text-sm text-[var(--text-secondary)] font-mono">
                    / 100
                </div>
            </div>
        </div>
    );
}
