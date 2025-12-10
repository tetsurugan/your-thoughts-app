import { Scale, CreditCard, Stethoscope, Briefcase, FileText, Lock, HelpCircle } from 'lucide-react';

interface CategoryIconProps {
    category: string;
    className?: string;
}

export const CategoryIcon = ({ category, className = "w-6 h-6" }: CategoryIconProps) => {
    const lowerCat = category.toLowerCase();

    if (lowerCat.includes('probation')) return <Lock className={`${className} text-red-600`} />;
    if (lowerCat.includes('court')) return <Scale className={`${className} text-blue-700`} />;
    if (lowerCat.includes('benefits') || lowerCat.includes('food')) return <CreditCard className={`${className} text-green-600`} />;
    if (lowerCat.includes('medical') || lowerCat.includes('health')) return <Stethoscope className={`${className} text-teal-600`} />;
    if (lowerCat.includes('work') || lowerCat.includes('job')) return <Briefcase className={`${className} text-orange-600`} />;
    if (lowerCat.includes('other')) return <FileText className={`${className} text-slate-500`} />;

    return <HelpCircle className={`${className} text-slate-400`} />;
};
