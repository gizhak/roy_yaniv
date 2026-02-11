// i18n Service - Translation & Internationalization
import { utilService } from './util.service.js'

const STORAGE_KEY_LANG = 'userLanguage'
const STORAGE_KEY_THEME = 'userTheme'

const translations = {
    he: {
        nav: {
            home: 'דף הבית',
            about: 'אודות',
            courses: 'קורסים',
            testimonials: 'סטודנטים ממליצים'
        },
        about: {
            title: 'אודותיי',
            intro: 'כתוב כאן על הרקע המקצועי והאקדמי שלך. הניסיון שלך בהוראה, תחומי המומחיות שלך, והפילוסופיה שלך בהוראה.',
            details: 'ספר על השכלתך, הקורסים שאתה מלמד, ומה הופך את שיטת ההוראה שלך לייחודית ואפקטיבית עבור הסטודנטים.'
        },
        courses: {
            title: 'הקורסים שלי',
            button: 'הזמן עכשיו',
            empty: 'אין קורסים להצגה'
        },
        testimonials: {
            title: 'מה הסטודנטים אומרים',
            empty: 'אין המלצות להצגה'
        },
        footer: {
            contact: 'צור קשר',
            rights: 'כל הזכויות שמורות'
        }
    },
    en: {
        nav: {
            home: 'Home',
            about: 'About',
            courses: 'Courses',
            testimonials: 'Student Testimonials'
        },
        about: {
            title: 'About Me',
            intro: 'Write here about your professional and academic background. Your teaching experience, areas of expertise, and your teaching philosophy.',
            details: 'Share your education, the courses you teach, and what makes your teaching method unique and effective for students.'
        },
        courses: {
            title: 'My Courses',
            button: 'Enroll Now',
            empty: 'No courses to display'
        },
        testimonials: {
            title: 'What Students Say',
            empty: 'No testimonials to display'
        },
        footer: {
            contact: 'Contact',
            rights: 'All rights reserved'
        }
    }
}

export const i18nService = {
    getCurrentLanguage,
    setLanguage,
    translate,
    getCurrentTheme,
    setTheme,
    toggleTheme,
    toggleLanguage
}

function getCurrentLanguage() {
    return utilService.loadFromStorage(STORAGE_KEY_LANG) || 'he'
}

function setLanguage(lang) {
    utilService.saveToStorage(STORAGE_KEY_LANG, lang)
    document.documentElement.setAttribute('lang', lang)
    document.documentElement.setAttribute('dir', lang === 'he' ? 'rtl' : 'ltr')
    updatePageTranslations(lang)
    return lang
}

function translate(key, lang = getCurrentLanguage()) {
    const keys = key.split('.')
    let value = translations[lang]

    for (const k of keys) {
        value = value?.[k]
    }

    return value || key
}

function updatePageTranslations(lang) {
    const elements = document.querySelectorAll('[data-i18n]')
    elements.forEach(el => {
        const key = el.getAttribute('data-i18n')
        el.textContent = translate(key, lang)
    })
}

function toggleLanguage() {
    const currentLang = getCurrentLanguage()
    const newLang = currentLang === 'he' ? 'en' : 'he'
    setLanguage(newLang)

    // Update button text
    const langBtn = document.getElementById('lang-toggle')
    if (langBtn) {
        langBtn.textContent = newLang === 'he' ? 'EN' : 'HE'
        langBtn.title = newLang === 'he' ? 'Switch to English' : 'החלף לעברית'
    }

    return newLang
}

function getCurrentTheme() {
    return utilService.loadFromStorage(STORAGE_KEY_THEME) || 'light'
}

function setTheme(theme) {
    utilService.saveToStorage(STORAGE_KEY_THEME, theme)
    document.documentElement.setAttribute('data-theme', theme)

    // Update checkbox state
    const themeToggle = document.getElementById('theme-toggle')
    if (themeToggle) {
        themeToggle.checked = theme === 'dark'
    }

    return theme
}

function toggleTheme() {
    const currentTheme = getCurrentTheme()
    const newTheme = currentTheme === 'light' ? 'dark' : 'light'
    return setTheme(newTheme)
}
