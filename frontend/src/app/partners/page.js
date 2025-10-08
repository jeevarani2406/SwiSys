'use client';

import PartnersPage from "../../components/pages/Partners";
import { useLanguage } from '../../components/ClientLayout';

const partners = [
    "Rebit",
    "Vision",
    "Zeroplus",
    "GTT",
    "HSIN",
    "Tong Tou",
    "Invax",
    "Megawin",
    "Mouser Electronics",
    "Renesas",
    "Cortec",
    "HTBus",
    "Lumssil Microsystems",
];

export default function Partners() {
    const { language } = useLanguage();
    return <PartnersPage language={language} partners={partners} />;
}
