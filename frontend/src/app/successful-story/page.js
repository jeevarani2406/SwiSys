'use client';

import SuccessfulStory from "../../components/pages/SuccessfulStory";
import { useLanguage } from '../../components/ClientLayout';

export default function Story() {
    const { language } = useLanguage();
    return <SuccessfulStory language={language} />;
}
