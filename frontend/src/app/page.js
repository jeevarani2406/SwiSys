'use client';

import HomePage from "../components/pages/Home";
import { useLanguage } from '../components/ClientLayout';

export default function Home() {
    const { language } = useLanguage();
    return <HomePage language={language} />;
}
