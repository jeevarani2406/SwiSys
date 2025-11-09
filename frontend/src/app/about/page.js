'use client';

import AboutPage from "@/components/pages/About";
import { useLanguage } from '@/components/ClientLayout';

export default function About() {
    const { language } = useLanguage();
    return <AboutPage language={language} />;
}
