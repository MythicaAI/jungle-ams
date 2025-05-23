import { 
    LucideRocket,
    LucideGem,
    LucideRefreshCw,
    LucideMonitorSmartphone } from 'lucide-react';
import type { JSX } from 'react';

// Value point with icon
export interface ValuePointProps {
    icon: JSX.Element;
    title: string;
    description: string;
    delay?: number;
}

// Value points data
export const valuePoints: ValuePointProps[] = [
    {
        icon: <LucideRocket size={24} />,
        title: 'Accelerated Development',
        description: 'Build and deploy faster with our pre-built components and intuitive design system.',
    },
    {
        icon: <LucideGem size={24} />,
        title: 'Premium Experience',
        description: 'Create stunning UIs that engage users and elevate your brand with minimal effort.',
    },
    {
        icon: <LucideRefreshCw size={24} />,
        title: 'Seamless Integration',
        description: 'Easily integrate with your existing tech stack and third-party services.',
    },
    {
        icon: <LucideMonitorSmartphone size={24} />,
        title: 'Multi-platform Support',
        description: 'Deliver consistent experiences across web, mobile, and desktop platforms.',
    },
];

    // Stats data
export const valueStats = [
    {value: '98%', label: 'Customer Satisfaction'},
    {value: '24/7', label: 'Support Available'},
    {value: '15+', label: 'Integrations'},
    {value: '4x', label: 'Faster Development'},
];

    