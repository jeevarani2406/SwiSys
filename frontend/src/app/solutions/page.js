'use client';

import SolutionsPage from "../../components/pages/Solutions";
import { useLanguage } from '../../components/ClientLayout';

export default function Solutions() {
    const { language } = useLanguage();
    return <SolutionsPage language={language} />;
}
