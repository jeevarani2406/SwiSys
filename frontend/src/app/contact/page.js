'use client';

import ContactPage from "../../components/pages/Contact";
import { useLanguage } from '../../components/ClientLayout';

export default function Contact() {
    const { language } = useLanguage();
    return <ContactPage language={language} />;
}
