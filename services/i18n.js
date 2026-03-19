import React, { createContext, useState, useContext } from 'react';

const translations = {
    en: {
        welcome: "Hello",
        subtitle: "Explore the University Library",
        search: "Search books, authors, libraries...",
        borrow: "Borrow",
        return: "Return",
        issued: "Issued",
        available: "Available",
        outOfStock: "Out of Stock",
        quickStart: "Quick Start",
        suggested: "Suggested for You",
        currentReadings: "Currently Borrowed",
        digitalResources: "Digital Resources",
        all: "All",
        computerScience: "Computer Science",
        mathematics: "Mathematics",
        softwareEngineering: "Software Engineering",
        literature: "Literature",
        branchManager: "Branch Manager",
        libraryConsole: "Library Console",
        total: "Total",
        ready: "Ready",
        out: "Out",
        addInventory: "Add to Inventory",
        signOut: "Sign Out",
        userGuide: "User Guide",
        systemHealth: "System Health",
        authStatus: "Auth Status",
        superAdmin: "University Controller",
        adminPanelDesc: "Super Admin: Centralized Governance",
        networkHealth: "Network Health",
        live: "LIVE",
        totalAssets: "Total Assets",
        activeUsers: "Active Users",
        branches: "Branches",
        loansOut: "Loans Out",
        utilization: "Utilization",
        branchActivity: "Branch Activity",
        staffManagement: "Staff Management",
        studentPersonnel: "Student Personnel",
        libraryNetwork: "Library Network"
    },
    am: {
        welcome: "ሰላም",
        subtitle: "የዩኒቨርሲቲውን ቤተ-መጻሕፍት ይመርምሩ",
        search: "መጽሐፍትን፣ ደራሲያንን፣ ቤተ-መጻሕፍትን ይፈልጉ...",
        borrow: "ተበደር",
        return: "መልስ",
        issued: "የተሰጠ",
        available: "ይገኛል",
        outOfStock: "የለም",
        quickStart: "ፈጣን ጅምር",
        suggested: "ለእርስዎ የተጠቆመ",
        currentReadings: "በአሁኑ ጊዜ የተበደሩ",
        digitalResources: "ዲጂታል ግብዓቶች",
        all: "ሁሉም",
        computerScience: "የኮምፒውተር ሳይንስ",
        mathematics: "ሒሳብ",
        softwareEngineering: "የሶፍትዌር ምህንድስና",
        literature: "ሥነ-ጽሑፍ",
        branchManager: "የቅርንጫፍ ሥራ አስኪያጅ",
        libraryConsole: "የቤተ-መጻሕፍት መቆጣጠሪያ",
        total: "ጠቅላላ",
        ready: "ዝግጁ",
        out: "ውጭ",
        addInventory: "ወደ ዝርዝር አክል",
        signOut: "ውጣ",
        userGuide: "የተጠቃሚ መመሪያ",
        systemHealth: "የስርዓት ጤና",
        authStatus: "የማረጋገጫ ሁኔታ",
        superAdmin: "የዩኒቨርሲቲ ተቆጣጣሪ",
        adminPanelDesc: "ሱፐር አድሚን፡ ማዕከላዊ አስተዳደር",
        networkHealth: "የኔትወርክ ጤና",
        live: "ቀጥታ",
        totalAssets: "ጠቅላላ ንብረቶች",
        activeUsers: "ንቁ ተጠቃሚዎች",
        branches: "ቅርንጫፎች",
        loansOut: "የተሰጡ ብድሮች",
        utilization: "አጠቃቀም",
        branchActivity: "የቅርንጫፍ እንቅስቃሴ",
        staffManagement: "የሰራተኞች አስተዳደር",
        studentPersonnel: "የተማሪዎች ሁኔታ",
        libraryNetwork: "የቤተ-መጻሕፍት ኔትወርክ"
    }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    const [lang, setLang] = useState('en');

    const t = (key) => {
        return translations[lang][key] || key;
    };

    const toggleLanguage = () => {
        setLang(prev => prev === 'en' ? 'am' : 'en');
    };

    return (
        <LanguageContext.Provider value={{ lang, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    return useContext(LanguageContext);
}
