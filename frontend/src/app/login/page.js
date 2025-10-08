'use client';

import LoginPage from "../../components/pages/Login";
import { useLanguage } from '../../components/ClientLayout';

export default function Login() {
    const { language } = useLanguage();
    return <LoginPage language={language} />;
}
